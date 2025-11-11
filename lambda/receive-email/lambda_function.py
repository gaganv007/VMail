import json
import boto3
import os
import email
from datetime import datetime
from email import policy

# Initialize AWS clients
dynamodb = boto3.resource('dynamodb', region_name=os.environ.get('AWS_REGION', 'us-east-1'))
s3 = boto3.client('s3', region_name=os.environ.get('AWS_REGION', 'us-east-1'))
sns = boto3.client('sns', region_name=os.environ.get('AWS_REGION', 'us-east-1'))
cognito = boto3.client('cognito-idp', region_name=os.environ.get('AWS_REGION', 'us-east-1'))

# Environment variables
DYNAMODB_TABLE = os.environ.get('DYNAMODB_TABLE', 'vmail-emails')
S3_BUCKET = os.environ.get('S3_BUCKET', 'vmail-emails-bucket')
SNS_TOPIC_ARN = os.environ.get('SNS_TOPIC_ARN')
USER_POOL_ID = os.environ.get('USER_POOL_ID', 'us-east-1_mCoiqnWRI')

def lambda_handler(event, context):
    """
    Lambda function to process incoming emails from SES
    Triggered by S3 events when SES receives an email
    """
    try:
        # Parse S3 event
        for record in event['Records']:
            # Get S3 bucket and key from event
            bucket = record['s3']['bucket']['name']
            key = record['s3']['object']['key']

            print(f"Processing email from S3: {bucket}/{key}")

            # Get email from S3
            response = s3.get_object(Bucket=bucket, Key=key)
            raw_email = response['Body'].read()

            # Parse email
            msg = email.message_from_bytes(raw_email, policy=policy.default)

            # Extract email metadata
            from_address = msg.get('From', '')
            to_addresses = msg.get('To', '').split(',')
            cc_addresses = msg.get('Cc', '').split(',') if msg.get('Cc') else []
            subject = msg.get('Subject', '')
            message_id = msg.get('Message-ID', '')
            date = msg.get('Date', '')

            # Extract body
            body = ''
            attachments = []

            if msg.is_multipart():
                for part in msg.walk():
                    content_type = part.get_content_type()
                    content_disposition = str(part.get('Content-Disposition', ''))

                    # Extract body
                    if content_type == 'text/plain' and 'attachment' not in content_disposition:
                        body = part.get_payload(decode=True).decode('utf-8', errors='ignore')
                    elif content_type == 'text/html' and not body and 'attachment' not in content_disposition:
                        body = part.get_payload(decode=True).decode('utf-8', errors='ignore')

                    # Extract attachments
                    elif 'attachment' in content_disposition:
                        filename = part.get_filename()
                        if filename:
                            attachments.append({
                                'filename': filename,
                                'contentType': content_type,
                                'size': len(part.get_payload(decode=True))
                            })
            else:
                body = msg.get_payload(decode=True).decode('utf-8', errors='ignore')

            # Find recipient user(s) in Cognito
            # Note: In production, you'd query Cognito to get the user ID
            # For now, we'll use the recipient email as the userId
            for to_address in to_addresses:
                to_address = to_address.strip()
                user_id = get_user_id_from_email(to_address)

                if not user_id:
                    print(f"User not found for email: {to_address}")
                    continue

                # Generate unique email ID
                email_id = f"{user_id}-{int(datetime.now().timestamp() * 1000)}"
                timestamp = datetime.now().isoformat()

                # Store full email content in S3
                s3_key = f"emails/{user_id}/{email_id}.json"
                s3.put_object(
                    Bucket=S3_BUCKET,
                    Key=s3_key,
                    Body=json.dumps({
                        'subject': subject,
                        'body': body,
                        'from': from_address,
                        'to': to_addresses,
                        'cc': cc_addresses,
                        'attachments': attachments,
                        'timestamp': timestamp,
                        'messageId': message_id
                    }),
                    ContentType='application/json'
                )

                # Store metadata in DynamoDB
                table = dynamodb.Table(DYNAMODB_TABLE)
                table.put_item(
                    Item={
                        'emailId': email_id,
                        'userId': user_id,
                        'from': from_address,
                        'to': [to_address],
                        'cc': cc_addresses,
                        'subject': subject,
                        'preview': body[:100] if body else '',
                        'timestamp': timestamp,
                        'folder': 'inbox',
                        'read': False,
                        'hasAttachments': len(attachments) > 0,
                        's3Key': s3_key,
                        'messageId': message_id
                    }
                )

                # Send SNS notification
                if SNS_TOPIC_ARN:
                    try:
                        sns.publish(
                            TopicArn=SNS_TOPIC_ARN,
                            Subject='New Email Received',
                            Message=json.dumps({
                                'userId': user_id,
                                'emailId': email_id,
                                'from': from_address,
                                'subject': subject,
                                'timestamp': timestamp
                            })
                        )
                        print(f"SNS notification sent for email {email_id}")
                    except Exception as e:
                        print(f"Error sending SNS notification: {str(e)}")

                print(f"Email processed successfully: {email_id}")

        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Emails processed successfully'})
        }

    except Exception as e:
        print(f"Error processing email: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({
                'message': f'Error processing email: {str(e)}'
            })
        }

def get_user_id_from_email(email_address):
    """
    Get user ID from Cognito based on email address
    """
    try:
        response = cognito.list_users(
            UserPoolId=USER_POOL_ID,
            Filter=f'email = "{email_address}"'
        )

        if response['Users'] and len(response['Users']) > 0:
            # Get the sub (user ID) from attributes
            for attr in response['Users'][0]['Attributes']:
                if attr['Name'] == 'sub':
                    return attr['Value']
            # Fallback to Username
            return response['Users'][0]['Username']

        print(f"No user found for email: {email_address}")
        return None
    except Exception as e:
        print(f"Error looking up user: {str(e)}")
        return None

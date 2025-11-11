import json
import boto3
import os
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
import base64

# Initialize AWS clients
ses = boto3.client('ses', region_name='us-east-1')
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
s3 = boto3.client('s3', region_name='ap-south-2')

# Environment variables
DYNAMODB_TABLE = os.environ.get('DYNAMODB_TABLE', 'vmail-emails')
S3_BUCKET = os.environ.get('S3_BUCKET', 'vmail-emails-bucket')

def lambda_handler(event, context):
    """
    Lambda function to send emails via AWS SES
    """
    try:
        # Parse request body
        body = json.loads(event.get('body', '{}'))

        # Extract user info from Cognito authorizer
        user_email = event['requestContext']['authorizer']['claims']['email']
        user_id = event['requestContext']['authorizer']['claims']['sub']

        # Validate required fields
        to_addresses = body.get('to', [])
        if isinstance(to_addresses, str):
            to_addresses = [to_addresses]

        subject = body.get('subject', '')
        email_body = body.get('body', '')
        cc_addresses = body.get('cc', [])
        bcc_addresses = body.get('bcc', [])
        attachments = body.get('attachments', [])

        if not to_addresses or not subject:
            return {
                'statusCode': 400,
                'headers': get_cors_headers(),
                'body': json.dumps({'message': 'Missing required fields: to, subject'})
            }

        # Generate unique email ID
        email_id = f"{user_id}-{int(datetime.now().timestamp() * 1000)}"
        timestamp = datetime.now().isoformat()

        # Create MIME message
        msg = MIMEMultipart()
        msg['Subject'] = subject
        msg['From'] = user_email
        msg['To'] = ', '.join(to_addresses)

        if cc_addresses:
            msg['Cc'] = ', '.join(cc_addresses)

        # Add body
        msg.attach(MIMEText(email_body, 'plain'))

        # Add attachments
        for attachment in attachments:
            try:
                file_data = base64.b64decode(attachment['data'])
                part = MIMEApplication(file_data)
                part.add_header('Content-Disposition', 'attachment',
                              filename=attachment['filename'])
                msg.attach(part)
            except Exception as e:
                print(f"Error attaching file: {str(e)}")

        # Send email via SES
        all_recipients = to_addresses + cc_addresses + bcc_addresses
        ses_response = ses.send_raw_email(
            Source=user_email,
            Destinations=all_recipients,
            RawMessage={'Data': msg.as_string()}
        )

        # Store email body in S3
        s3_key = f"emails/{user_id}/{email_id}.json"
        s3.put_object(
            Bucket=S3_BUCKET,
            Key=s3_key,
            Body=json.dumps({
                'subject': subject,
                'body': email_body,
                'to': to_addresses,
                'cc': cc_addresses,
                'bcc': bcc_addresses,
                'attachments': attachments,
                'timestamp': timestamp
            }),
            ContentType='application/json'
        )

        # Store metadata in DynamoDB
        table = dynamodb.Table(DYNAMODB_TABLE)
        table.put_item(
            Item={
                'emailId': email_id,
                'userId': user_id,
                'from': user_email,
                'to': to_addresses,
                'cc': cc_addresses,
                'bcc': bcc_addresses,
                'subject': subject,
                'preview': email_body[:100],
                'timestamp': timestamp,
                'folder': 'sent',
                'read': True,
                'hasAttachments': len(attachments) > 0,
                's3Key': s3_key,
                'messageId': ses_response['MessageId']
            }
        )

        return {
            'statusCode': 200,
            'headers': get_cors_headers(),
            'body': json.dumps({
                'message': 'Email sent successfully',
                'emailId': email_id,
                'messageId': ses_response['MessageId']
            })
        }

    except Exception as e:
        print(f"Error sending email: {str(e)}")
        return {
            'statusCode': 500,
            'headers': get_cors_headers(),
            'body': json.dumps({
                'message': f'Error sending email: {str(e)}'
            })
        }

def get_cors_headers():
    """Return CORS headers"""
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PUT,DELETE'
    }

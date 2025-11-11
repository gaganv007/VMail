import json
import boto3
import os
from decimal import Decimal

# Initialize AWS clients
dynamodb = boto3.resource('dynamodb', region_name=os.environ.get('AWS_REGION', 'us-east-1'))
s3 = boto3.client('s3', region_name=os.environ.get('AWS_REGION', 'us-east-1'))

# Environment variables
DYNAMODB_TABLE = os.environ.get('DYNAMODB_TABLE', 'vmail-emails')
S3_BUCKET = os.environ.get('S3_BUCKET', 'vmail-emails-bucket')

class DecimalEncoder(json.JSONEncoder):
    """Helper class to convert DynamoDB Decimal types to int/float"""
    def default(self, obj):
        if isinstance(obj, Decimal):
            return int(obj) if obj % 1 == 0 else float(obj)
        return super(DecimalEncoder, self).default(obj)

def lambda_handler(event, context):
    """
    Lambda function to get a single email by ID
    """
    try:
        # Extract user info from Cognito authorizer
        user_id = event['requestContext']['authorizer']['claims']['sub']

        # Get email ID from path parameters
        email_id = event['pathParameters']['emailId']

        # Get email metadata from DynamoDB
        table = dynamodb.Table(DYNAMODB_TABLE)
        response = table.get_item(
            Key={'emailId': email_id}
        )

        if 'Item' not in response:
            return {
                'statusCode': 404,
                'headers': get_cors_headers(),
                'body': json.dumps({'message': 'Email not found'})
            }

        email_metadata = response['Item']

        # Verify user has access to this email
        if email_metadata.get('userId') != user_id:
            return {
                'statusCode': 403,
                'headers': get_cors_headers(),
                'body': json.dumps({'message': 'Access denied'})
            }

        # Get full email content from S3
        s3_key = email_metadata.get('s3Key')
        if s3_key:
            try:
                s3_response = s3.get_object(Bucket=S3_BUCKET, Key=s3_key)
                email_content = json.loads(s3_response['Body'].read().decode('utf-8'))
            except Exception as e:
                print(f"Error getting email from S3: {str(e)}")
                email_content = {}
        else:
            email_content = {}

        # Combine metadata and content
        full_email = {
            'emailId': email_metadata.get('emailId'),
            'from': email_metadata.get('from'),
            'to': email_metadata.get('to'),
            'cc': email_metadata.get('cc', []),
            'bcc': email_metadata.get('bcc', []),
            'subject': email_metadata.get('subject'),
            'body': email_content.get('body', ''),
            'timestamp': email_metadata.get('timestamp'),
            'read': email_metadata.get('read', False),
            'hasAttachments': email_metadata.get('hasAttachments', False),
            'attachments': email_content.get('attachments', []),
            'folder': email_metadata.get('folder')
        }

        return {
            'statusCode': 200,
            'headers': get_cors_headers(),
            'body': json.dumps(full_email, cls=DecimalEncoder)
        }

    except Exception as e:
        print(f"Error getting email: {str(e)}")
        return {
            'statusCode': 500,
            'headers': get_cors_headers(),
            'body': json.dumps({
                'message': f'Error getting email: {str(e)}'
            })
        }

def get_cors_headers():
    """Return CORS headers"""
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PUT,DELETE'
    }

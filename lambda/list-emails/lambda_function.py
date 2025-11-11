import json
import boto3
import os
from boto3.dynamodb.conditions import Key, Attr
from decimal import Decimal

# Initialize AWS clients
dynamodb = boto3.resource('dynamodb', region_name=os.environ.get('AWS_REGION', 'us-east-1'))

# Environment variables
DYNAMODB_TABLE = os.environ.get('DYNAMODB_TABLE', 'vmail-emails')

class DecimalEncoder(json.JSONEncoder):
    """Helper class to convert DynamoDB Decimal types to int/float"""
    def default(self, obj):
        if isinstance(obj, Decimal):
            return int(obj) if obj % 1 == 0 else float(obj)
        return super(DecimalEncoder, self).default(obj)

def lambda_handler(event, context):
    """
    Lambda function to list emails from DynamoDB
    """
    try:
        # Extract user info from Cognito authorizer
        user_id = event['requestContext']['authorizer']['claims']['sub']

        # Get query parameters
        params = event.get('queryStringParameters') or {}
        folder = params.get('folder', 'inbox')
        limit = int(params.get('limit', 50))

        # Query DynamoDB
        table = dynamodb.Table(DYNAMODB_TABLE)

        # Use GSI (Global Secondary Index) for querying by userId and folder
        response = table.query(
            IndexName='userId-folder-index',
            KeyConditionExpression=Key('userId').eq(user_id) & Key('folder').eq(folder),
            ScanIndexForward=False,  # Sort by timestamp descending
            Limit=limit
        )

        emails = response.get('Items', [])

        # Format emails for frontend
        formatted_emails = []
        for email in emails:
            formatted_emails.append({
                'emailId': email.get('emailId'),
                'from': email.get('from'),
                'to': email.get('to'),
                'subject': email.get('subject'),
                'preview': email.get('preview'),
                'timestamp': email.get('timestamp'),
                'read': email.get('read', False),
                'hasAttachments': email.get('hasAttachments', False),
                'folder': email.get('folder')
            })

        return {
            'statusCode': 200,
            'headers': get_cors_headers(),
            'body': json.dumps({
                'emails': formatted_emails,
                'count': len(formatted_emails)
            }, cls=DecimalEncoder)
        }

    except Exception as e:
        print(f"Error listing emails: {str(e)}")
        return {
            'statusCode': 500,
            'headers': get_cors_headers(),
            'body': json.dumps({
                'message': f'Error listing emails: {str(e)}'
            })
        }

def get_cors_headers():
    """Return CORS headers"""
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PUT,DELETE'
    }

import json
import boto3
import os

# Initialize AWS clients
dynamodb = boto3.resource('dynamodb', region_name=os.environ.get('AWS_REGION', 'us-east-1'))

# Environment variables
DYNAMODB_TABLE = os.environ.get('DYNAMODB_TABLE', 'vmail-emails')

def lambda_handler(event, context):
    """
    Lambda function to toggle star on an email
    """
    try:
        # Extract user info from Cognito authorizer
        user_id = event['requestContext']['authorizer']['claims']['sub']

        # Get email ID from path parameters
        email_id = event['pathParameters']['emailId']

        # Parse request body to get starred status
        body = json.loads(event.get('body', '{}'))
        starred = body.get('starred', True)

        # Get email metadata from DynamoDB
        table = dynamodb.Table(DYNAMODB_TABLE)
        response = table.get_item(Key={'emailId': email_id})

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

        # Toggle starred status
        table.update_item(
            Key={'emailId': email_id},
            UpdateExpression='SET starred = :starred',
            ExpressionAttributeValues={':starred': starred}
        )

        return {
            'statusCode': 200,
            'headers': get_cors_headers(),
            'body': json.dumps({
                'message': 'Email starred status updated',
                'emailId': email_id,
                'starred': starred
            })
        }

    except Exception as e:
        print(f"Error marking email as starred: {str(e)}")
        return {
            'statusCode': 500,
            'headers': get_cors_headers(),
            'body': json.dumps({'message': f'Error: {str(e)}'})
        }

def get_cors_headers():
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PUT,DELETE'
    }

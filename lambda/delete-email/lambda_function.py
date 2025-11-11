import json
import boto3
import os

# Initialize AWS clients
dynamodb = boto3.resource('dynamodb', region_name=os.environ.get('AWS_REGION', 'us-east-1'))
s3 = boto3.client('s3', region_name=os.environ.get('AWS_REGION', 'us-east-1'))

# Environment variables
DYNAMODB_TABLE = os.environ.get('DYNAMODB_TABLE', 'vmail-emails')
S3_BUCKET = os.environ.get('S3_BUCKET', 'vmail-emails-bucket')

def lambda_handler(event, context):
    """
    Lambda function to delete an email or move it to trash
    """
    try:
        # Extract user info from Cognito authorizer
        user_id = event['requestContext']['authorizer']['claims']['sub']

        # Get email ID from path parameters
        email_id = event['pathParameters']['emailId']

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

        # Check if email is already in trash
        if email_metadata.get('folder') == 'trash':
            # Permanently delete
            # Delete from DynamoDB
            table.delete_item(Key={'emailId': email_id})

            # Delete from S3
            s3_key = email_metadata.get('s3Key')
            if s3_key:
                try:
                    s3.delete_object(Bucket=S3_BUCKET, Key=s3_key)
                except Exception as e:
                    print(f"Error deleting from S3: {str(e)}")

            return {
                'statusCode': 200,
                'headers': get_cors_headers(),
                'body': json.dumps({'message': 'Email permanently deleted'})
            }
        else:
            # Move to trash
            table.update_item(
                Key={'emailId': email_id},
                UpdateExpression='SET folder = :folder',
                ExpressionAttributeValues={':folder': 'trash'}
            )

            return {
                'statusCode': 200,
                'headers': get_cors_headers(),
                'body': json.dumps({'message': 'Email moved to trash'})
            }

    except Exception as e:
        print(f"Error deleting email: {str(e)}")
        return {
            'statusCode': 500,
            'headers': get_cors_headers(),
            'body': json.dumps({
                'message': f'Error deleting email: {str(e)}'
            })
        }

def get_cors_headers():
    """Return CORS headers"""
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PUT,DELETE'
    }

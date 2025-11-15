const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
const s3 = new AWS.S3({ region: 'ap-south-2' });

const DYNAMODB_TABLE = process.env.DYNAMODB_TABLE || 'vmail-emails';
const S3_BUCKET = process.env.S3_BUCKET || 'vmail-emails-059409992687';

exports.handler = async (event, context) => {
  console.log('Save draft handler started');
  try {
    // Extract user info from Cognito authorizer
    const userId = event.requestContext.authorizer.claims.sub;
    const userEmail = event.requestContext.authorizer.claims.email;
    console.log('User:', userEmail, 'UserId:', userId);

    // Parse request body
    const body = JSON.parse(event.body);
    const { to, subject, body: emailBody, cc = [], bcc = [], attachments = [], draftId } = body;
    console.log('Saving draft for:', to, 'Subject:', subject);

    // Use provided draftId or generate new one
    const emailId = draftId || `${userId}-draft-${Date.now()}`;
    const timestamp = new Date().toISOString();

    // Store full email in S3
    const s3Key = `drafts/${userId}/${emailId}.json`;
    await s3.putObject({
      Bucket: S3_BUCKET,
      Key: s3Key,
      Body: JSON.stringify({
        subject,
        body: emailBody,
        from: userEmail,
        to: Array.isArray(to) ? to : [to],
        cc,
        bcc,
        attachments,
        timestamp
      }),
      ContentType: 'application/json'
    }).promise();

    // Store metadata in DynamoDB
    console.log('Storing draft in DynamoDB');
    await dynamodb.put({
      TableName: DYNAMODB_TABLE,
      Item: {
        emailId,
        userId,
        from: userEmail,
        to: Array.isArray(to) ? to : [to],
        cc,
        bcc,
        subject,
        preview: emailBody.replace(/<[^>]*>/g, '').substring(0, 100),
        timestamp,
        folder: 'drafts',
        read: true,
        starred: false,
        hasAttachments: attachments.length > 0,
        s3Key,
        isDraft: true
      }
    }).promise();
    console.log('Draft saved successfully');

    return {
      statusCode: 200,
      headers: getCorsHeaders(),
      body: JSON.stringify({
        message: 'Draft saved successfully',
        emailId,
        draftId: emailId
      })
    };
  } catch (error) {
    console.error('Error saving draft:', error);
    return {
      statusCode: 500,
      headers: getCorsHeaders(),
      body: JSON.stringify({
        message: `Error saving draft: ${error.message}`
      })
    };
  }
};

function getCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PUT,DELETE'
  };
}

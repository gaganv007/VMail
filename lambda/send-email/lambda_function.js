const AWS = require('aws-sdk');
const sgMail = require('@sendgrid/mail');

const dynamodb = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
const s3 = new AWS.S3({ region: 'ap-south-2' });

const DYNAMODB_TABLE = process.env.DYNAMODB_TABLE || 'vmail-emails';
const S3_BUCKET = process.env.S3_BUCKET || 'vmail-emails-059409992687';
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@yourdomain.com';

// Initialize SendGrid
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

exports.handler = async (event, context) => {
  try {
    // Extract user info from Cognito authorizer
    const userId = event.requestContext.authorizer.claims.sub;
    const userEmail = event.requestContext.authorizer.claims.email;

    // Parse request body
    const body = JSON.parse(event.body);
    const { to, subject, body: emailBody, cc = [], bcc = [], attachments = [] } = body;

    // Generate unique email ID
    const emailId = `${userId}-${Date.now()}`;
    const timestamp = new Date().toISOString();

    // Prepare email message for SendGrid
    const msg = {
      to: Array.isArray(to) ? to : [to],
      from: {
        email: SENDGRID_FROM_EMAIL,
        name: userEmail
      },
      replyTo: userEmail,
      subject: subject,
      text: emailBody.replace(/<[^>]*>/g, ''),
      html: emailBody
    };

    // Add CC and BCC if provided
    if (cc && cc.length > 0) {
      msg.cc = cc;
    }
    if (bcc && bcc.length > 0) {
      msg.bcc = bcc;
    }

    // Add attachments if provided
    if (attachments && attachments.length > 0) {
      msg.attachments = attachments.map(att => ({
        content: att.data,
        filename: att.filename,
        type: att.contentType,
        disposition: 'attachment'
      }));
    }

    // Send email using SendGrid
    const sendResult = await sgMail.send(msg);
    const messageId = sendResult[0].headers['x-message-id'] || emailId;

    // Store full email in S3
    const s3Key = `emails/${userId}/${emailId}.json`;
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
        timestamp,
        messageId
      }),
      ContentType: 'application/json'
    }).promise();

    // Store metadata in DynamoDB
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
        folder: 'sent',
        read: true,
        hasAttachments: attachments.length > 0,
        s3Key,
        messageId
      }
    }).promise();

    return {
      statusCode: 200,
      headers: getCorsHeaders(),
      body: JSON.stringify({
        message: 'Email sent successfully via SendGrid',
        emailId,
        messageId
      })
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      statusCode: 500,
      headers: getCorsHeaders(),
      body: JSON.stringify({
        message: `Error sending email: ${error.message}`
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

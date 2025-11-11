const AWS = require('aws-sdk');
const nodemailer = require('nodemailer');

const dynamodb = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
const s3 = new AWS.S3({ region: 'ap-south-2' });

const DYNAMODB_TABLE = process.env.DYNAMODB_TABLE || 'vmail-emails';
const S3_BUCKET = process.env.S3_BUCKET || 'vmail-emails-059409992687';

// Gmail SMTP configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || 'cloudmailproject@gmail.com',
    pass: process.env.GMAIL_APP_PASSWORD || 'your-app-password'
  }
});

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

    // Send email using Nodemailer
    const mailOptions = {
      from: `"${userEmail}" <cloudmailproject@gmail.com>`,
      replyTo: userEmail,
      to: Array.isArray(to) ? to.join(',') : to,
      cc: cc.join(','),
      bcc: bcc.join(','),
      subject: subject,
      html: emailBody,
      text: emailBody.replace(/<[^>]*>/g, '')
    };

    const info = await transporter.sendMail(mailOptions);

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
        messageId: info.messageId
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
        messageId: info.messageId
      }
    }).promise();

    return {
      statusCode: 200,
      headers: getCorsHeaders(),
      body: JSON.stringify({
        message: 'Email sent successfully',
        emailId,
        messageId: info.messageId
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

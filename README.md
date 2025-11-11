# VMail - Gmail-Style Email Application

A fully functional email application with Gmail-style UI built on AWS services.

## Features

✅ **Gmail-Style User Interface**
- Clean, modern interface replicating Gmail's design
- Responsive layout for desktop and mobile
- Email list with tabs (Primary, Social, Promotions)
- Email composer with floating window
- Navigation sidebar with folders

✅ **Email Operations**
- Send emails with attachments
- Receive emails automatically
- Read, delete, and mark emails as read
- Organize emails in folders (Inbox, Sent, Drafts, Trash)

✅ **Advanced Features**
- Email address generator (custom, random, temporary addresses)
- Free email service search directory
- Real-time email notifications
- Email preview and full view

✅ **AWS Infrastructure**
- Amazon Cognito for authentication
- AWS Lambda for email operations
- Amazon DynamoDB for email metadata
- Amazon S3 for email storage
- Amazon SES for sending/receiving
- API Gateway for REST endpoints

## Quick Start

### Start the Application

```bash
cd /Users/gagan/Documents/VMail/frontend
npm start
```

The app will open at `http://localhost:3000`

### Login/Register

- Create a new account or login with existing credentials
- Your email will be verified through Cognito

### Using the Application

#### Send an Email
1. Click the "Compose" button
2. Enter recipient email (must be verified in SES sandbox)
3. Add subject and message
4. Click "Send"

#### Receive Emails
- Emails sent to `gagan_veginati@srmap.edu.in` will automatically appear in your inbox
- S3 triggers Lambda to process incoming emails
- Emails are stored in DynamoDB and S3

#### Generate Email Addresses
1. Click "Generate Email" button in sidebar
2. Choose generation type (Custom, Random, Temporary)
3. Select domain
4. Click "Generate"

## Backend Services (All Deployed ✅)

- **Lambda Functions**: 6 functions (list, get, send, delete, mark-read, receive)
- **API Gateway**: `https://6izcc4sd18.execute-api.us-east-1.amazonaws.com/prod`
- **SES**: Verified email `gagan_veginati@srmap.edu.in` (200 emails/day)
- **DynamoDB**: Table `vmail-emails` (ready)
- **S3**: Bucket `vmail-emails-059409992687` (configured)
- **Cognito**: Pool `us-east-1_mCoiqnWRI` (active)

## Important Notes

### SES Sandbox Mode
You can only send to verified addresses. To send to any email:
1. Go to AWS Console → SES
2. Click "Request production access"
3. Wait 24-48 hours for approval

### Cost Estimate
~$2-3/month with current usage

## Troubleshooting

**Cannot Send Emails**: Check if recipient is verified in SES (sandbox mode)
**Emails Not Appearing**: Check S3 bucket incoming/ folder
**Login Issues**: Clear browser cache or check Cognito pool
**API 403 Errors**: Ensure you're logged in with valid token

## Support

Check AWS CloudWatch logs for any Lambda function errors.

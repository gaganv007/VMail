# VMail - Complete Setup Guide

## Overview
VMail is a fully functional email application with Gmail-like UI, built with React and AWS services.

## Architecture
- **Frontend**: React 18 with AWS Amplify
- **Authentication**: AWS Cognito
- **API**: AWS API Gateway with Lambda functions
- **Storage**: DynamoDB (metadata) + S3 (email content)
- **Email**: Gmail SMTP (sending) + SES (receiving)

## Prerequisites
- AWS Account (credentials already configured in project)
- Gmail account with App Password
- Node.js 18+ installed

---

## Quick Start (5 minutes)

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd VMail
cd frontend
npm install
```

### 2. Start Frontend
```bash
npm start
```
The app will open at http://localhost:3000

### 3. Create Account
1. Click "Sign up"
2. Enter your email and password (min 8 chars)
3. Check your email for verification code
4. Enter code and verify
5. Login with your credentials

### 4. Configure Gmail SMTP (Required for Sending)

**Get Gmail App Password:**
1. Visit: https://myaccount.google.com/security
2. Enable 2-Step Verification
3. Go to App passwords
4. Create new app password for "Mail"
5. Copy the 16-character password

**Update Lambda:**
```bash
aws lambda update-function-configuration \
  --function-name vmail-send-email \
  --environment "Variables={
    DYNAMODB_TABLE=vmail-emails,
    S3_BUCKET=vmail-emails-059409992687,
    GMAIL_USER=your-gmail@gmail.com,
    GMAIL_APP_PASSWORD=your-app-password-here
  }" \
  --region us-east-1
```

### 5. Send Test Email
1. Click "Compose" button
2. Enter recipient email
3. Enter subject and body
4. Click "Send"
5. Email will be sent via Gmail SMTP!

---

## Features

### ✅ Implemented
- User registration with email verification
- User login/logout
- Compose and send emails (via Gmail SMTP)
- View inbox, sent, starred, drafts, spam, trash
- Read individual emails
- Delete emails
- Clean Gmail-like UI
- Real-time email list updates

### 📬 Email Receiving
Currently configured with AWS SES receipt rules to receive emails at `gagan_veginati@srmap.edu.in`.

**To receive emails:**
1. Send email to `gagan_veginati@srmap.edu.in`
2. SES receives email → stores in S3
3. Lambda processes email → stores in DynamoDB
4. Email appears in Inbox folder

---

## AWS Services Status

### ✅ Working Services

**Cognito User Pool:**
- Pool ID: `us-east-1_mCoiqnWRI`
- Region: `us-east-1`
- Features: Sign up, sign in, email verification

**API Gateway:**
- Endpoint: `https://6izcc4sd18.execute-api.us-east-1.amazonaws.com/prod`
- Authorizer: Cognito
- Routes:
  - POST /emails/send
  - GET /emails/list
  - GET /emails/{emailId}
  - DELETE /emails/{emailId}
  - PUT /emails/{emailId}/read

**Lambda Functions:**
1. `vmail-send-email` - Send via Gmail SMTP ✅
2. `vmail-list-emails` - List user emails ✅
3. `vmail-get-email` - Get single email ✅
4. `vmail-delete-email` - Delete email ✅
5. `vmail-mark-read` - Mark as read ✅
6. `vmail-receive-email` - Process incoming emails ✅

**DynamoDB:**
- Table: `vmail-emails`
- Region: `ap-south-2`
- Attributes: emailId, userId, from, to, subject, timestamp, folder

**S3 Buckets:**
1. `vmail-emails-059409992687` (ap-south-2) - Sent emails
2. `vmail-incoming-emails-059409992687` (us-east-1) - Incoming emails

**SES (Email Receiving):**
- Verified identities:
  - gagan_veginati@srmap.edu.in ✅
  - Cloudmailproject@gmail.com ✅
- Receipt rule: `vmail-receive-rule` ✅
- Triggers Lambda on incoming emails ✅

---

## Project Structure

```
VMail/
├── frontend/               # React application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/      # Login, Signup
│   │   │   └── Gmail/     # Email UI components
│   │   ├── services/      # API services
│   │   └── config/        # AWS configuration
│   └── package.json
├── lambda/                 # Lambda functions
│   ├── send-email/        # Node.js with Nodemailer
│   ├── list-emails/       # Python 3.9
│   ├── get-email/         # Python 3.9
│   ├── delete-email/      # Python 3.9
│   ├── mark-read/         # Python 3.9
│   └── receive-email/     # Python 3.9
└── infrastructure/         # (Not used - manual setup)
```

---

## Environment Variables

### Frontend (.env)
```bash
REACT_APP_AWS_REGION=us-east-1
REACT_APP_COGNITO_USER_POOL_ID=us-east-1_mCoiqnWRI
REACT_APP_COGNITO_CLIENT_ID=3oi6kqssqhacuq0299frlpegga
REACT_APP_API_ENDPOINT=https://6izcc4sd18.execute-api.us-east-1.amazonaws.com/prod
REACT_APP_EMAIL_BUCKET=vmail-emails-059409992687
REACT_APP_SES_FROM_EMAIL=gagan_veginati@srmap.edu.in
REACT_APP_DYNAMODB_TABLE=vmail-emails
```

### Lambda (Environment Variables)
All Lambda functions have:
- `DYNAMODB_TABLE=vmail-emails`
- `S3_BUCKET=vmail-emails-059409992687` (or appropriate bucket)
- `USER_POOL_ID=us-east-1_mCoiqnWRI`

**send-email Lambda additionally needs:**
- `GMAIL_USER=your-gmail@gmail.com`
- `GMAIL_APP_PASSWORD=your-16-char-app-password`

---

## Testing the Application

### 1. Test User Registration
```bash
# Open http://localhost:3000/signup
# Register new account
# Verify email with code
```

### 2. Test Login
```bash
# Open http://localhost:3000/login
# Login with registered account
```

### 3. Test Sending Email
```bash
# Click Compose
# Fill: To, Subject, Body
# Click Send
# Check CloudWatch logs:
aws logs tail /aws/lambda/vmail-send-email --follow --region us-east-1
```

### 4. Test Receiving Email
```bash
# Send email to: gagan_veginati@srmap.edu.in
# Wait 30 seconds
# Refresh inbox in UI
# Email should appear
```

### 5. Test Email Viewer
```bash
# Click any email in list
# View full email details
# Click back arrow to return
```

### 6. Test Delete
```bash
# Open email
# Click trash icon
# Email moved to trash folder
```

---

## Troubleshooting

### Issue: "Failed to send email"
**Solution:**
1. Check Gmail App Password is configured:
```bash
aws lambda get-function-configuration --function-name vmail-send-email --region us-east-1 --query 'Environment.Variables'
```
2. Verify app password is correct (16 chars, no spaces)
3. Check CloudWatch logs for detailed error

### Issue: "Authentication required"
**Solution:**
1. Clear browser cache and cookies
2. Logout and login again
3. Check Cognito user exists:
```bash
aws cognito-idp list-users --user-pool-id us-east-1_mCoiqnWRI --region us-east-1
```

### Issue: "No emails showing"
**Solution:**
1. Check DynamoDB for emails:
```bash
aws dynamodb scan --table-name vmail-emails --region ap-south-2 --max-items 5
```
2. Verify folder filter is correct (inbox, sent, etc.)
3. Try clicking different folders

### Issue: Frontend shows old UI
**Solution:**
1. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Clear browser cache
3. Use incognito mode
4. Restart npm: `npm start`

---

## AWS Costs

All services used are within free tier limits:
- **Cognito**: 50,000 MAU free
- **Lambda**: 1M requests free/month
- **API Gateway**: 1M requests free/month (first 12 months)
- **DynamoDB**: 25GB storage free
- **S3**: 5GB storage free
- **SES**: 62,000 emails free/month (via EC2/Lambda)
- **Gmail SMTP**: Free (500 emails/day)

**Expected monthly cost: $0** (for normal usage)

---

## Security Notes

### ✅ Implemented Security
- JWT token authentication (Cognito)
- API Gateway with Cognito authorizer
- IAM roles with least privilege
- CORS enabled for frontend only
- User data isolation (userId filtering)
- HTTPS only (API Gateway)

### 🔒 Recommendations
- Add rate limiting to prevent spam
- Implement email size limits
- Add file type validation for attachments
- Enable CloudWatch alarms for errors
- Add backup strategy for DynamoDB
- Rotate Gmail App Password regularly

---

## Next Steps

### Easy Improvements
1. Add "Mark as Read/Unread" button
2. Add "Star/Unstar" functionality
3. Add email search
4. Add pagination for large email lists
5. Add email threading (conversations)

### Advanced Features
1. Rich text editor for compose
2. File attachments support
3. Email templates
4. Filters and labels
5. Multiple email accounts
6. Mobile responsive design

---

## Support

### View Logs
```bash
# Lambda logs
aws logs tail /aws/lambda/vmail-send-email --follow --region us-east-1

# API Gateway logs (if enabled)
aws logs tail /aws/apigateway/6izcc4sd18 --follow --region us-east-1
```

### Check Service Status
```bash
# List all Lambda functions
aws lambda list-functions --region us-east-1 --query "Functions[?starts_with(FunctionName, 'vmail-')].[FunctionName,Runtime,LastModified]" --output table

# Check DynamoDB table
aws dynamodb describe-table --table-name vmail-emails --region ap-south-2 --query 'Table.[TableName,TableStatus,ItemCount]' --output table

# Check S3 buckets
aws s3 ls | grep vmail
```

---

## Credits

Built with:
- React 18
- AWS Amplify v6
- AWS Lambda (Python 3.9 & Node.js 18)
- AWS Cognito, API Gateway, DynamoDB, S3, SES
- Nodemailer (Gmail SMTP)

---

**Last Updated**: November 11, 2025
**Status**: ✅ Fully Functional

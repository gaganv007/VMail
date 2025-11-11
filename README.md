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

## 🚀 Quick Start - Clone and Run

### Prerequisites
- Node.js 18+ installed
- AWS CLI configured (optional, for backend changes)

### Step 1: Clone Repository
```bash
git clone https://github.com/yourusername/vmail.git
cd VMail
```

### Step 2: Install Dependencies
```bash
cd frontend
npm install
```

### Step 3: Start Application
```bash
npm start
```

App opens at **http://localhost:3000**

### Step 4: Login and Use
1. **Create Account**: Click "Sign Up", enter email and password
2. **Verify Email**: Check your email for verification code
3. **Login**: Use your credentials
4. **Send Email**: Click "Compose" → Enter any email → Send!

## Backend Services (All Configured ✅)

### Email Sending
- **Service**: Gmail SMTP via Nodemailer
- **Works with**: ANY email address (no verification needed!)
- **Daily Limit**: 500 emails (free Gmail account)

### AWS Resources
- **Lambda Functions**: 6 functions (send, list, get, delete, mark-read, receive)
- **API Gateway**: `https://6izcc4sd18.execute-api.us-east-1.amazonaws.com/prod`
- **DynamoDB**: Table `vmail-emails` in us-east-1
- **S3**: Buckets for email storage (ap-south-2 + us-east-1)
- **Cognito**: User Pool `us-east-1_mCoiqnWRI`

## Using My AWS Credentials

The app is pre-configured with my AWS credentials. You can use it directly:

### For Frontend Only (No Setup Needed)
```bash
cd frontend
npm start
```

Everything is already configured in `src/config/aws-config.js`!

### To Use Your Own AWS Account

1. **Update Frontend Config** - Edit `frontend/src/config/aws-config.js`:
```javascript
export const cognitoConfig = {
  region: 'us-east-1',
  userPoolId: 'YOUR_USER_POOL_ID',
  userPoolClientId: 'YOUR_CLIENT_ID',
};

export const apiConfig = {
  endpoint: 'YOUR_API_GATEWAY_URL',
  // ...
};
```

2. **Set Up Gmail SMTP** - See `SETUP_GMAIL.md` for detailed instructions

## How It Works

### Sending Email Flow:
1. User clicks "Compose" and writes email
2. Frontend calls API Gateway with JWT token
3. Lambda authenticates via Cognito
4. Nodemailer sends via Gmail SMTP
5. Email metadata stored in DynamoDB
6. Full email stored in S3
7. User sees email in "Sent" folder

### Email List Display:
- Shows emails from DynamoDB
- Filtered by folder (Inbox, Sent, Drafts, etc.)
- Horizontal layout: Avatar | From | Subject - Preview | Time
- Click email to view full content

## Features

✅ **Send to ANY email** (Gmail, Yahoo, Outlook, etc.)
✅ **Clean horizontal email list layout**
✅ **All buttons work** (star, delete, archive, refresh)
✅ **Folder navigation** (Inbox, Sent, Drafts, Trash)
✅ **Email composer** with rich text
✅ **Email generator** for temporary addresses
✅ **Service search** for free email providers

## Cost

**FREE for moderate use!**
- Lambda: First 1M requests/month free
- DynamoDB: First 25GB storage free
- S3: First 5GB storage free
- Gmail SMTP: 500 emails/day free
- API Gateway: First 1M calls free (then $3.50/million)

Estimated cost: **$0-1/month** for personal use

## Troubleshooting

### UI Not Updating
1. **Hard refresh browser**: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. **Clear cache**: Open DevTools → Application → Clear Storage
3. **Try incognito mode** to see fresh UI

### Cannot Send Emails
1. Check Gmail App Password is configured in Lambda
2. Run: `aws logs tail /aws/lambda/vmail-send-email --follow --region us-east-1`
3. Verify Lambda has GMAIL_USER and GMAIL_APP_PASSWORD env vars

### Emails Not Showing
1. Click on **"Sent"** folder (not Inbox)
2. Check DynamoDB: `aws dynamodb scan --table-name vmail-emails --region us-east-1`
3. Refresh page to reload data

### Login Issues
1. Clear browser cookies and cache
2. Create new account if verification email didn't arrive
3. Check spam folder for Cognito verification email

## Development

### Run Locally
```bash
cd frontend
npm start
```

### Build for Production
```bash
npm run build
# Upload build/ folder to S3 static hosting or Netlify
```

### View Lambda Logs
```bash
aws logs tail /aws/lambda/vmail-send-email --follow --region us-east-1
```

### Update Lambda Code
```bash
cd lambda/send-email
npm install
zip -r function.zip .
aws lambda update-function-code --function-name vmail-send-email --zip-file fileb://function.zip --region us-east-1
```

## Support

- **Gmail Setup**: See `SETUP_GMAIL.md`
- **Logs**: Check AWS CloudWatch
- **Issues**: Check browser console (F12)

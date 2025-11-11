# Gmail SMTP Setup for VMail

## Overview
VMail now uses **Gmail SMTP with Nodemailer** instead of AWS SES for sending emails. This is more reliable and works immediately.

## Setup Steps

### 1. Create Gmail App Password

1. Go to your Google Account: https://myaccount.google.com/
2. Click on **Security** in the left sidebar
3. Enable **2-Step Verification** if not already enabled
4. Scroll down to **App passwords**
5. Click **App passwords**
6. Select **Mail** and **Other (Custom name)**
7. Name it "VMail"
8. Click **Generate**
9. **Copy the 16-character password** (e.g., `abcd efgh ijkl mnop`)

### 2. Update Lambda Environment Variables

Run this command with your Gmail credentials:

```bash
aws lambda update-function-configuration \
  --function-name vmail-send-email \
  --environment "Variables={
    DYNAMODB_TABLE=vmail-emails,
    S3_BUCKET=vmail-emails-059409992687,
    GMAIL_USER=cloudmailproject@gmail.com,
    GMAIL_APP_PASSWORD=your-16-char-password-here
  }" \
  --region us-east-1
```

**Replace**:
- `cloudmailproject@gmail.com` with your Gmail address
- `your-16-char-password-here` with the app password from step 1 (remove spaces)

### 3. Test Email Sending

1. Open the app at http://localhost:3000
2. Login with your account
3. Click **Compose**
4. Send a test email
5. Check recipient inbox - email should arrive within seconds!

## Features

✅ **Send emails to ANY address** (no verification needed like SES)
✅ **Works immediately** (no sandbox mode)
✅ **Free** (uses your Gmail account)
✅ **Reliable delivery**
✅ **No daily limits** (Gmail allows 500 emails/day for free accounts)

## How It Works

### Sending Flow:
1. User clicks Send in UI
2. Frontend calls API Gateway
3. Lambda function uses Nodemailer
4. Nodemailer connects to Gmail SMTP
5. Email sent through Gmail
6. Email metadata stored in DynamoDB
7. Full email stored in S3

### What's Stored:
- **DynamoDB**: Email metadata (from, to, subject, preview, timestamp)
- **S3**: Full email content (body, attachments)

## Receiving Emails

For receiving emails, you have two options:

### Option A: Use Gmail API (Recommended)
Gmail API allows you to fetch emails from your Gmail inbox programmatically.

### Option B: Email Forwarding
Set up Gmail forwarding rules to forward incoming emails to a webhook that triggers the receive Lambda.

## Troubleshooting

**Problem**: "Invalid login" error
**Solution**: Make sure 2-Step Verification is enabled and you're using an App Password, not your regular Gmail password

**Problem**: "Less secure app access" error
**Solution**: Google removed this option. You MUST use App Passwords with 2-Step Verification

**Problem**: Emails not sending
**Solution**: Check CloudWatch logs:
```bash
aws logs tail /aws/lambda/vmail-send-email --follow --region us-east-1
```

## Cost

**FREE!**
- Gmail SMTP: Free (500 emails/day)
- Lambda: First 1M requests free/month
- DynamoDB: First 25GB storage free
- S3: First 5GB storage free

Much better than SES which has complex verification requirements!

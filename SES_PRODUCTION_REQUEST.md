# How to Request SES Production Access

## Why You Need This
- Currently in **Sandbox Mode**: Can only send to verified emails
- **Production Mode**: Send to ANY email address worldwide

## Steps to Request Production Access

### 1. Go to AWS SES Console
https://console.aws.amazon.com/ses/home?region=us-east-1#/account

### 2. Click "Request production access" button

### 3. Fill out the form:

**Mail Type:** Transactional
**Website URL:** http://localhost:3000 (or your domain if you have one)
**Use Case Description:** (Example below)

```
I am building a personal email management application called VMail that allows 
users to send and receive emails. The application uses AWS SES for email delivery,
DynamoDB for storage, and Lambda for processing. 

Users will send legitimate emails to verified contacts. I have implemented:
- Email verification via Amazon Cognito
- Bounce and complaint handling
- Opt-out mechanisms
- Rate limiting

Expected volume: <200 emails per day
No marketing or bulk emails will be sent.
```

**Additional Information:**
- How you handle bounces: "Configured SNS notifications"
- How you handle complaints: "Configured SNS notifications and automatic suppression"
- How you comply with anti-spam policies: "Only sending to opted-in recipients"

### 4. Submit Request

**Timeline:** Usually approved within 24-48 hours

### 5. After Approval
You'll receive an email notification. Then you can send to ANY email address!

## Current Limits (Sandbox)
- ✅ Send to: gagan_veginati@srmap.edu.in
- ❌ Send to: Any other email

## After Production Access
- ✅ Send to: ANY email address
- Limit: 200 emails/day (can request increase)
- Rate: 1 email/second (can request increase)


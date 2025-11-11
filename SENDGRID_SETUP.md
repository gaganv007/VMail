# SendGrid Setup Guide for VMail

## Overview
VMail now uses **Twilio SendGrid** for reliable email delivery with support for attachments, HTML emails, and global delivery.

## Why SendGrid?
- ✅ Send to ANY email address (no verification needed)
- ✅ Free tier: 100 emails/day forever
- ✅ Professional email delivery infrastructure
- ✅ Attachment support built-in
- ✅ Detailed delivery analytics
- ✅ Better deliverability than Gmail SMTP

---

## Quick Setup (5 Minutes)

### Step 1: Create SendGrid Account
1. Go to https://signup.sendgrid.com/
2. Sign up with your email
3. Verify your email address
4. Complete the setup wizard

### Step 2: Create API Key
1. Login to SendGrid dashboard
2. Go to **Settings** → **API Keys**
3. Click **Create API Key**
4. Name: `VMail Production`
5. Permissions: **Full Access** (or at minimum: Mail Send)
6. Click **Create & View**
7. **COPY THE API KEY** - you won't see it again!
   - Format: `SG.xxxxxxxxxxxxxxxxxxxxx.yyyyyyyyyyyyyyyyyyyyyyyyyyy`

### Step 3: Verify Sender Identity
**Important:** You MUST verify an email address or domain to send emails.

#### Option A: Single Sender Verification (Quick - Recommended for testing)
1. Go to **Settings** → **Sender Authentication**
2. Click **Verify a Single Sender**
3. Fill in your details:
   - From Name: `VMail`
   - From Email Address: `your-email@gmail.com` (or any email you own)
   - Reply To: Same as from email
   - Company details (can be personal)
4. Click **Create**
5. Check your email for verification link
6. Click the link to verify

#### Option B: Domain Authentication (Production - Better deliverability)
1. Go to **Settings** → **Sender Authentication**
2. Click **Authenticate Your Domain**
3. Follow the DNS setup instructions
4. Wait for DNS propagation (can take 24-48 hours)

### Step 4: Configure Lambda Function
Update the `vmail-send-email` Lambda function with your SendGrid credentials:

```bash
aws lambda update-function-configuration \
  --function-name vmail-send-email \
  --environment "Variables={
    DYNAMODB_TABLE=vmail-emails,
    S3_BUCKET=vmail-emails-059409992687,
    SENDGRID_API_KEY=SG.your-api-key-here,
    SENDGRID_FROM_EMAIL=your-verified-email@gmail.com
  }" \
  --region us-east-1
```

**Replace:**
- `SG.your-api-key-here` with your actual SendGrid API key
- `your-verified-email@gmail.com` with the email you verified in Step 3

### Step 5: Test Email Sending
1. Open VMail: http://localhost:3000
2. Login to your account
3. Click **Compose**
4. Fill in:
   - **To**: any@email.com (can be any address!)
   - **Subject**: Test from VMail
   - **Body**: This is a test email via SendGrid
5. Click **Send**
6. Email should be delivered within seconds!

---

## Features Now Available

### ✅ Attachments Support
- Click "📎 Attach" button in compose window
- Select multiple files
- See file size and remove unwanted files
- Attachments sent as base64 encoded data
- Supported: PDF, images, documents, etc.

### ✅ Search & Filter
- Search bar in navigation
- Searches: subject, from, body, preview
- Real-time filtering as you type
- Works across all folders

### ✅ Clean UI
- Spam folder removed (as requested)
- Only essential folders: Inbox, Starred, Sent, Drafts, Trash
- Horizontal email list layout
- Gmail-like design

---

## SendGrid Pricing

### Free Tier (Forever)
- **100 emails/day**
- All features included
- No credit card required
- Perfect for personal use

### Essentials Plan - $19.95/month
- **50,000 emails/month**
- 40,000 emails first month
- Advanced analytics
- Email validation

### Pro Plan - $89.95/month
- **100,000 emails/month**
- Dedicated IP
- Priority support
- Advanced features

**For VMail usage: Free tier is sufficient for most users!**

---

## Email Sending Flow

```
User clicks Send
      ↓
Frontend → API Gateway (with Cognito auth)
      ↓
Lambda Function (vmail-send-email)
      ↓
SendGrid API (sends email)
      ↓
Email delivered to recipient
      ↓
Store metadata in DynamoDB
Store full email in S3
      ↓
Success response to user
```

---

## Receiving Emails

SendGrid also supports **Inbound Parse** for receiving emails:

### Option 1: SendGrid Inbound Parse (Recommended)
1. Go to **Settings** → **Inbound Parse**
2. Add your domain
3. Configure MX records
4. Set webhook URL to trigger Lambda
5. Emails sent to `anything@yourdomain.com` → processed by Lambda

### Option 2: Continue Using AWS SES (Current Setup)
- Already configured for `gagan_veginati@srmap.edu.in`
- SES receives email → S3 → Lambda → DynamoDB
- Works alongside SendGrid for sending

---

## Troubleshooting

### Issue: "Forbidden" or "403" Error
**Cause:** Email address not verified
**Solution:** 
1. Go to SendGrid → Settings → Sender Authentication
2. Verify at least one email address
3. Use that exact email in `SENDGRID_FROM_EMAIL`

### Issue: "Unauthorized" Error
**Cause:** Invalid API key
**Solution:**
1. Check API key is copied correctly (starts with `SG.`)
2. Verify API key has "Mail Send" permission
3. Create a new API key if needed

### Issue: Emails going to spam
**Solution:**
1. Set up Domain Authentication (not just single sender)
2. Add SPF and DKIM records to your domain
3. Use a professional "From" name
4. Avoid spam trigger words in subject

### Issue: "Daily send limit exceeded"
**Solution:**
1. Free tier: 100 emails/day limit
2. Upgrade to paid plan for more
3. Or create multiple SendGrid accounts (not recommended)

---

## Monitoring & Analytics

### View Sent Emails in SendGrid
1. Go to **Activity** → **Activity Feed**
2. See all sent emails
3. Track: Delivered, Opened, Clicked, Bounced

### Check Lambda Logs
```bash
aws logs tail /aws/lambda/vmail-send-email --follow --region us-east-1
```

### Check DynamoDB
```bash
aws dynamodb scan \
  --table-name vmail-emails \
  --filter-expression "folder = :folder" \
  --expression-attribute-values '{":folder":{"S":"sent"}}' \
  --region ap-south-2 \
  --max-items 10
```

---

## Security Best Practices

### ✅ API Key Security
- Never commit API keys to Git
- Store in Lambda environment variables
- Rotate keys every 90 days
- Use separate keys for dev/prod

### ✅ Rate Limiting
SendGrid automatically rate limits based on your plan:
- Free: 100 emails/day
- Paid: Based on plan limit
- Returns 429 error if limit exceeded

### ✅ Validation
- Frontend validates email format
- Lambda validates required fields
- SendGrid validates deliverability

---

## Migration from Gmail SMTP

The Lambda has been updated from Gmail SMTP to SendGrid:

### What Changed:
- ❌ Removed: Nodemailer with Gmail
- ✅ Added: @sendgrid/mail package
- ✅ Better: No app passwords needed
- ✅ Better: Professional email infrastructure
- ✅ Better: Send to any address without verification

### What Stayed Same:
- API endpoints unchanged
- DynamoDB storage unchanged
- S3 storage unchanged
- Frontend code unchanged (except attachments)
- Authentication flow unchanged

---

## Testing Checklist

- [ ] SendGrid account created
- [ ] API key generated and saved
- [ ] Single sender verified (or domain authenticated)
- [ ] Lambda environment variables updated
- [ ] Test email sent successfully
- [ ] Email received in recipient inbox
- [ ] Attachment sent and received
- [ ] Search functionality works
- [ ] All folders accessible (no spam folder)

---

## Support & Documentation

### SendGrid Resources
- Dashboard: https://app.sendgrid.com/
- Documentation: https://docs.sendgrid.com/
- API Reference: https://docs.sendgrid.com/api-reference/mail-send/mail-send
- Status Page: https://status.sendgrid.com/

### VMail Documentation
- Main Setup: [COMPLETE_SETUP.md](COMPLETE_SETUP.md)
- Gmail SMTP (old): [SETUP_GMAIL.md](SETUP_GMAIL.md)
- Architecture: [ARCHITECTURE.md](ARCHITECTURE.md)

---

## Next Steps

1. **Complete SendGrid setup** (Steps 1-4 above)
2. **Test sending email** with attachments
3. **Verify email delivery** 
4. **Set up inbound parse** (optional - for receiving)
5. **Monitor usage** in SendGrid dashboard

---

**Status**: ✅ SendGrid Integration Complete
**Last Updated**: November 11, 2025

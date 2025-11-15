# 📧 AWS SES Email Receiving Setup Guide

## Current Status

### ✅ Already Completed via CLI
- Email identity verification initiated: `cloudmailproject@gmail.com`
- Receipt rule set created: `vmail-receipt-rules`
- Status: **Pending verification** (check Gmail for verification email)

### ⚠️ Region Issue
- S3 bucket location: `ap-south-2` (Mumbai)
- SES region: `us-east-1` (N. Virginia)
- **Problem**: SES in us-east-1 cannot write to S3 buckets in ap-south-2

---

## Solution: Use Lambda + SNS Direct

Instead of SES → S3 → Lambda, we'll use:
**SES → SNS → Lambda → DynamoDB + S3**

### Step 1: Complete Email Verification ✅
1. Check email: `cloudmailproject@gmail.com`
2. Find verification email from AWS
3. Click verification link
4. Status will change to "Verified"

**Verify Status via CLI:**
```bash
aws ses get-identity-verification-attributes \
  --identities cloudmailproject@gmail.com \
  --region us-east-1
```

Expected response when verified:
```json
"VerificationStatus": "Success"
```

---

## Step 2: Create SNS Topic (Alternative to S3)

Since S3 can't receive from SES in different region, we use SNS:

```bash
aws sns create-topic \
  --name vmail-email-received \
  --region us-east-1
```

Get the topic ARN from response.

---

## Step 3: Create Receipt Rule with SNS

```bash
aws ses create-receipt-rule \
  --rule-set-name vmail-receipt-rules \
  --rule 'Name=vmail-sns-rule,
Enabled=true,
Recipients=[cloudmailproject@gmail.com],
Actions=[{SNSAction={TopicArn=arn:aws:sns:us-east-1:059409992687:vmail-email-received}}]' \
  --region us-east-1
```

---

## Step 4: Subscribe Lambda to SNS

Connect the SNS topic to the receive-email Lambda:

```bash
aws lambda add-permission \
  --function-name vmail-receive-email \
  --statement-id AllowSNSInvoke \
  --action lambda:InvokeFunction \
  --principal sns.amazonaws.com \
  --source-arn arn:aws:sns:us-east-1:059409992687:vmail-email-received \
  --region us-east-1

aws sns subscribe \
  --topic-arn arn:aws:sns:us-east-1:059409992687:vmail-email-received \
  --protocol lambda \
  --notification-endpoint arn:aws:lambda:us-east-1:059409992687:function:vmail-receive-email \
  --region us-east-1
```

---

## Step 5: Set Active Receipt Rule Set

```bash
aws ses set-active-receipt-rule-set \
  --rule-set-name vmail-receipt-rules \
  --region us-east-1
```

---

## Step 6: Test Email Receiving

After all steps are verified:

1. Send email to: `cloudmailproject@gmail.com`
2. From any email address (e.g., your Gmail)
3. SES receives it
4. SNS is notified
5. Lambda receives SNS message
6. Lambda parses email
7. Stores in DynamoDB + S3
8. Appears in VMail Inbox ✓

---

## Frontend Testing

### Send Test Email
1. Open: http://localhost:3000
2. Click "Compose"
3. To: `any-random-email@test.com`
4. Subject: `Test email`
5. Body: `Testing VMail`
6. Click "Send"
7. Email appears in Sent folder ✓

### Star Test Email
1. Click star icon on sent email ⭐
2. Email moves to Starred folder ✓

### Receive Test Email
1. From external email (Gmail, etc.)
2. Send to: `cloudmailproject@gmail.com`
3. Wait 10-30 seconds
4. Check Inbox in VMail
5. Email should appear ✓

---

## Troubleshooting

### Email verification stuck on "Pending"?
- Check Gmail spam folder
- Resend verification: AWS Console → SES → Verified identities → Resend verification

### Email not arriving in Inbox?
1. Check CloudWatch logs:
   ```bash
   aws logs tail /aws/lambda/vmail-receive-email --follow --region us-east-1
   ```

2. Check SNS subscription:
   ```bash
   aws sns list-subscriptions-by-topic \
     --topic-arn arn:aws:sns:us-east-1:059409992687:vmail-email-received \
     --region us-east-1
   ```

3. Check SES receipt rule:
   ```bash
   aws ses describe-receipt-rule \
     --rule-set-name vmail-receipt-rules \
     --rule-name vmail-sns-rule \
     --region us-east-1
   ```

---

## Key Information

| Item | Value |
|------|-------|
| Email Address | cloudmailproject@gmail.com |
| Receipt Rule Set | vmail-receipt-rules |
| Lambda Function | vmail-receive-email |
| SNS Topic | vmail-email-received |
| DynamoDB Table | vmail-emails |
| S3 Bucket | vmail-emails-059409992687 |
| Region (SES) | us-east-1 |
| Region (S3) | ap-south-2 |

---

## Next Action: Manual AWS Console Setup

⚠️ **Important**: Some steps require AWS Console because CLI has limitations:

1. **Verify email** (done via CLI ✓)
2. **Wait for verification email** (manual)
3. **Click verification link** (manual)
4. **Create SNS topic** (done via CLI ✓)
5. **Create receipt rule** (needs CLI fix due to region issue)

**Recommendation**: Use AWS Console for simplicity:
- Go to SES → Email receiving → Receipt rule sets
- Create rule for cloudmailproject@gmail.com
- Action: SNS → select vmail-email-received topic

---

**Last Updated**: November 14, 2025
**Status**: Ready for manual verification and SNS setup

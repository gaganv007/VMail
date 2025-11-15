# VMail - Comprehensive Test Plan

## ✅ Test Execution Started

### Frontend Server Status
- ✅ Development server running on `http://localhost:3000`
- Process ID: 70834 (React Scripts)
- Status: Active and listening

---

## 🧪 MANUAL BROWSER TESTING CHECKLIST

Open browser and navigate to: **http://localhost:3000**

### Phase 1: Authentication Testing
- [ ] **Login Page Loads**
  - Navigate to http://localhost:3000
  - Verify Cognito login form appears
  - Expected: Login/Signup buttons visible

- [ ] **Create Account (if needed)**
  - Click "Sign Up"
  - Enter email and password
  - Verify confirmation code email received
  - Enter code to confirm account

- [ ] **Login**
  - Enter Cognito credentials
  - Click "Sign In"
  - Expected: Redirected to Gmail-like interface with folders (Inbox, Sent, Drafts, Trash, Starred)

- [ ] **Verify User Email**
  - Check top-right corner for user avatar/profile
  - Should show user's email or initial letter

---

### Phase 2: Email List & Navigation
- [ ] **Inbox View**
  - Verify "Inbox" is selected in sidebar
  - Expected: List of emails (or empty if first time)
  - Check columns: Checkbox, Star, Avatar, From, Subject, Time

- [ ] **Sent Folder**
  - Click "Sent" in sidebar
  - Expected: Empty initially (will populate after sending emails)

- [ ] **Drafts Folder**
  - Click "Drafts" in sidebar
  - Expected: Empty initially (will populate after saving drafts)

- [ ] **Trash Folder**
  - Click "Trash" in sidebar
  - Expected: Empty initially (will populate after deleting emails)

- [ ] **Starred Folder**
  - Click "Starred" in sidebar
  - Expected: Empty initially (will populate after starring emails)

- [ ] **Email Count Display**
  - Check count badges next to each folder
  - Should update as you add/delete emails

---

### Phase 3: Email Sending
- [ ] **Compose Button**
  - Click "Compose" or "New Message" button
  - Expected: Modal/window opens with form

- [ ] **Compose Form Elements**
  - Verify fields: To, CC, BCC, Subject, Body
  - Verify buttons: Send, Save Draft, Cancel
  - Verify attachment option (📎)

- [ ] **Send Test Email**
  - To: `gagan_veginati@srmap.edu.in` (or your test email)
  - CC: (optional)
  - Subject: `Test Email - VMail`
  - Body: `This is a test email from VMail.`
  - Click "Send"
  - Expected: Modal closes, email appears in "Sent" folder

- [ ] **Verify in Sent**
  - Navigate to "Sent" folder
  - Should see your test email at top of list
  - Click on it to view full content

---

### Phase 4: Starred Emails
- [ ] **Star from List View**
  - Go to "Inbox"
  - Hover over any email
  - Click star icon (⭐) next to email
  - Expected: Star turns gold/filled ⭐

- [ ] **Unstar**
  - Click the filled star again
  - Expected: Star returns to outline ☆

- [ ] **View Starred Folder**
  - Click "Starred" in sidebar
  - Expected: Only starred emails shown

- [ ] **Star from Email View**
  - Click email to open full view
  - Click star icon in header
  - Expected: Star toggles and email updates

---

### Phase 5: Draft Saving
- [ ] **Save Draft**
  - Click "Compose"
  - Fill in fields:
    - To: `test@example.com`
    - Subject: `Draft Test Email`
    - Body: `This is a draft.`
  - Click "Save Draft" (NOT Send)
  - Expected: Modal closes, email saved to "Drafts"

- [ ] **Verify Draft in Drafts Folder**
  - Click "Drafts" folder
  - Should see email with red "Draft" badge
  - Subject should be "Draft Test Email"

- [ ] **Edit Draft**
  - Hover over draft email
  - Click edit icon (✏️)
  - Expected: Compose window opens with existing draft content

- [ ] **Modify and Resave Draft**
  - Change subject to: `Draft Test Email - Updated`
  - Add to body: ` Updated draft.`
  - Click "Save Draft"
  - Expected: Draft updated

- [ ] **Send Draft as Email**
  - Click "Drafts" folder
  - Click edit icon (✏️) on draft
  - Click "Send"
  - Expected: Draft moves to "Sent" folder, no longer in "Drafts"

---

### Phase 6: Trash/Delete Functionality
- [ ] **Delete to Trash**
  - Go to "Inbox"
  - Hover over any email
  - Click trash icon (🗑️)
  - Expected: Email removed from Inbox

- [ ] **Find in Trash**
  - Click "Trash" folder
  - Should see the deleted email
  - Email should show "Draft" status if it was a draft

- [ ] **Permanently Delete**
  - Open email in "Trash" folder
  - Click trash icon (🗑️)
  - Expected: Confirmation dialog
  - Click "Confirm"
  - Expected: Email permanently deleted, no longer visible

- [ ] **Verify Trash is Empty**
  - Click "Trash" folder
  - Should not see the email anymore

---

### Phase 7: Data Persistence
- [ ] **Refresh Page**
  - Load emails in "Inbox"
  - Press F5 (or Cmd+R on Mac)
  - Expected: Page reloads, emails still visible

- [ ] **Auto-refresh**
  - Load "Inbox"
  - Wait 30 seconds
  - Expected: Email counts update (if any new emails from other sources)

- [ ] **Navigate Away and Back**
  - Click different folders (Sent, Drafts, etc.)
  - Come back to "Inbox"
  - Expected: Emails reload correctly

---

### Phase 8: Sign Out / Session Management
- [ ] **Click Profile Icon**
  - Click avatar/profile in top-right corner
  - Expected: Dropdown menu appears with "Sign Out" option

- [ ] **Sign Out**
  - Click "Sign Out"
  - Expected: Redirected to login page

- [ ] **Login Again**
  - Enter credentials again
  - Expected: Session restored, can access emails

---

### Phase 9: Advanced Features
- [ ] **Search Emails**
  - Go to "Inbox"
  - Click search bar: "Search mail"
  - Type subject or sender
  - Expected: Results filter in real-time

- [ ] **Multiple Recipients**
  - Compose email with multiple recipients in "To" field
  - Format: `email1@test.com, email2@test.com`
  - Click "Send"
  - Expected: Email sent successfully

- [ ] **CC/BCC**
  - Compose email with CC and/or BCC recipients
  - Send
  - Expected: Works correctly

- [ ] **View Email Details**
  - Click email to open full view
  - Verify displays: From, To, CC, BCC, Subject, Body, Timestamp
  - Expected: All information correct

---

## 🔍 BACKEND TESTING (AWS CLI Commands)

Run these commands in terminal to verify backend is working:

### 1. Check Lambda Functions Deployed
```bash
aws lambda list-functions \
  --region us-east-1 \
  --query 'Functions[?contains(FunctionName, `vmail`)].{Name:FunctionName, Runtime:Runtime, LastModified:LastModified}' \
  --output table
```

Expected output should show all 8 functions:
- vmail-send-email (nodejs18.x)
- vmail-list-emails (python3.9)
- vmail-get-email (python3.9)
- vmail-delete-email (python3.9)
- vmail-mark-read (python3.9)
- vmail-mark-starred (python3.9)
- vmail-save-draft (nodejs18.x)
- vmail-receive-email (python3.9)

### 2. Check DynamoDB Table
```bash
aws dynamodb scan \
  --table-name vmail-emails \
  --region us-east-1 \
  --limit 10 \
  --projection-expression 'emailId, subject, folder, starred, isDraft'
```

Expected: Shows emails created during testing with correct attributes

### 3. Check S3 Bucket
```bash
aws s3 ls s3://vmail-emails-059409992687/emails/ --recursive | head -20
aws s3 ls s3://vmail-emails-059409992687/drafts/ --recursive | head -20
```

Expected: Files created during email and draft operations

### 4. Check API Gateway
```bash
aws apigateway get-rest-api \
  --rest-api-id 6izcc4sd18 \
  --region us-east-1 | jq '.name, .description'
```

Expected: `"vmail"`, API Gateway accessible

### 5. Check Cognito
```bash
aws cognito-idp describe-user-pool \
  --user-pool-id us-east-1_mCoiqnWRI \
  --region us-east-1 | jq '.UserPool.Name, .UserPool.Status'
```

Expected: `"vmail"`, `"Active"`

### 6. Check Lambda Logs
```bash
# View send-email logs
aws logs tail /aws/lambda/vmail-send-email \
  --region us-east-1 \
  --follow \
  --format short

# Or check for errors specifically
aws logs filter-log-events \
  --log-group-name /aws/lambda/vmail-send-email \
  --region us-east-1 \
  --query 'events[?contains(message, `Error`)]' \
  --output table
```

---

## 📊 EXPECTED RESULTS SUMMARY

### ✅ If All Tests Pass
- [ ] User can authenticate with Cognito
- [ ] Can compose and send emails via SendGrid
- [ ] Emails appear in "Sent" folder
- [ ] Can star/unstar emails
- [ ] Can save drafts and edit them
- [ ] Can delete emails to trash and permanently delete
- [ ] Data persists on page refresh
- [ ] Auto-refresh shows updates every 30 seconds
- [ ] Can sign out and sign back in
- [ ] No errors in browser console (F12 → Console tab)
- [ ] No errors in AWS Lambda logs

### ⚠️ If Tests Fail
Check the following:

**Authentication Fails:**
- Verify Cognito user pool ID and client ID in `.env`
- Check browser console (F12) for auth errors
- Verify AWS credentials configured locally

**Email Not Sending:**
- Check Lambda logs: `aws logs tail /aws/lambda/vmail-send-email --follow`
- Verify SendGrid API key in Lambda environment variables
- Check email format and recipient validity

**Data Not Persisting:**
- Verify DynamoDB table `vmail-emails` exists
- Check user ID matches across requests
- View DynamoDB items: `aws dynamodb scan --table-name vmail-emails --region us-east-1`

**Drafts Not Saving:**
- Check save-draft Lambda logs
- Verify S3 bucket exists and has `/drafts/` prefix
- Check DynamoDB for `isDraft: true` items

---

## 🔗 QUICK LINKS

- **Frontend**: http://localhost:3000
- **AWS Console**: https://console.aws.amazon.com
- **Cognito**: https://console.aws.amazon.com/cognito/v2/idp/user-pools/us-east-1_mCoiqnWRI/
- **DynamoDB**: https://console.aws.amazon.com/dynamodbv2/home?region=us-east-1#/tables/vmail-emails
- **S3**: https://console.aws.amazon.com/s3/buckets/vmail-emails-059409992687
- **Lambda**: https://console.aws.amazon.com/lambda/home?region=us-east-1#/functions
- **API Gateway**: https://console.aws.amazon.com/apigateway/main/apis/6izcc4sd18/stages/prod

---

## 📝 TEST EXECUTION LOG

**Started**: November 14, 2025
**Frontend Server**: ✅ Running on localhost:3000
**Status**: Ready for manual browser testing

Next steps:
1. Open http://localhost:3000 in browser
2. Follow the checklist above
3. Report any issues encountered
4. Check logs if features don't work

---

**Test Plan Version**: 1.0  
**Last Updated**: November 14, 2025

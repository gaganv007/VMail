# VMail - AWS Services Overview

## Overview
VMail is a Gmail-like email application using AWS serverless architecture with SendGrid for email delivery.

---

## AWS Services Used

### 1. **Amazon Cognito** (Authentication)
- **Purpose**: User authentication and authorization
- **Region**: us-east-1
- **User Pool**: `vmail-users`
- **Features**:
  - User registration and login
  - JWT token generation
  - Email verification
  - Password management
- **Usage**: Protects all API endpoints with JWT tokens

---

### 2. **Amazon DynamoDB** (Database)
- **Purpose**: Store email metadata
- **Region**: us-east-1
- **Table Name**: `vmail-emails`
- **Primary Key**: `emailId` (String)
- **Attributes Stored**:
  - `emailId`: Unique identifier
  - `userId`: Owner of the email
  - `from`: Sender email address
  - `to`: Recipient email addresses
  - `cc`: CC recipients
  - `bcc`: BCC recipients
  - `subject`: Email subject
  - `preview`: First 100 characters of body
  - `timestamp`: ISO timestamp
  - `folder`: inbox/sent/trash
  - `read`: Boolean
  - `hasAttachments`: Boolean
  - `s3Key`: Reference to full email in S3
  - `messageId`: SendGrid message ID

---

### 3. **Amazon S3** (Storage)
- **Purpose**: Store full email content and attachments
- **Region**: ap-south-2 (Mumbai)
- **Bucket Name**: `vmail-emails-059409992687`
- **Structure**:
  ```
  emails/
    ├── {userId}/
    │   ├── {emailId}.json
  ```
- **Stored Content**:
  - Full email body (HTML/text)
  - Attachments (base64 encoded)
  - Complete email metadata
  - SendGrid message IDs

---

### 4. **AWS Lambda** (Serverless Functions)
- **Purpose**: Backend API logic
- **Region**: us-east-1
- **Runtime**: Python 3.x & Node.js 18.x

#### Lambda Functions:

**a) `vmail-send-email`** (Node.js)
- **Trigger**: API Gateway POST /emails/send
- **Purpose**: Send emails via SendGrid
- **Features**:
  - SendGrid API integration
  - Attachment support (base64)
  - HTML email support
  - CC/BCC support
  - Store sent emails in DynamoDB + S3
- **Environment Variables**:
  - `SENDGRID_API_KEY`: SendGrid API key
  - `SENDGRID_FROM_EMAIL`: cloudmailproject@gmail.com
  - `DYNAMODB_TABLE`: vmail-emails
  - `S3_BUCKET`: vmail-emails-059409992687

**b) `vmail-list-emails`** (Python)
- **Trigger**: API Gateway GET /emails
- **Purpose**: List emails by folder (inbox/sent/trash)
- **Features**:
  - Filter by folder
  - Sort by timestamp
  - Pagination support
  - User isolation

**c) `vmail-get-email`** (Python)
- **Trigger**: API Gateway GET /emails/{emailId}
- **Purpose**: Get full email content
- **Features**:
  - Retrieve from DynamoDB + S3
  - Include attachments
  - Access control (user verification)

**d) `vmail-delete-email`** (Python)
- **Trigger**: API Gateway DELETE /emails/{emailId}
- **Purpose**: Delete or trash emails
- **Features**:
  - Move to trash (soft delete)
  - Permanent delete from trash
  - Delete from both DynamoDB and S3

**e) `vmail-mark-read`** (Python)
- **Trigger**: API Gateway PUT /emails/{emailId}/read
- **Purpose**: Mark email as read/unread
- **Features**: Update read status in DynamoDB

**f) `vmail-receive-email`** (Python)
- **Trigger**: S3 event when email arrives
- **Purpose**: Process incoming emails from SES
- **Features**:
  - Parse MIME email
  - Extract attachments
  - Store in DynamoDB + S3

---

### 5. **Amazon API Gateway** (REST API)
- **Purpose**: Expose Lambda functions as HTTP endpoints
- **Region**: us-east-1
- **API ID**: `6izcc4sd18`
- **Stage**: prod
- **Authorization**: Cognito User Pool Authorizer
- **CORS**: Enabled for all endpoints

#### API Endpoints:

| Method | Endpoint | Lambda Function | Description |
|--------|----------|----------------|-------------|
| POST | `/emails/send` | vmail-send-email | Send email |
| GET | `/emails` | vmail-list-emails | List emails |
| GET | `/emails/{emailId}` | vmail-get-email | Get email details |
| DELETE | `/emails/{emailId}` | vmail-delete-email | Delete email |
| PUT | `/emails/{emailId}/read` | vmail-mark-read | Mark as read |
| OPTIONS | `/*` | - | CORS preflight |

---

### 6. **Amazon SES** (Simple Email Service) - *Configured but using SendGrid instead*
- **Purpose**: Receive incoming emails
- **Region**: us-east-1
- **Domain**: vmail.com (or custom)
- **Status**: Configured for future use
- **Current**: Using SendGrid for both send and receive

---

### 7. **AWS IAM** (Identity & Access Management)
- **Purpose**: Permissions and roles
- **Roles**:
  - `vmail-lambda-execution-role`: Lambda execution permissions
  - Permissions: DynamoDB, S3, CloudWatch Logs, SES

---

## Third-Party Services

### SendGrid
- **Purpose**: Email delivery service
- **API Key**: Stored in Lambda environment variable
- **From Email**: cloudmailproject@gmail.com (verified)
- **Features Used**:
  - Email sending via API
  - Attachment support
  - HTML email support
  - Delivery tracking

---

## Architecture Diagram

```
┌─────────────┐
│   User      │
│  (Browser)  │
└──────┬──────┘
       │
       │ HTTPS
       ▼
┌─────────────────────────────────────┐
│   React Frontend (localhost:3000)   │
│   - Amplify (Cognito Auth)          │
└──────┬──────────────────────────────┘
       │
       │ REST API (JWT Token)
       ▼
┌─────────────────────────────────────┐
│   API Gateway (us-east-1)           │
│   - Cognito Authorizer              │
│   - CORS Enabled                    │
└──────┬──────────────────────────────┘
       │
       ├──► Lambda: send-email ────┐
       │                           │
       ├──► Lambda: list-emails    │
       │                           ▼
       ├──► Lambda: get-email  ┌───────────────┐
       │                       │   SendGrid    │
       ├──► Lambda: delete     │   (Email      │
       │                       │   Delivery)   │
       └──► Lambda: mark-read  └───────────────┘
              │
              ▼
       ┌──────────────┐
       │   DynamoDB   │◄────────┐
       │  (Metadata)  │         │
       └──────────────┘         │
              │                 │
              │                 │
              ▼                 │
       ┌──────────────┐         │
       │      S3      │         │
       │  (Content &  │         │
       │ Attachments) │─────────┘
       └──────────────┘
              ▲
              │
       ┌──────────────┐
       │     SES      │
       │  (Incoming)  │
       └──────────────┘
```

---

## Data Flow

### Sending Email:
1. User composes email in React frontend
2. Frontend sends POST request to API Gateway with JWT token
3. API Gateway validates token with Cognito
4. Lambda `send-email` processes request
5. Lambda sends email via SendGrid API
6. Lambda stores email metadata in DynamoDB
7. Lambda stores full email content in S3
8. Success response returned to frontend

### Receiving Email:
1. Email arrives at SES (future) or SendGrid
2. S3 receives raw email via SES rule
3. S3 event triggers Lambda `receive-email`
4. Lambda parses email and extracts attachments
5. Lambda stores metadata in DynamoDB
6. Lambda stores content in S3
7. Frontend polls for new emails

### Viewing Email:
1. User clicks email in list
2. Frontend requests email from API Gateway
3. Lambda `get-email` fetches metadata from DynamoDB
4. Lambda fetches full content from S3
5. Lambda combines and returns data
6. Frontend displays email with attachments

---

## Cost Optimization

- **Lambda**: Pay per invocation (very cheap for low traffic)
- **DynamoDB**: On-demand pricing (no idle costs)
- **S3**: Pay for storage only
- **Cognito**: Free tier: 50,000 MAUs
- **API Gateway**: Free tier: 1M requests/month
- **SendGrid**: Free tier: 100 emails/day

**Estimated Monthly Cost**: < $5 for moderate use

---

## Security Features

1. **Authentication**: Cognito JWT tokens
2. **Authorization**: User isolation via userId
3. **API Security**: API Gateway authorization
4. **Data Encryption**: S3 encryption at rest
5. **HTTPS**: All API calls over HTTPS
6. **CORS**: Restricted origins
7. **IAM**: Least privilege access

---

## Regions Used

| Service | Region | Reason |
|---------|--------|--------|
| Cognito | us-east-1 | Main region |
| DynamoDB | us-east-1 | Low latency |
| Lambda | us-east-1 | API Gateway region |
| API Gateway | us-east-1 | Main region |
| S3 | ap-south-2 | Data residency (Mumbai) |
| SES | us-east-1 | Service availability |

---

## Environment Variables Summary

### Frontend (.env)
```
REACT_APP_API_ENDPOINT=https://6izcc4sd18.execute-api.us-east-1.amazonaws.com/prod
REACT_APP_COGNITO_USER_POOL_ID=<user-pool-id>
REACT_APP_COGNITO_CLIENT_ID=<client-id>
REACT_APP_REGION=us-east-1
```

### Lambda (send-email)
```
DYNAMODB_TABLE=vmail-emails
S3_BUCKET=vmail-emails-059409992687
SENDGRID_API_KEY=SG.4yi8H0OORTOgRIK8Rg_JpA...
SENDGRID_FROM_EMAIL=cloudmailproject@gmail.com
AWS_REGION=us-east-1
```

### Lambda (other functions)
```
DYNAMODB_TABLE=vmail-emails
S3_BUCKET=vmail-emails-059409992687
AWS_REGION=us-east-1 (or ap-south-2 for S3 access)
```

---

## Attachment Handling

### Sending Attachments:
1. User selects file in frontend
2. File converted to base64 in browser
3. Sent with email body to API
4. Lambda passes to SendGrid
5. Lambda stores in S3 with email content

### Viewing Attachments:
1. Frontend fetches email with attachments
2. Attachments returned as base64 data
3. Frontend displays with download buttons
4. User clicks download
5. Browser converts base64 to file and downloads

### Attachment Format:
```json
{
  "filename": "document.pdf",
  "contentType": "application/pdf",
  "size": 102400,
  "data": "base64-encoded-content"
}
```

---

## Key Configuration Files

- **Frontend**: `/frontend/src/aws-config.js`
- **Infrastructure**: `/infrastructure/terraform/`
- **Lambda Functions**: `/lambda/<function-name>/`
- **Git Ignore**: `/.gitignore` (excludes secrets)

---

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Check API Gateway CORS settings
2. **Authorization Failed**: Verify Cognito token is valid
3. **S3 Access Denied**: Check S3 region matches (ap-south-2)
4. **Email Not Sending**: Verify SendGrid sender email is verified
5. **Attachments Not Showing**: Check S3 content and EmailViewer component

---

## Future Enhancements

- [ ] Use SES for receiving emails (reduce SendGrid dependency)
- [ ] Add CloudFront for frontend hosting
- [ ] Implement email search with OpenSearch
- [ ] Add email templates
- [ ] Scheduled email sending
- [ ] Email forwarding rules
- [ ] Mobile app with AWS Amplify

---

*Last Updated: November 12, 2025*

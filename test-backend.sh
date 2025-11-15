#!/bin/bash
# Comprehensive VMail Backend Testing Script
# Tests all Lambda functions, API endpoints, and AWS resources

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  VMail Backend Verification & Test Suite"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

REGION="us-east-1"
AWS_REGION_S3="ap-south-2"

# Function to print success
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Function to print error
print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Function to print info
print_info() {
    echo -e "${YELLOW}ℹ${NC} $1"
}

echo "1️⃣  TESTING LAMBDA FUNCTIONS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

FUNCTIONS=(
    "vmail-send-email:nodejs18.x"
    "vmail-list-emails:python3.9"
    "vmail-get-email:python3.9"
    "vmail-delete-email:python3.9"
    "vmail-mark-read:python3.9"
    "vmail-mark-starred:python3.9"
    "vmail-save-draft:nodejs18.x"
    "vmail-receive-email:python3.9"
)

LAMBDA_COUNT=0
for func_spec in "${FUNCTIONS[@]}"; do
    IFS=':' read -r func_name expected_runtime <<< "$func_spec"
    
    if aws lambda get-function --function-name "$func_name" --region "$REGION" &>/dev/null; then
        RUNTIME=$(aws lambda get-function-configuration --function-name "$func_name" --region "$REGION" --query 'Runtime' --output text)
        STATE=$(aws lambda get-function-configuration --function-name "$func_name" --region "$REGION" --query 'State' --output text)
        
        if [ "$RUNTIME" = "$expected_runtime" ] && [ "$STATE" = "Active" ]; then
            print_success "Function: $func_name ($RUNTIME)"
            LAMBDA_COUNT=$((LAMBDA_COUNT + 1))
        else
            print_error "Function: $func_name (Runtime: $RUNTIME, State: $STATE)"
        fi
    else
        print_error "Function: $func_name (NOT FOUND)"
    fi
done

echo ""
echo "2️⃣  TESTING DYNAMODB TABLE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if aws dynamodb describe-table --table-name vmail-emails --region "$REGION" &>/dev/null; then
    TABLE_STATUS=$(aws dynamodb describe-table --table-name vmail-emails --region "$REGION" --query 'Table.TableStatus' --output text)
    ITEM_COUNT=$(aws dynamodb describe-table --table-name vmail-emails --region "$REGION" --query 'Table.ItemCount' --output text)
    
    if [ "$TABLE_STATUS" = "ACTIVE" ]; then
        print_success "DynamoDB Table: vmail-emails ($TABLE_STATUS, $ITEM_COUNT items)"
    else
        print_error "DynamoDB Table: vmail-emails (Status: $TABLE_STATUS)"
    fi
else
    print_error "DynamoDB Table: vmail-emails (NOT FOUND)"
fi

echo ""
echo "3️⃣  TESTING S3 BUCKET"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if aws s3 ls s3://vmail-emails-059409992687 --region "$AWS_REGION_S3" &>/dev/null; then
    EMAIL_COUNT=$(aws s3 ls s3://vmail-emails-059409992687/emails/ --region "$AWS_REGION_S3" --recursive 2>/dev/null | wc -l || echo "0")
    DRAFT_COUNT=$(aws s3 ls s3://vmail-emails-059409992687/drafts/ --region "$AWS_REGION_S3" --recursive 2>/dev/null | wc -l || echo "0")
    
    print_success "S3 Bucket: vmail-emails-059409992687"
    print_info "  └─ Email files: $EMAIL_COUNT"
    print_info "  └─ Draft files: $DRAFT_COUNT"
else
    print_error "S3 Bucket: vmail-emails-059409992687 (NOT ACCESSIBLE)"
fi

echo ""
echo "4️⃣  TESTING API GATEWAY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if aws apigateway get-rest-api --rest-api-id 6izcc4sd18 --region "$REGION" &>/dev/null; then
    API_NAME=$(aws apigateway get-rest-api --rest-api-id 6izcc4sd18 --region "$REGION" --query 'name' --output text)
    
    # Get resources
    RESOURCES=$(aws apigateway get-resources --rest-api-id 6izcc4sd18 --region "$REGION" --query 'items[*].path' --output text | tr ' ' '\n' | sort | uniq)
    RESOURCE_COUNT=$(echo "$RESOURCES" | wc -l)
    
    print_success "API Gateway: $API_NAME"
    print_info "  └─ Resources: $RESOURCE_COUNT"
    
    # Check for specific endpoints
    for endpoint in "/emails" "/emails/{emailId}" "/emails/send" "/emails/{emailId}/read" "/emails/{emailId}/starred" "/emails/save-draft"; do
        if echo "$RESOURCES" | grep -q "^$endpoint$"; then
            print_success "  └─ Endpoint: $endpoint ✓"
        else
            print_error "  └─ Endpoint: $endpoint ✗"
        fi
    done
else
    print_error "API Gateway: 6izcc4sd18 (NOT FOUND)"
fi

echo ""
echo "5️⃣  TESTING COGNITO USER POOL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if aws cognito-idp describe-user-pool --user-pool-id us-east-1_mCoiqnWRI --region "$REGION" &>/dev/null; then
    POOL_STATUS=$(aws cognito-idp describe-user-pool --user-pool-id us-east-1_mCoiqnWRI --region "$REGION" --query 'UserPool.Status' --output text)
    USER_COUNT=$(aws cognito-idp list-users --user-pool-id us-east-1_mCoiqnWRI --region "$REGION" --query 'Users | length(@)' --output text)
    
    print_success "Cognito User Pool: us-east-1_mCoiqnWRI ($POOL_STATUS, $USER_COUNT users)"
else
    print_error "Cognito User Pool: us-east-1_mCoiqnWRI (NOT FOUND)"
fi

echo ""
echo "6️⃣  TESTING LAMBDA ENVIRONMENT VARIABLES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check send-email Lambda env vars
ENV_VARS=$(aws lambda get-function-configuration --function-name vmail-send-email --region "$REGION" --query 'Environment.Variables' --output json)

if echo "$ENV_VARS" | grep -q "SENDGRID_API_KEY"; then
    print_success "SendGrid API Key: Configured ✓"
else
    print_error "SendGrid API Key: NOT CONFIGURED ✗"
fi

if echo "$ENV_VARS" | grep -q "DYNAMODB_TABLE"; then
    print_success "DynamoDB Table: Configured ✓"
else
    print_error "DynamoDB Table: NOT CONFIGURED ✗"
fi

if echo "$ENV_VARS" | grep -q "S3_BUCKET"; then
    print_success "S3 Bucket: Configured ✓"
else
    print_error "S3 Bucket: NOT CONFIGURED ✗"
fi

echo ""
echo "7️⃣  CHECKING LAMBDA RECENT ERRORS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ERROR_COUNT=0
for func_spec in "${FUNCTIONS[@]}"; do
    IFS=':' read -r func_name _ <<< "$func_spec"
    
    ERRORS=$(aws logs filter-log-events \
        --log-group-name "/aws/lambda/$func_name" \
        --region "$REGION" \
        --filter-pattern "Error" \
        --start-time $(($(date +%s000) - 3600000)) \
        --query 'events[*].message' \
        --output text 2>/dev/null | wc -l || echo "0")
    
    if [ "$ERRORS" -gt 0 ]; then
        print_error "$func_name: $ERRORS errors in last hour"
        ERROR_COUNT=$((ERROR_COUNT + 1))
    else
        print_success "$func_name: No errors ✓"
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  📊 TEST SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
print_success "Lambda Functions: $LAMBDA_COUNT/${#FUNCTIONS[@]} deployed"
echo ""

if [ $ERROR_COUNT -eq 0 ]; then
    print_success "Backend Status: ✅ ALL SYSTEMS OPERATIONAL"
else
    print_error "Backend Status: ⚠️  ERRORS DETECTED ($ERROR_COUNT functions)"
fi

echo ""
print_info "Frontend: http://localhost:3000"
print_info "API Endpoint: https://6izcc4sd18.execute-api.us-east-1.amazonaws.com/prod"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

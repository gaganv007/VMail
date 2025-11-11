# API Gateway REST API
resource "aws_api_gateway_rest_api" "vmail" {
  name        = "${var.project_name}-api"
  description = "VMail API Gateway"

  endpoint_configuration {
    types = ["REGIONAL"]
  }

  tags = local.common_tags
}

# Cognito Authorizer
resource "aws_api_gateway_authorizer" "cognito" {
  name            = "${var.project_name}-cognito-authorizer"
  type            = "COGNITO_USER_POOLS"
  rest_api_id     = aws_api_gateway_rest_api.vmail.id
  provider_arns   = [aws_cognito_user_pool.vmail.arn]
  identity_source = "method.request.header.Authorization"
}

# /emails resource
resource "aws_api_gateway_resource" "emails" {
  rest_api_id = aws_api_gateway_rest_api.vmail.id
  parent_id   = aws_api_gateway_rest_api.vmail.root_resource_id
  path_part   = "emails"
}

# /emails/{emailId} resource
resource "aws_api_gateway_resource" "email_id" {
  rest_api_id = aws_api_gateway_rest_api.vmail.id
  parent_id   = aws_api_gateway_resource.emails.id
  path_part   = "{emailId}"
}

# /emails/{emailId}/read resource
resource "aws_api_gateway_resource" "email_read" {
  rest_api_id = aws_api_gateway_rest_api.vmail.id
  parent_id   = aws_api_gateway_resource.email_id.id
  path_part   = "read"
}

# /emails/send resource
resource "aws_api_gateway_resource" "send" {
  rest_api_id = aws_api_gateway_rest_api.vmail.id
  parent_id   = aws_api_gateway_resource.emails.id
  path_part   = "send"
}

# POST /emails/send - Send Email
module "send_email_method" {
  source = "./modules/api_method"

  rest_api_id   = aws_api_gateway_rest_api.vmail.id
  aws_region    = var.aws_region
  account_id    = local.account_id
  resource_id   = aws_api_gateway_resource.send.id
  http_method   = "POST"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
  lambda_arn    = aws_lambda_function.send_email.arn
  lambda_name   = aws_lambda_function.send_email.function_name
}

# GET /emails - List Emails
module "list_emails_method" {
  source = "./modules/api_method"

  rest_api_id   = aws_api_gateway_rest_api.vmail.id
  aws_region    = var.aws_region
  account_id    = local.account_id
  resource_id   = aws_api_gateway_resource.emails.id
  http_method   = "GET"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
  lambda_arn    = aws_lambda_function.list_emails.arn
  lambda_name   = aws_lambda_function.list_emails.function_name
}

# GET /emails/{emailId} - Get Email
module "get_email_method" {
  source = "./modules/api_method"

  rest_api_id   = aws_api_gateway_rest_api.vmail.id
  aws_region    = var.aws_region
  account_id    = local.account_id
  resource_id   = aws_api_gateway_resource.email_id.id
  http_method   = "GET"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
  lambda_arn    = aws_lambda_function.get_email.arn
  lambda_name   = aws_lambda_function.get_email.function_name
}

# DELETE /emails/{emailId} - Delete Email
module "delete_email_method" {
  source = "./modules/api_method"

  rest_api_id   = aws_api_gateway_rest_api.vmail.id
  aws_region    = var.aws_region
  account_id    = local.account_id
  resource_id   = aws_api_gateway_resource.email_id.id
  http_method   = "DELETE"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
  lambda_arn    = aws_lambda_function.delete_email.arn
  lambda_name   = aws_lambda_function.delete_email.function_name
}

# PUT /emails/{emailId}/read - Mark as Read
module "mark_read_method" {
  source = "./modules/api_method"

  rest_api_id   = aws_api_gateway_rest_api.vmail.id
  aws_region    = var.aws_region
  account_id    = local.account_id
  resource_id   = aws_api_gateway_resource.email_read.id
  http_method   = "PUT"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
  lambda_arn    = aws_lambda_function.mark_read.arn
  lambda_name   = aws_lambda_function.mark_read.function_name
}

# API Gateway Deployment
resource "aws_api_gateway_deployment" "vmail" {
  rest_api_id = aws_api_gateway_rest_api.vmail.id

  depends_on = [
    module.send_email_method,
    module.list_emails_method,
    module.get_email_method,
    module.delete_email_method,
    module.mark_read_method
  ]

  lifecycle {
    create_before_destroy = true
  }
}

# API Gateway Stage
resource "aws_api_gateway_stage" "prod" {
  deployment_id = aws_api_gateway_deployment.vmail.id
  rest_api_id   = aws_api_gateway_rest_api.vmail.id
  stage_name    = "prod"

  tags = local.common_tags
}

# Output
output "api_gateway_url" {
  value       = "${aws_api_gateway_stage.prod.invoke_url}"
  description = "API Gateway URL"
}

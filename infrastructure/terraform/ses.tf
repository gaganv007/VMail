# SES Domain Identity (if using a domain)
resource "aws_ses_domain_identity" "main" {
  count  = var.domain_name != "" ? 1 : 0
  domain = var.domain_name
}

# SES Domain DKIM
resource "aws_ses_domain_dkim" "main" {
  count  = var.domain_name != "" ? 1 : 0
  domain = aws_ses_domain_identity.main[0].domain
}

# SNS Topic for email notifications
resource "aws_sns_topic" "email_notifications" {
  name = "${var.project_name}-email-notifications"

  tags = local.common_tags
}

# Note: SES Receipt Rules are now enabled for us-east-1
# Email receiving is fully supported

# SES Receipt Rule Set
resource "aws_ses_receipt_rule_set" "main" {
  rule_set_name = "${var.project_name}-rule-set"
}

# Activate the rule set
resource "aws_ses_active_receipt_rule_set" "main" {
  rule_set_name = aws_ses_receipt_rule_set.main.rule_set_name
}

# SES Receipt Rule
resource "aws_ses_receipt_rule" "main" {
  name          = "${var.project_name}-receive-rule"
  rule_set_name = aws_ses_receipt_rule_set.main.rule_set_name
  recipients    = var.domain_name != "" ? [var.domain_name] : []
  enabled       = true
  scan_enabled  = true

  # Store email in S3
  s3_action {
    bucket_name       = aws_s3_bucket.emails.id
    object_key_prefix = "incoming/"
    position          = 1
  }

  # Trigger Lambda to process email
  lambda_action {
    function_arn    = aws_lambda_function.receive_email.arn
    invocation_type = "Event"
    position        = 2
  }

  depends_on = [
    aws_s3_bucket_policy.emails,
    aws_lambda_permission.ses_receive
  ]
}

# Outputs
output "ses_domain_identity" {
  value       = var.domain_name != "" ? aws_ses_domain_identity.main[0].arn : null
  description = "SES domain identity ARN"
}

output "ses_dkim_tokens" {
  value       = var.domain_name != "" ? aws_ses_domain_dkim.main[0].dkim_tokens : []
  description = "DKIM tokens for domain verification"
}

output "sns_topic_arn" {
  value       = aws_sns_topic.email_notifications.arn
  description = "SNS topic ARN for email notifications"
}

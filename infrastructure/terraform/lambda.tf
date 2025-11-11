# IAM Role for Lambda
resource "aws_iam_role" "lambda_execution" {
  name = "${var.project_name}-lambda-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = local.common_tags
}

# IAM Policy for Lambda
resource "aws_iam_role_policy" "lambda_policy" {
  name = "${var.project_name}-lambda-policy"
  role = aws_iam_role.lambda_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Resource = [
          aws_dynamodb_table.emails.arn,
          "${aws_dynamodb_table.emails.arn}/index/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject"
        ]
        Resource = "${aws_s3_bucket.emails.arn}/*"
      },
      {
        Effect = "Allow"
        Action = [
          "ses:SendEmail",
          "ses:SendRawEmail"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "sns:Publish"
        ]
        Resource = aws_sns_topic.email_notifications.arn
      }
    ]
  })
}

# Lambda Function: Send Email
resource "aws_lambda_function" "send_email" {
  filename         = "${path.module}/send-email.zip"
  function_name    = "${var.project_name}-send-email"
  role            = aws_iam_role.lambda_execution.arn
  handler         = "lambda_function.lambda_handler"
  runtime         = "python3.9"
  timeout         = 30
  memory_size     = 256

  environment {
    variables = {
      DYNAMODB_TABLE = aws_dynamodb_table.emails.name
      S3_BUCKET      = aws_s3_bucket.emails.id
    }
  }

  tags = local.common_tags
}

# Lambda Function: List Emails
resource "aws_lambda_function" "list_emails" {
  filename         = "${path.module}/list-emails.zip"
  function_name    = "${var.project_name}-list-emails"
  role            = aws_iam_role.lambda_execution.arn
  handler         = "lambda_function.lambda_handler"
  runtime         = "python3.9"
  timeout         = 30
  memory_size     = 256

  environment {
    variables = {
      DYNAMODB_TABLE = aws_dynamodb_table.emails.name
    }
  }

  tags = local.common_tags
}

# Lambda Function: Get Email
resource "aws_lambda_function" "get_email" {
  filename         = "${path.module}/get-email.zip"
  function_name    = "${var.project_name}-get-email"
  role            = aws_iam_role.lambda_execution.arn
  handler         = "lambda_function.lambda_handler"
  runtime         = "python3.9"
  timeout         = 30
  memory_size     = 256

  environment {
    variables = {
      DYNAMODB_TABLE = aws_dynamodb_table.emails.name
      S3_BUCKET      = aws_s3_bucket.emails.id
    }
  }

  tags = local.common_tags
}

# Lambda Function: Delete Email
resource "aws_lambda_function" "delete_email" {
  filename         = "${path.module}/delete-email.zip"
  function_name    = "${var.project_name}-delete-email"
  role            = aws_iam_role.lambda_execution.arn
  handler         = "lambda_function.lambda_handler"
  runtime         = "python3.9"
  timeout         = 30
  memory_size     = 256

  environment {
    variables = {
      DYNAMODB_TABLE = aws_dynamodb_table.emails.name
      S3_BUCKET      = aws_s3_bucket.emails.id
    }
  }

  tags = local.common_tags
}

# Lambda Function: Mark as Read
resource "aws_lambda_function" "mark_read" {
  filename         = "${path.module}/mark-read.zip"
  function_name    = "${var.project_name}-mark-read"
  role            = aws_iam_role.lambda_execution.arn
  handler         = "lambda_function.lambda_handler"
  runtime         = "python3.9"
  timeout         = 30
  memory_size     = 256

  environment {
    variables = {
      DYNAMODB_TABLE = aws_dynamodb_table.emails.name
    }
  }

  tags = local.common_tags
}

# Lambda Function: Receive Email
resource "aws_lambda_function" "receive_email" {
  filename         = "${path.module}/receive-email.zip"
  function_name    = "${var.project_name}-receive-email"
  role            = aws_iam_role.lambda_execution.arn
  handler         = "lambda_function.lambda_handler"
  runtime         = "python3.9"
  timeout         = 60
  memory_size     = 512

  environment {
    variables = {
      DYNAMODB_TABLE = aws_dynamodb_table.emails.name
      S3_BUCKET      = aws_s3_bucket.emails.id
      SNS_TOPIC_ARN  = aws_sns_topic.email_notifications.arn
    }
  }

  tags = local.common_tags
}

# Note: Email receiving is now enabled for us-east-1

# Lambda Permission for SES
resource "aws_lambda_permission" "ses_receive" {
  statement_id  = "AllowExecutionFromSES"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.receive_email.function_name
  principal     = "ses.amazonaws.com"
  source_account = local.account_id
}

# Lambda Permission for S3
resource "aws_lambda_permission" "s3_receive" {
  statement_id  = "AllowExecutionFromS3"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.receive_email.function_name
  principal     = "s3.amazonaws.com"
  source_arn    = aws_s3_bucket.emails.arn
}

# S3 Bucket Notification
resource "aws_s3_bucket_notification" "email_received" {
  bucket = aws_s3_bucket.emails.id

  lambda_function {
    lambda_function_arn = aws_lambda_function.receive_email.arn
    events              = ["s3:ObjectCreated:*"]
    filter_prefix       = "incoming/"
  }

  depends_on = [aws_lambda_permission.s3_receive]
}

# Outputs
output "lambda_send_email_arn" {
  value       = aws_lambda_function.send_email.arn
  description = "Send email Lambda ARN"
}

output "lambda_list_emails_arn" {
  value       = aws_lambda_function.list_emails.arn
  description = "List emails Lambda ARN"
}

output "lambda_get_email_arn" {
  value       = aws_lambda_function.get_email.arn
  description = "Get email Lambda ARN"
}

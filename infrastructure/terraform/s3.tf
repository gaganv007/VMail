# S3 Bucket for Email Storage
resource "aws_s3_bucket" "emails" {
  bucket = "${var.project_name}-emails-${local.account_id}"

  tags = local.common_tags
}

# Block public access
resource "aws_s3_bucket_public_access_block" "emails" {
  bucket = aws_s3_bucket.emails.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Enable versioning
resource "aws_s3_bucket_versioning" "emails" {
  bucket = aws_s3_bucket.emails.id

  versioning_configuration {
    status = "Enabled"
  }
}

# Enable encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "emails" {
  bucket = aws_s3_bucket.emails.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Lifecycle policy
resource "aws_s3_bucket_lifecycle_configuration" "emails" {
  bucket = aws_s3_bucket.emails.id

  rule {
    id     = "delete-old-emails"
    status = "Enabled"

    expiration {
      days = 90
    }

    noncurrent_version_expiration {
      noncurrent_days = 30
    }
  }
}

# Bucket policy for SES
resource "aws_s3_bucket_policy" "emails" {
  bucket = aws_s3_bucket.emails.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowSESPuts"
        Effect = "Allow"
        Principal = {
          Service = "ses.amazonaws.com"
        }
        Action   = "s3:PutObject"
        Resource = "${aws_s3_bucket.emails.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceAccount" = local.account_id
          }
        }
      }
    ]
  })
}

# Output
output "s3_bucket_name" {
  value       = aws_s3_bucket.emails.id
  description = "S3 bucket name"
}

output "s3_bucket_arn" {
  value       = aws_s3_bucket.emails.arn
  description = "S3 bucket ARN"
}

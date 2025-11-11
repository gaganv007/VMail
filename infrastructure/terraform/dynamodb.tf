# DynamoDB Table for Email Metadata
resource "aws_dynamodb_table" "emails" {
  name           = "${var.project_name}-emails"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "emailId"

  attribute {
    name = "emailId"
    type = "S"
  }

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "folder"
    type = "S"
  }

  attribute {
    name = "timestamp"
    type = "S"
  }

  # GSI for querying by userId and folder
  global_secondary_index {
    name            = "userId-folder-index"
    hash_key        = "userId"
    range_key       = "folder"
    projection_type = "ALL"
  }

  # GSI for querying by userId and timestamp
  global_secondary_index {
    name            = "userId-timestamp-index"
    hash_key        = "userId"
    range_key       = "timestamp"
    projection_type = "ALL"
  }

  # Enable point-in-time recovery
  point_in_time_recovery {
    enabled = true
  }

  # Enable encryption
  server_side_encryption {
    enabled = true
  }

  tags = local.common_tags
}

# Output
output "dynamodb_table_name" {
  value       = aws_dynamodb_table.emails.name
  description = "DynamoDB table name"
}

output "dynamodb_table_arn" {
  value       = aws_dynamodb_table.emails.arn
  description = "DynamoDB table ARN"
}

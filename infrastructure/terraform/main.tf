terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Variables
variable "aws_region" {
  description = "AWS region - US East (N. Virginia)"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "vmail"
}

variable "domain_name" {
  description = "Domain name for receiving emails"
  type        = string
}

variable "sendgrid_api_key" {
  description = "SendGrid API Key for sending emails"
  type        = string
  sensitive   = true
}

variable "sendgrid_from_email" {
  description = "SendGrid verified sender email"
  type        = string
  default     = "noreply@vmail.com"
}

# Data sources
data "aws_caller_identity" "current" {}

# Locals
locals {
  account_id = data.aws_caller_identity.current.account_id
  common_tags = {
    Project     = var.project_name
    Environment = "production"
    ManagedBy   = "terraform"
  }
}

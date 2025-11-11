#!/bin/bash

set -e

echo "================================================"
echo "Packaging Lambda Functions for VMail"
echo "================================================"

FUNCTIONS=("send-email" "list-emails" "get-email" "delete-email" "mark-read" "receive-email")
OUTPUT_DIR="../infrastructure/terraform"

# Create output directory if it doesn't exist
mkdir -p $OUTPUT_DIR

for FUNCTION in "${FUNCTIONS[@]}"; do
  echo ""
  echo "Processing $FUNCTION..."

  if [ ! -d "$FUNCTION" ]; then
    echo "ERROR: Directory $FUNCTION not found!"
    continue
  fi

  cd $FUNCTION

  # Install dependencies if requirements.txt exists
  if [ -f requirements.txt ]; then
    echo "Installing dependencies..."
    pip install -r requirements.txt -t . --upgrade --quiet
  fi

  # Create zip file
  echo "Creating zip package..."
  zip -r $OUTPUT_DIR/$FUNCTION.zip . \
    -x "*.pyc" \
    -x "*__pycache__/*" \
    -x "*.git/*" \
    -x "*.DS_Store" \
    --quiet

  cd ..
  echo "✓ $FUNCTION packaged successfully"
done

echo ""
echo "================================================"
echo "All Lambda functions packaged successfully!"
echo "Packages saved to: $OUTPUT_DIR"
echo "================================================"

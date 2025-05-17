#!/bin/bash

# Default values
DEFAULT_USERNAME="admin"
DEFAULT_PASSWORD="adminpassword"
DEFAULT_NAME="Admin User"
DEFAULT_EMAIL="admin@example.com"
DEFAULT_SECRET="admin_setup_secret"
DEFAULT_URL="http://localhost:5050/api/auth/admin/create"

# Get user input or use defaults
read -p "Admin Username [$DEFAULT_USERNAME]: " USERNAME
USERNAME=${USERNAME:-$DEFAULT_USERNAME}

read -p "Admin Password [$DEFAULT_PASSWORD]: " -s PASSWORD
PASSWORD=${PASSWORD:-$DEFAULT_PASSWORD}
echo ""

read -p "Admin Name [$DEFAULT_NAME]: " NAME
NAME=${NAME:-$DEFAULT_NAME}

read -p "Admin Email [$DEFAULT_EMAIL]: " EMAIL
EMAIL=${EMAIL:-$DEFAULT_EMAIL}

read -p "Admin Secret [$DEFAULT_SECRET]: " -s SECRET
SECRET=${SECRET:-$DEFAULT_SECRET}
echo ""

read -p "Server URL [$DEFAULT_URL]: " URL
URL=${URL:-$DEFAULT_URL}

echo "Creating admin user..."

# Create the curl command
curl -X POST "$URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"$USERNAME\",
    \"password\": \"$PASSWORD\",
    \"name\": \"$NAME\",
    \"email\": \"$EMAIL\",
    \"adminSecret\": \"$SECRET\"
  }"

echo -e "\nAdmin creation request sent. Please check the response above."

#!/bin/bash

# Test script for Student APIs
# This script tests the complete flow: login -> add student

BASE_URL="http://localhost:5007/api/v1"
COOKIE_FILE="test_cookies.txt"

echo "🔵 Starting Student API Test..."

# Clean up any existing cookies
rm -f $COOKIE_FILE

echo "📋 Step 1: Login to get authentication cookies..."

# Login to get cookies
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin@school-admin.com",
    "password": "3OU4zn3q6Zh9"
  }' \
  -c "$COOKIE_FILE" \
  -w "HTTP_CODE:%{http_code}")

LOGIN_HTTP_CODE=$(echo "$LOGIN_RESPONSE" | grep -o "HTTP_CODE:[0-9]*" | cut -d: -f2)
LOGIN_BODY=$(echo "$LOGIN_RESPONSE" | sed 's/HTTP_CODE:[0-9]*$//')

echo "Login HTTP Code: $LOGIN_HTTP_CODE"

if [ "$LOGIN_HTTP_CODE" != "200" ]; then
    echo "❌ Login failed with HTTP code: $LOGIN_HTTP_CODE"
    echo "Response: $LOGIN_BODY"
    exit 1
fi

echo "✅ Login successful!"
echo "Response: $LOGIN_BODY"

# Extract CSRF token from cookies
CSRF_TOKEN=$(grep csrfToken "$COOKIE_FILE" | cut -f7)

if [ -z "$CSRF_TOKEN" ]; then
    echo "❌ Failed to extract CSRF token from cookies"
    exit 1
fi

echo "🔑 CSRF Token: $CSRF_TOKEN"

echo ""
echo "📋 Step 2: Test Add Student API..."

# Test add student
STUDENT_RESPONSE=$(curl -s -X POST "$BASE_URL/students" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: $CSRF_TOKEN" \
  -b "$COOKIE_FILE" \
  -d '{
    "name": "Test Student",
    "gender": "Male",
    "dob": "2000-01-01",
    "phone": "1234567890",
    "email": "unique.test.student@example.com",
    "class": "10",
    "section": "A",
    "roll": 12345,
    "admissionDate": "2024-01-15",
    "currentAddress": "123 Test Street",
    "permanentAddress": "123 Test Street",
    "fatherName": "Test Father",
    "fatherPhone": "1234567891",
    "motherName": "Test Mother",
    "motherPhone": "1234567892",
    "guardianName": "Test Guardian",
    "guardianPhone": "1234567893",
    "relationOfGuardian": "Father",
    "systemAccess": false
  }' \
  -w "HTTP_CODE:%{http_code}")

STUDENT_HTTP_CODE=$(echo "$STUDENT_RESPONSE" | grep -o "HTTP_CODE:[0-9]*" | cut -d: -f2)
STUDENT_BODY=$(echo "$STUDENT_RESPONSE" | sed 's/HTTP_CODE:[0-9]*$//')

echo "Add Student HTTP Code: $STUDENT_HTTP_CODE"
echo "Response: $STUDENT_BODY"

if [ "$STUDENT_HTTP_CODE" = "200" ] || [ "$STUDENT_HTTP_CODE" = "201" ]; then
    echo "✅ Student added successfully!"
else
    echo "❌ Failed to add student. HTTP code: $STUDENT_HTTP_CODE"
fi

echo ""
echo "📋 Step 3: Test Get Students API..."

# Test get all students
GET_RESPONSE=$(curl -s -X GET "$BASE_URL/students" \
  -H "x-csrf-token: $CSRF_TOKEN" \
  -b "$COOKIE_FILE" \
  -w "HTTP_CODE:%{http_code}")

GET_HTTP_CODE=$(echo "$GET_RESPONSE" | grep -o "HTTP_CODE:[0-9]*" | cut -d: -f2)
GET_BODY=$(echo "$GET_RESPONSE" | sed 's/HTTP_CODE:[0-9]*$//')

echo "Get Students HTTP Code: $GET_HTTP_CODE"
echo "Response: $GET_BODY"

if [ "$GET_HTTP_CODE" = "200" ]; then
    echo "✅ Students retrieved successfully!"
else
    echo "❌ Failed to get students. HTTP code: $GET_HTTP_CODE"
fi

# Clean up
rm -f "$COOKIE_FILE"

echo ""
echo "🏁 Test completed!"

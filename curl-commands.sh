#!/bin/bash

################################################################################
# Solo Dev Manager API - cURL Test Commands
# Purpose: Test all API endpoints without running the application UI
# Usage:
#   1. Update configuration variables below
#   2. Run individual commands by copying/pasting
#   3. Or run entire script: chmod +x curl-commands.sh && ./curl-commands.sh
################################################################################

# Configuration Variables
BASE_URL="http://localhost:3000"
CRON_SECRET="your-cron-secret-here"
APP_ID="your-marketing-app-id-here"
TEST_EMAIL="test@example.com"
TEST_NAME="Test User"
REFERRAL_CODE="FRIEND2024"
CONFIRMATION_TOKEN="token-from-email"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

################################################################################
# Helper Functions
################################################################################

print_header() {
    echo ""
    echo -e "${YELLOW}========================================${NC}"
    echo -e "${YELLOW}$1${NC}"
    echo -e "${YELLOW}========================================${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

################################################################################
# Marketing Public APIs
################################################################################

test_waitlist_submission() {
    print_header "Test 1: Waitlist Submission"

    print_info "Submitting email to waitlist..."

    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/marketing/public/waitlist?app_id=$APP_ID" \
      -H "Content-Type: application/json" \
      -d "{
        \"email\": \"$TEST_EMAIL\",
        \"name\": \"$TEST_NAME\",
        \"referral_source\": \"organic\"
      }")

    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')

    echo "Response: $BODY"
    echo "HTTP Code: $HTTP_CODE"

    if [ "$HTTP_CODE" -eq 200 ]; then
        print_success "Waitlist submission successful"
    else
        print_error "Waitlist submission failed"
    fi
}

test_waitlist_confirmation() {
    print_header "Test 2: Waitlist Email Confirmation"

    print_info "Confirming email with token..."

    RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/marketing/public/waitlist/confirm?token=$CONFIRMATION_TOKEN")

    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')

    echo "Response: $BODY"
    echo "HTTP Code: $HTTP_CODE"

    if [ "$HTTP_CODE" -eq 200 ]; then
        print_success "Email confirmation successful"
    else
        print_error "Email confirmation failed (check token)"
    fi
}

test_referral_tracking() {
    print_header "Test 3: Referral Tracking"

    print_info "Tracking referral click..."

    RESPONSE=$(curl -s -w "\n%{http_code}" -L -X GET "$BASE_URL/api/marketing/public/referral/track?code=$REFERRAL_CODE&utm_source=twitter&utm_campaign=launch")

    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')

    echo "Response: $BODY"
    echo "HTTP Code: $HTTP_CODE"

    if [ "$HTTP_CODE" -eq 200 ] || [ "$HTTP_CODE" -eq 302 ]; then
        print_success "Referral tracking successful"
    else
        print_error "Referral tracking failed"
    fi
}

################################################################################
# Cron Job Endpoints
################################################################################

test_publish_scheduled_posts() {
    print_header "Test 4: Publish Scheduled Posts (Cron)"

    print_info "Triggering scheduled post publishing..."

    RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/marketing/cron/publish-scheduled-posts" \
      -H "Authorization: Bearer $CRON_SECRET")

    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')

    echo "Response: $BODY"
    echo "HTTP Code: $HTTP_CODE"

    if [ "$HTTP_CODE" -eq 200 ]; then
        print_success "Publish posts cron job successful"
    elif [ "$HTTP_CODE" -eq 401 ] || [ "$HTTP_CODE" -eq 403 ]; then
        print_error "Authentication failed - check CRON_SECRET"
    else
        print_error "Publish posts cron job failed"
    fi
}

test_sync_comments() {
    print_header "Test 5: Sync Comments from Platforms (Cron)"

    print_info "Triggering comment sync..."

    RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/marketing/cron/sync-comments" \
      -H "Authorization: Bearer $CRON_SECRET")

    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')

    echo "Response: $BODY"
    echo "HTTP Code: $HTTP_CODE"

    if [ "$HTTP_CODE" -eq 200 ]; then
        print_success "Sync comments cron job successful"
    elif [ "$HTTP_CODE" -eq 401 ] || [ "$HTTP_CODE" -eq 403 ]; then
        print_error "Authentication failed - check CRON_SECRET"
    else
        print_error "Sync comments cron job failed"
    fi
}

test_recovery_emails() {
    print_header "Test 6: Send Recovery Emails (Cron)"

    print_info "Triggering cart abandonment emails..."

    RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/marketing/cron/send-recovery-emails" \
      -H "Authorization: Bearer $CRON_SECRET")

    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')

    echo "Response: $BODY"
    echo "HTTP Code: $HTTP_CODE"

    if [ "$HTTP_CODE" -eq 200 ]; then
        print_success "Recovery emails cron job successful"
    elif [ "$HTTP_CODE" -eq 401 ] || [ "$HTTP_CODE" -eq 403 ]; then
        print_error "Authentication failed - check CRON_SECRET"
    else
        print_error "Recovery emails cron job failed"
    fi
}

################################################################################
# Validation Tests (Expected Failures)
################################################################################

test_invalid_email() {
    print_header "Test 7: Invalid Email (Expected Failure)"

    print_info "Submitting invalid email format..."

    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/marketing/public/waitlist?app_id=$APP_ID" \
      -H "Content-Type: application/json" \
      -d "{
        \"email\": \"invalid-email\",
        \"name\": \"Test\"
      }")

    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')

    echo "Response: $BODY"
    echo "HTTP Code: $HTTP_CODE"

    if [ "$HTTP_CODE" -eq 400 ]; then
        print_success "Validation correctly rejected invalid email"
    else
        print_error "Validation should have rejected invalid email"
    fi
}

test_missing_app_id() {
    print_header "Test 8: Missing App ID (Expected Failure)"

    print_info "Submitting without app_id..."

    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/marketing/public/waitlist" \
      -H "Content-Type: application/json" \
      -d "{
        \"email\": \"$TEST_EMAIL\",
        \"name\": \"Test\"
      }")

    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')

    echo "Response: $BODY"
    echo "HTTP Code: $HTTP_CODE"

    if [ "$HTTP_CODE" -eq 400 ]; then
        print_success "Correctly rejected missing app_id"
    else
        print_error "Should have rejected missing app_id"
    fi
}

test_invalid_cron_secret() {
    print_header "Test 9: Invalid CRON_SECRET (Expected Failure)"

    print_info "Calling cron endpoint with wrong secret..."

    RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/marketing/cron/publish-scheduled-posts" \
      -H "Authorization: Bearer wrong-secret")

    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')

    echo "Response: $BODY"
    echo "HTTP Code: $HTTP_CODE"

    if [ "$HTTP_CODE" -eq 401 ] || [ "$HTTP_CODE" -eq 403 ]; then
        print_success "Correctly rejected invalid CRON_SECRET"
    else
        print_error "Should have rejected invalid CRON_SECRET"
    fi
}

test_missing_cron_secret() {
    print_header "Test 10: Missing CRON_SECRET (Expected Failure)"

    print_info "Calling cron endpoint without auth header..."

    RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/marketing/cron/publish-scheduled-posts")

    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')

    echo "Response: $BODY"
    echo "HTTP Code: $HTTP_CODE"

    if [ "$HTTP_CODE" -eq 401 ]; then
        print_success "Correctly rejected missing CRON_SECRET"
    else
        print_error "Should have rejected missing CRON_SECRET"
    fi
}

################################################################################
# Additional Test Scenarios
################################################################################

test_invalid_referral_code() {
    print_header "Test 11: Invalid Referral Code (Expected Failure)"

    print_info "Tracking with invalid referral code..."

    RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/marketing/public/referral/track?code=INVALID_CODE_12345")

    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')

    echo "Response: $BODY"
    echo "HTTP Code: $HTTP_CODE"

    if [ "$HTTP_CODE" -eq 400 ] || [ "$HTTP_CODE" -eq 404 ]; then
        print_success "Correctly rejected invalid referral code"
    else
        print_error "Should have rejected invalid referral code"
    fi
}

test_duplicate_waitlist() {
    print_header "Test 12: Duplicate Waitlist Submission"

    print_info "Submitting same email twice..."

    # First submission
    curl -s -X POST "$BASE_URL/api/marketing/public/waitlist?app_id=$APP_ID" \
      -H "Content-Type: application/json" \
      -d "{\"email\": \"duplicate@example.com\", \"name\": \"Test\"}" > /dev/null

    # Second submission (should fail or return same message)
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/marketing/public/waitlist?app_id=$APP_ID" \
      -H "Content-Type: application/json" \
      -d "{\"email\": \"duplicate@example.com\", \"name\": \"Test\"}")

    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')

    echo "Response: $BODY"
    echo "HTTP Code: $HTTP_CODE"

    if [ "$HTTP_CODE" -eq 200 ] || [ "$HTTP_CODE" -eq 409 ]; then
        print_success "Duplicate submission handled correctly"
    else
        print_error "Duplicate submission handling unexpected"
    fi
}

################################################################################
# Manual Test Commands (Copy/Paste)
################################################################################

print_manual_commands() {
    print_header "Manual Test Commands"

    cat << 'EOF'
# Copy and paste these commands to test individually:

# 1. Submit to Waitlist
curl -X POST "http://localhost:3000/api/marketing/public/waitlist?app_id=YOUR_APP_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "referral_source": "twitter"
  }'

# 2. Confirm Email (use token from email)
curl -X GET "http://localhost:3000/api/marketing/public/waitlist/confirm?token=TOKEN_FROM_EMAIL"

# 3. Track Referral
curl -X GET "http://localhost:3000/api/marketing/public/referral/track?code=REFERRAL_CODE&utm_source=twitter"

# 4. Publish Scheduled Posts (Cron)
curl -X GET "http://localhost:3000/api/marketing/cron/publish-scheduled-posts" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# 5. Sync Comments (Cron)
curl -X GET "http://localhost:3000/api/marketing/cron/sync-comments" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# 6. Send Recovery Emails (Cron)
curl -X GET "http://localhost:3000/api/marketing/cron/send-recovery-emails" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Test Invalid Cases

# Invalid email format
curl -X POST "http://localhost:3000/api/marketing/public/waitlist?app_id=YOUR_APP_ID" \
  -H "Content-Type: application/json" \
  -d '{"email": "not-an-email", "name": "Test"}'

# Missing app_id
curl -X POST "http://localhost:3000/api/marketing/public/waitlist" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "name": "Test"}'

# Invalid CRON_SECRET
curl -X GET "http://localhost:3000/api/marketing/cron/publish-scheduled-posts" \
  -H "Authorization: Bearer wrong-secret"

# Missing CRON_SECRET
curl -X GET "http://localhost:3000/api/marketing/cron/publish-scheduled-posts"

EOF
}

################################################################################
# Main Execution
################################################################################

main() {
    print_header "Solo Dev Manager API Test Suite"

    echo "Configuration:"
    echo "  BASE_URL: $BASE_URL"
    echo "  APP_ID: $APP_ID"
    echo "  TEST_EMAIL: $TEST_EMAIL"
    echo "  CRON_SECRET: ${CRON_SECRET:0:10}..." # Show first 10 chars only
    echo ""

    # Check if configuration is set
    if [ "$CRON_SECRET" == "your-cron-secret-here" ] || [ "$APP_ID" == "your-marketing-app-id-here" ]; then
        print_error "Please update configuration variables at the top of this script"
        echo ""
        echo "Required variables:"
        echo "  - CRON_SECRET: Your cron job secret"
        echo "  - APP_ID: A valid marketing app ID from your database"
        echo ""
        echo "Optional:"
        echo "  - BASE_URL (default: http://localhost:3000)"
        echo "  - TEST_EMAIL (default: test@example.com)"
        echo ""
        exit 1
    fi

    # Check if server is running
    if ! curl -s "$BASE_URL" > /dev/null; then
        print_error "Server is not running at $BASE_URL"
        echo ""
        echo "Start the server with: npm run dev"
        echo ""
        exit 1
    fi

    print_success "Server is running at $BASE_URL"
    echo ""

    # Run all tests
    test_waitlist_submission
    test_waitlist_confirmation
    test_referral_tracking
    test_publish_scheduled_posts
    test_sync_comments
    test_recovery_emails
    test_invalid_email
    test_missing_app_id
    test_invalid_cron_secret
    test_missing_cron_secret
    test_invalid_referral_code
    test_duplicate_waitlist

    # Print manual commands
    print_manual_commands

    print_header "Test Suite Complete"
    print_info "Review results above for any failures"
}

# Run main function if script is executed (not sourced)
if [ "${BASH_SOURCE[0]}" -ef "$0" ]; then
    main "$@"
fi

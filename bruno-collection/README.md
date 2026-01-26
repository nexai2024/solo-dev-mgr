# Solo Dev Manager - Bruno API Collection

Git-friendly API testing collection for the Solo Dev Manager platform.

## What is Bruno?

Bruno is an open-source API client that stores collections as plain text files (`.bru` format) in your Git repository. Unlike Postman, Bruno collections are:
- Version controlled
- Diff-friendly
- Collaborative (via Git)
- No account required

## Installation

### Desktop App (Recommended)
```bash
# macOS
brew install bruno

# Windows
choco install bruno

# Or download from: https://www.usebruno.com/downloads
```

### CLI (For CI/CD)
```bash
npm install -g @usebruno/cli
```

## Usage

### 1. Open Collection in Bruno Desktop

1. Launch Bruno
2. Click "Open Collection"
3. Navigate to this directory: `bruno-collection/`
4. Bruno will load all requests

### 2. Configure Environment

**Choose environment:**
- **Local** - For local development (http://localhost:3000)
- **Production** - For production API (https://your-domain.com)

**Update variables:**
1. Click environment dropdown (top-right)
2. Select "local" or "production"
3. Edit variables:
   - `appId` - Your marketing app ID (get from database)
   - `cronSecret` - Your CRON_SECRET from .env
   - `testEmail` - Email for testing waitlist
   - `referralCode` - Valid referral code (create in app first)
   - `confirmationToken` - Token from confirmation email

### 3. Run Requests

**Single Request:**
1. Click on request (e.g., "Submit to Waitlist")
2. Click "Send" button
3. View response in bottom panel
4. Check assertions (✅/❌)

**All Requests:**
1. Right-click on collection root
2. Select "Run Collection"
3. View test results

### 4. View Documentation

Each request has embedded documentation. Click request → "Docs" tab.

## Collection Structure

```
bruno-collection/
├── bruno.json                    # Collection metadata
├── environments/
│   ├── local.bru                # Local environment variables
│   └── production.bru           # Production environment variables
├── marketing/
│   ├── waitlist-submit.bru      # POST /api/marketing/public/waitlist
│   ├── waitlist-confirm.bru     # GET /api/marketing/public/waitlist/confirm
│   └── referral-track.bru       # GET /api/marketing/public/referral/track
├── cron/
│   ├── publish-posts.bru        # Publish scheduled posts
│   ├── sync-comments.bru        # Sync comments from platforms
│   └── recovery-emails.bru      # Send cart abandonment emails
└── README.md                     # This file
```

## Request List

### Marketing Public APIs (No Auth)
- ✅ **Submit to Waitlist** - Add email to waitlist with double opt-in
- ✅ **Confirm Waitlist Email** - Verify email from confirmation link
- ✅ **Track Referral Click** - Log referral clicks and redirect

### Cron Jobs (Requires CRON_SECRET)
- ✅ **Publish Scheduled Posts** - Publish social posts scheduled for now
- ✅ **Sync Comments from Platforms** - Fetch comments from all platforms
- ✅ **Send Recovery Emails** - Send abandoned cart recovery emails

## Running Tests via CLI

**Run all tests:**
```bash
bru run bruno-collection/ --env local
```

**Run specific folder:**
```bash
bru run bruno-collection/marketing --env local
bru run bruno-collection/cron --env local
```

**Save results to file:**
```bash
bru run bruno-collection/ --env local --output results.json
```

**Run with environment variables:**
```bash
bru run bruno-collection/ --env local \
  --env-var "cronSecret=your-secret" \
  --env-var "appId=your-app-id"
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: API Tests

on: [push, pull_request]

jobs:
  test-api:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Install Bruno CLI
        run: npm install -g @usebruno/cli

      - name: Run API tests
        run: |
          bru run bruno-collection/ --env local \
            --env-var "baseUrl=${{ secrets.API_BASE_URL }}" \
            --env-var "cronSecret=${{ secrets.CRON_SECRET }}" \
            --env-var "appId=${{ secrets.TEST_APP_ID }}"

      - name: Upload results
        uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: results.json
```

## Assertions & Tests

Each request includes:

**Assertions** (built-in):
- Response status code
- Response body structure
- Key field validation

**Tests** (JavaScript):
- Custom logic validation
- Response time checks
- Data format verification

Example:
```javascript
test("should return success message", function() {
  expect(res.body.success).to.eq(true);
  expect(res.body.message).to.be.a('string');
  expect(res.responseTime).to.be.below(1000);
});
```

## Tips

1. **Before Testing:**
   - Start the dev server: `npm run dev`
   - Update environment variables
   - Ensure database has test data

2. **Authentication:**
   - Public endpoints: No auth needed
   - Cron endpoints: Set `cronSecret` variable

3. **Getting Tokens:**
   - `confirmationToken`: Check email after waitlist submission
   - `referralCode`: Create referral program in app first
   - `appId`: Query database or create marketing app

4. **Troubleshooting:**
   - 404 error → Check `baseUrl` is correct
   - 401/403 error → Check `cronSecret` is set
   - 400 error → Check request body format
   - Connection refused → Ensure server is running

## Advantages Over Postman

- ✅ **Version Control** - Collection files are plain text, easy to diff
- ✅ **Collaboration** - Share via Git, no account needed
- ✅ **Offline First** - No cloud sync required
- ✅ **Open Source** - Free and community-driven
- ✅ **Git Workflow** - Review API changes in PRs
- ✅ **No Vendor Lock-in** - Own your collection files

## Documentation Links

- Bruno Official Site: https://www.usebruno.com/
- Bruno CLI Docs: https://docs.usebruno.com/cli/overview
- GitHub: https://github.com/usebruno/bruno

## Support

For issues with this collection, see:
- Main documentation: `ENDPOINT_TESTING.md`
- cURL alternative: `curl-commands.sh`
- Postman alternative: `postman-collection.json`

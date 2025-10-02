## ESP Integration API (Mailchimp & GetResponse)

Node.js + TypeScript REST API to store/validate ESP API keys and fetch lists from Mailchimp and GetResponse. Uses MongoDB for storage, with security middlewares, rate limiting, logging, and pagination.

### Features
- Store and validate API credentials (Mailchimp, GetResponse)
- Fetch all lists/audiences from connected provider
- Error handling for invalid credentials, network errors, rate limits
- Helmet, CORS, rate limiting, request logging
- AES-256-GCM encryption for stored API keys
- Basic pagination via `page` and `limit` query params

### Tech Stack
- Express, TypeScript
- Mongoose (MongoDB)
- Axios
- Helmet, CORS, express-rate-limit, morgan
- Zod for validation

### Endpoints
- `POST /api/integrations/esp`
  - Body: `{ provider: "mailchimp" | "getresponse", apiKey: string, label?: string }`
  - Action: Verifies API key with provider, then stores encrypted key in DB
  - Returns: `{ id, provider, label }`

- `GET /api/integrations/esp/lists?provider=mailchimp|getresponse&page=1&limit=25`
  - Returns: `{ data, page, limit, total, totalPages }`

### Environment Variables
Create a `.env` file in project root:

```
PORT=4000
MONGODB_URI=mongodb://localhost:27017/esp_integration_api
ENCRYPTION_KEY=please_set_a_very_long_random_secret_at_least_32_chars
```

Notes:
- `ENCRYPTION_KEY` must be at least 32 characters. Use a random string.

### Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Run in dev:
   ```bash
   npm run dev
   ```
3. Build and start:
   ```bash
   npm run build && npm start
   ```

### Mailchimp Notes
- API key format: `xxxxxxxxxxxxxxxxxx-usX`. The part after `-` is the data center.
- Lists endpoint: `/3.0/lists`

### GetResponse Notes
- API v3 with header: `X-Auth-Token: api-key <API_KEY>`
- Campaigns endpoint: `/v3/campaigns`

### Database Schema
Collection: `integrations`

```json
{
  "_id": "ObjectId",
  "provider": "mailchimp" | "getresponse",
  "apiKey": "<encrypted>",
  "label": "Optional string",
  "createdAt": "ISO date",
  "updatedAt": "ISO date"
}
```

### Run Examples

Save credentials (Mailchimp):
```bash
curl -X POST http://localhost:4000/api/integrations/esp \
  -H "Content-Type: application/json" \
  -d '{"provider":"mailchimp","apiKey":"YOUR_KEY-usX","label":"My Mailchimp"}'
```

Fetch lists:
```bash
curl "http://localhost:4000/api/integrations/esp/lists?provider=mailchimp&page=1&limit=25"
```

### Logging & Rate Limits
- Request logs via `morgan` (dev format)
- Rate limit applied to all `/api` routes: 100 requests / 15 minutes per IP

### Notes
- This project stores API keys encrypted at rest using AES-256-GCM. Ensure `ENCRYPTION_KEY` is securely set.


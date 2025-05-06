# API Endpoints

This directory contains all the API endpoints for the Free Cabins application.

## Structure

- `/api/routes/cabins`: Endpoints for managing cabins (GET, POST, PUT, DELETE)
  - `/api/routes/cabins/route.ts`: Handles GET (all cabins) and POST (new cabin)
  - `/api/routes/cabins/[id]/route.ts`: Handles GET, PUT, DELETE for specific cabins

- `/api/routes/import`: Endpoints for importing cabin data from external sources
  - `/api/routes/import/cai/route.ts`: Imports cabins from the Italian Alpine Club (CAI) API

- `/api/auth`: Authentication endpoints
  - `/api/auth/login/route.ts`: Handles user login

## Security

All write operations (POST, PUT, DELETE) are protected by authentication middleware.
\`\`\`

### 7. Middleware Explanation

Let's update the middleware file with better comments:

# MercurJS Integration Guide

This document explains the integration of the food exchange application with MercurJS as the backend.

## Overview

The application has been integrated with MercurJS, an open-source marketplace platform built on top of MedusaJS. MercurJS now serves as the backend API while the React application serves as the frontend.

## Architecture

### API Service Layer

**File**: `client/services/mercurjsApi.ts`

This layer provides:

- Medusa SDK initialization
- Authentication helpers (token management)
- API functions for:
  - User authentication
  - Product/Listings management
  - Collections (categories)
  - Orders
  - Customers

### Controllers

The application controllers have been updated to use MercurJS APIs instead of mock data:

1. **authController.ts** - Authentication
   - `login(email, password)` - Uses MercurJS user authentication
   - `logout()` - Clears authentication
   - `updateProfileName(name)` - Updates user profile (TODO: needs MercurJS implementation)
   - `changePassword(current, next)` - Change password (TODO: needs MercurJS endpoint)

2. **listingsController.ts** - Product Listings
   - `getAllListings()` - Fetches products from MercurJS
   - `getListingById(id)` - Gets product details
   - `createListing()` - Creates new product
   - `updateListing()` - Updates product
   - Category management via collections

3. **chatController.ts** - Chat & Transactions
   - Uses in-memory cache for messages
   - Integrates with MercurJS orders for chat context
   - Transaction proposals stored in cache
   - (TODO: Integrate with real messaging service)

## Configuration

### Backend Proxy

The application uses a Node.js Express proxy (`server/routes/mercurjs-proxy.ts`) to forward requests to the MercurJS backend. This solves CORS issues and keeps API credentials server-side.

### Environment Variables

Set in `.env.local`:

```env
# Frontend uses the proxy endpoint
VITE_BACKEND_URL=/api/mercurjs

# Server uses the actual backend
MERCURJS_BACKEND_URL=https://medusa.zh.unitymsp.it
```

For local development with local backend:

```env
VITE_BACKEND_URL=/api/mercurjs
MERCURJS_BACKEND_URL=http://localhost:9000
```

For production, update the `MERCURJS_BACKEND_URL` to your production backend URL:

```env
MERCURJS_BACKEND_URL=https://your-production-backend.com
```

### Authentication Flow

1. User enters email and password on login page
2. Credentials sent to MercurJS `/auth/login` endpoint
3. MercurJS returns authentication token
4. Token stored in localStorage (`mercurjs:auth-token`)
5. Token used in subsequent API requests
6. User data retrieved from MercurJS admin API

## API Mapping

### Products (Listings)

MercurJS Products map to application Listings:

```javascript
Listing {
  id: product.id
  productName: product.title
  description: product.description
  price: product.variants[0].prices[0].amount / 100
  currency: product.variants[0].prices[0].currency_code
  // Additional fields stored in product.metadata:
  type: 'sale' | 'purchase'
  unit: 'kg' | 'ton', etc.
  quantity: amount
  city: seller's city
  location: street address
}
```

### Orders (Transactions)

MercurJS Orders map to chat conversations and transaction proposals.

### Collections (Categories)

MercurJS Collections map to ProductCategories.

## Implementation Notes

### Chat System

The chat system currently uses an in-memory cache with MercurJS orders integration. For a production system, consider:

- Integrating with a dedicated messaging service (e.g., Firebase, Twilio)
- Implementing WebSocket support for real-time messages
- Storing messages in a separate database

### Metadata Fields

MercurJS products use the `metadata` field to store application-specific data:

- `type`: 'sale' or 'purchase'
- `unit`: measurement unit (kg, ton, etc.)
- `quantity`: amount available
- `city`: seller's city
- `location`: street address
- `company_name`: seller company
- `created_by`: user ID

## Testing

### Manual Testing Checklist

1. Verify backend connectivity at `http://localhost:9000/health`
2. Test login with valid MercurJS user credentials
3. Test product listing retrieval
4. Test product creation
5. Test chat initiation between users
6. Test offer creation and management

### Environment Setup

```bash
# Install dependencies
npm install

# Set backend URL in .env.local
echo "VITE_BACKEND_URL=http://localhost:9000" > .env.local

# Start development server
npm run dev

# Access at http://localhost:5173
```

## Next Steps

### High Priority

1. ✅ Authentication integration
2. ✅ Product/Listings integration
3. ✅ Collections/Categories integration
4. ⏳ Chat messaging system (currently using in-memory cache)
5. ⏳ Profile update endpoints
6. ⏳ Password change endpoint

### Medium Priority

1. Vendor-specific product listing
2. Order status tracking
3. Payment integration
4. Review/rating system
5. Notification system

### Low Priority

1. Advanced search filters
2. Bulk product operations
3. Analytics and reporting
4. Email notifications

## Troubleshooting

### Authentication Issues

**Problem**: Login fails with "Authentication failed"
**Solution**:

- Verify MercurJS backend is running at VITE_BACKEND_URL
- Check credentials against MercurJS user database
- Verify `@medusajs/js-sdk` is properly installed

### API Errors

**Problem**: 404 errors for products/listings
**Solution**:

- Ensure products exist in MercurJS database
- Check product metadata is properly formatted
- Verify vendor_id is correctly set

### CORS Issues

**Problem**: Cross-origin requests blocked
**Solution**:

- Configure CORS in MercurJS backend
- Ensure VITE_BACKEND_URL matches actual backend URL
- Check browser console for specific error messages

## API Documentation References

- MercurJS Docs: https://docs.mercurjs.com
- Medusa SDK: https://docs.medusajs.com/js-sdk
- Store API: https://docs.mercurjs.com/api-reference/store
- Admin API: https://docs.mercurjs.com/api-reference/admin

## Environment Variables

| Variable         | Default               | Description                          |
| ---------------- | --------------------- | ------------------------------------ |
| VITE_BACKEND_URL | http://localhost:9000 | MercurJS backend URL                 |
| VITE_ENV         | development           | Environment (development/production) |

## Notes

- The application uses Medusa SDK for type-safe API calls
- Authentication uses session-based tokens
- Product metadata enables flexible data storage
- Chat system can be upgraded to real-time with WebSockets
- All API calls are wrapped in error handling

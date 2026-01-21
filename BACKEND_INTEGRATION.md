# FastAPI Backend Integration Guide

## Overview
This frontend is now fully integrated with your FastAPI backend. All authentication and data operations communicate with the backend API.

## Setup Instructions

### 1. Environment Configuration
Create `.env.local` file in the project root:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

For production:
```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api
```

### 2. Backend Requirements
Your FastAPI backend must be running on `http://localhost:8000` (or the URL specified in `.env.local`)

Required endpoints (already implemented in your backend):
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login (returns JWT token)
- `GET /api/auth/me` - Get current user (requires Bearer token)
- `GET /api/items` - List items with pagination/search
- `POST /api/items` - Create item
- `PATCH /api/items/{id}` - Update item
- `DELETE /api/items/{id}` - Delete item

### 3. CORS Configuration
Ensure your FastAPI backend allows requests from the frontend:

```python
# In your FastAPI main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Add production URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## How It Works

### Authentication Flow

1. **Signup** (`/signup` page):
   - User enters email, password, name
   - Frontend calls `POST /api/auth/signup`
   - Backend returns user object
   - Frontend automatically logs in user
   - JWT token stored in `localStorage`
   - User redirected to `/app`

2. **Login** (`/login` page):
   - User enters email, password
   - Frontend calls `POST /api/auth/login`
   - Backend returns `{ access_token, token_type, user }`
   - Token stored in `localStorage` as `access_token`
   - User redirected to `/app`

3. **Protected Routes**:
   - All API requests include `Authorization: Bearer <token>` header
   - If token is invalid/expired (401 response), user redirected to `/login`
   - Token automatically removed from localStorage

### Data Flow

1. **Items List** (`/app` page):
   - `useItems` hook calls `GET /api/items?page=1&pageSize=10&search=query`
   - Backend returns paginated items for authenticated user
   - Items displayed in UI with real-time updates

2. **Create Item**:
   - User types/speaks item name and location
   - Frontend calls `POST /api/items` with Bearer token
   - Backend creates item linked to user_id
   - UI updates optimistically (shows item immediately)
   - Syncs with backend response

3. **Delete Item**:
   - User clicks delete button
   - Frontend calls `DELETE /api/items/{id}` with Bearer token
   - Backend deletes item (only if owned by user)
   - UI updates immediately

### Token Management

- **Storage**: `localStorage.getItem('access_token')`
- **Expiry**: 7 days (10,080 minutes) - configured in backend
- **Auto-logout**: On 401 response, token removed and user redirected to login
- **Security**: Token sent in Authorization header, not in URL

## Files Modified

### Core Integration Files
- `lib/api-client.ts` - API client with token management
- `lib/types.ts` - TypeScript interfaces matching backend
- `hooks/use-auth.ts` - Authentication state management
- `components/login-form.tsx` - Login form with backend integration
- `components/signup-form.tsx` - Signup form with backend integration

### Updated Pages
- `app/login/page.tsx` - Uses LoginForm component
- `app/signup/page.tsx` - Uses SignupForm component

## Testing the Integration

### 1. Start Backend
```bash
cd mindo-backend
uvicorn app.main:app --reload --port 8000
```

### 2. Start Frontend
```bash
cd mindo-4g
npm run dev
```

### 3. Test Flow
1. Go to `http://localhost:3000/signup`
2. Create account (email: test@example.com, password: Test1234)
3. Should auto-login and redirect to `/app`
4. Add items using voice or typing
5. Items saved to backend database
6. Refresh page - items persist
7. Logout and login again - items still there

## API Response Formats

### Login Response
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe",
    "created_at": "2026-01-21T16:30:00.123456"
  }
}
```

### Items List Response
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Keys",
      "location": "Kitchen drawer",
      "user_id": "uuid",
      "created_at": "2026-01-21T16:30:00",
      "updated_at": "2026-01-21T16:30:00"
    }
  ],
  "pagination": {
    "page": 1,
    "page_size": 10,
    "total_items": 25,
    "total_pages": 3,
    "has_next_page": true,
    "has_previous_page": false
  }
}
```

### Error Response
```json
{
  "detail": "Invalid email or password"
}
```

## Offline Support

The app includes localStorage fallback:
- Items cached locally for offline viewing
- When online, syncs with backend
- Optimistic updates for better UX

## Security Features

✅ JWT Bearer token authentication
✅ Automatic token expiry handling
✅ HTTPS required in production
✅ Password hashing on backend (bcrypt)
✅ Row-level security (users only see their items)
✅ Input validation on both frontend and backend
✅ CORS protection

## Production Deployment

### Frontend (Vercel/Netlify)
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

### Backend (Railway/Render/AWS)
- Deploy FastAPI backend
- Set DATABASE_URL to production PostgreSQL
- Update CORS_ORIGINS to include frontend URL
- Enable HTTPS

## Troubleshooting

### "Network error" on login
- Check backend is running on correct port
- Verify CORS is configured
- Check browser console for errors

### "Unauthorized" errors
- Token may be expired (7 days)
- Clear localStorage and login again
- Check backend SECRET_KEY hasn't changed

### Items not persisting
- Verify backend database is connected
- Check backend logs for errors
- Ensure user_id is being set correctly

## Next Steps

Optional enhancements:
- Add OAuth (Google/GitHub) integration
- Implement password reset flow
- Add email verification
- Enable WebSocket for real-time sync
- Add voice transcription API
- Implement offline queue for failed requests

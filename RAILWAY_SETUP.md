# Connecting Frontend to Railway Backend

## Quick Setup

If your backend is deployed on Railway, you need to point the frontend to use the Railway URL instead of localhost.

### Option 1: Create .env file (Recommended)

1. Create a `.env` file in the frontend directory:
   ```bash
   cd local-services-booking-frontend
   touch .env
   ```

2. Add your Railway URL to the `.env` file:
   ```
   VITE_API_URL=https://your-app-name.up.railway.app/api
   ```
   
   **Replace `your-app-name.up.railway.app` with your actual Railway public domain URL**

3. Restart the frontend dev server:
   ```bash
   # Stop the current server (Ctrl+C)
   npm run dev
   ```

### Option 2: Direct edit (Temporary)

If you want to quickly test, you can directly edit `src/utils/auth.js`:

Change:
```javascript
const API_URL = import.meta.env.VITE_API_URL || '/api'
```

To:
```javascript
const API_URL = 'https://your-app-name.up.railway.app/api'
```

(Replace with your Railway URL)

---

## Finding Your Railway URL

1. Go to your Railway dashboard
2. Click on your project
3. Click on your backend service
4. Look for "Public Domain" or "Deployments" section
5. Copy the URL (should look like: `https://your-app-name.up.railway.app`)

**Important:** Make sure to add `/api` at the end!

Example:
- Railway URL: `https://local-services-booking.up.railway.app`
- API URL: `https://local-services-booking.up.railway.app/api`

---

## Testing

1. Make sure your Railway backend is running
2. Start your frontend: `npm run dev`
3. Open http://localhost:3001
4. Try logging in or registering
5. Check browser console (F12) if you see any errors

---

## Switching Back to Local

To use localhost again, either:
1. Remove the `.env` file, OR
2. Change `.env` to: `VITE_API_URL=/api`
3. Restart the dev server

---

## Note

- The frontend still runs locally on `http://localhost:3001`
- Only the API calls will go to Railway
- Make sure Railway backend has CORS enabled (should already be configured)




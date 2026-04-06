# 🧪 Clerk OAuth Testing Guide

## Quick Start Testing

### Prerequisites ✅
- Backend server running
- Expo app running  
- Clerk project configured with Google OAuth enabled

---

## 🚀 Test Steps

### 1. Start Backend Server
```bash
cd Backend
npm start
```

**Expected Output:**
```
Server running on port 5000
✅ MongoDB Connected
```

---

### 2. Start Expo App
```bash
cd Remit-Frontend
npx expo start
```

**Options:**
- Press `i` for iOS simulator
- Press `a` for Android emulator  
- Scan QR code for physical device

---

### 3. Test Login Screen

**Steps:**
1. Navigate to Login Screen
2. Click the **Google** icon button (circular button with Google logo)
3. Google OAuth popup should appear
4. Select your Google account
5. Approve permissions
6. You should be redirected back to the app

**Expected Behavior:**
- Loading indicator shows on Google button
- OAuth popup opens
- After successful login:
  - If KYC verified → Navigate to `/screens/ThumbEnableScreen`
  - If KYC not verified → Navigate to `/screens/KYCScreen`

**Console Logs (Frontend):**
```
🚀 Starting Clerk Google OAuth flow...
✅ Clerk OAuth successful, session created
👤 User data retrieved from Clerk
📤 Sending to backend: {...}
📥 Backend response: {...}
✅ Backend authentication successful
```

**Console Logs (Backend):**
```
🔐 Clerk OAuth - Request received
Request body: { email: '...', name: '...', ... }
📧 Looking for user with email: user@example.com
📝 Creating new user from Clerk OAuth  (OR ✅ Existing user found)
✅ Clerk OAuth successful
```

---

### 4. Test Signup Screen

**Steps:**
1. Navigate to Signup Screen
2. Click the **Google** icon button
3. Same flow as Login Screen

**Expected Behavior:**
- Same as login screen
- New users are automatically created
- Existing users are logged in

---

## 🔍 Troubleshooting

### Issue: "OAuth flow cancelled or failed"

**Possible Causes:**
1. User cancelled the Google sign-in popup
2. Network error
3. Clerk configuration issue

**Solution:**
- Check Clerk dashboard for Google OAuth settings
- Ensure you enabled Google in Social Connections
- Check internet connection

---

### Issue: "Authentication failed"

**Possible Causes:**
1. Backend not running
2. MongoDB not connected
3. Missing environment variables

**Solution:**
- Check backend console logs
- Verify MongoDB connection
- Check `.env` file has `JWT_SECRET`

---

### Issue: "Failed to retrieve user data"

**Possible Causes:**
1. Clerk session not properly set
2. User hook not updated

**Solution:**
- The 1-second delay should fix this
- If issue persists, try increasing the delay
- Check Clerk user object in console

---

### Issue: Backend error 503

**Cause:** Database not connected

**Solution:**
```bash
# Check MongoDB connection string in Backend/.env
MONGODB_URI=mongodb+srv://...
```

---

## 📱 Testing Checklist

### Login Screen
- [ ] Google button visible
- [ ] Clicking shows loading state
- [ ] OAuth popup opens
- [ ] Successful authentication
- [ ] User data saved
- [ ] Correct navigation (KYC or ThumbEnable)
- [ ] Error handling works

### Signup Screen  
- [ ] Google button visible
- [ ] Clicking shows loading state
- [ ] OAuth popup opens
- [ ] New user created
- [ ] User data saved
- [ ] Navigation to KYC screen
- [ ] Error handling works

### Backend
- [ ] `/auth/clerk-oauth` endpoint works
- [ ] User created in database
- [ ] JWT token generated
- [ ] User fields populated correctly:
  - [ ] email
  - [ ] name
  - [ ] clerkUserId
  - [ ] imageUrl
  - [ ] provider = 'clerk-google'

---

## 🐛 Debug Commands

### Check Backend API
```bash
# Test endpoint directly (replace with your backend URL)
curl -X POST http://localhost:5000/api/auth/clerk-oauth \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "clerkUserId": "user_test123",
    "provider": "clerk-google"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "...",
    "email": "test@example.com",
    "name": "Test User",
    "kycStatus": "unverified"
  }
}
```

---

### Check MongoDB User
```javascript
// In MongoDB Compass or mongosh
db.users.findOne({ email: "test@example.com" })
```

**Expected Document:**
```javascript
{
  _id: ObjectId("..."),
  email: "test@example.com",
  name: "Test User",
  clerkUserId: "user_xxxxx",
  imageUrl: "https://...",
  provider: "clerk-google",
  isEmailVerified: true,
  kycStatus: "unverified",
  isKYCVerified: false,
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```

---

## 🎯 Success Criteria

✅ **Login Screen:**
- Google OAuth completes successfully
- User authenticated with backend
- Correct navigation based on KYC status
- No errors in console

✅ **Signup Screen:**
- Google OAuth completes successfully  
- New user created in database
- Navigation to KYC screen
- No errors in console

✅ **Backend:**
- User saved in MongoDB
- JWT token generated
- All user fields populated
- Logs show successful authentication

✅ **Overall:**
- No error messages shown to user
- Smooth user experience
- Fast authentication (< 5 seconds)

---

## 📞 Support

If you encounter issues:

1. Check console logs (frontend and backend)
2. Verify Clerk configuration in dashboard
3. Check MongoDB connection
4. Review implementation guide: `CLERK_OAUTH_IMPLEMENTATION.md`

---

**Happy Testing! 🎉**

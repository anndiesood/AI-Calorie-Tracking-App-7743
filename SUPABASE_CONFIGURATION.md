# Supabase URL Configuration Fix

## Issue
Email confirmation links are redirecting to `localhost:3000` instead of `mindmymeals.com` in production.

## Root Cause
Supabase uses the "Site URL" and "Redirect URLs" configured in your project settings to generate confirmation links.

## Solution Steps

### 1. Update Supabase Dashboard Settings

Go to your Supabase Dashboard:
1. Navigate to `Authentication` > `URL Configuration`
2. Update the following settings:

**Site URL:**
```
https://mindmymeals.com
```

**Additional Redirect URLs:**
```
https://mindmymeals.com
https://mindmymeals.com/login
https://mindmymeals.com/signup
https://mindmymeals.com/auth/callback
http://localhost:3000 (for development only)
http://localhost:3000/login
http://localhost:3000/signup
```

### 2. Environment-Based Configuration

Update your signup code to specify the redirect URL based on environment:

```javascript
// In AuthContext.jsx - signup function
const getRedirectURL = () => {
  if (process.env.NODE_ENV === 'production') {
    return 'https://mindmymeals.com';
  }
  return 'http://localhost:3000';
};

const { data, error } = await supabase.auth.signUp({
  email: userData.email.trim(),
  password: userData.password,
  options: {
    data: dbUserData,
    emailRedirectTo: getRedirectURL()
  }
});
```

### 3. Update Email Template (Optional)

In Supabase Dashboard > Authentication > Email Templates:

**Confirm signup template:**
```html
<h2>Welcome to MealTracker!</h2>
<p>Thanks for signing up! Follow this link to confirm your email:</p>
<p><a href="{{ .ConfirmationURL }}" style="background-color: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Confirm Email Address</a></p>
<p>If the button doesn't work, copy and paste this link into your browser:</p>
<p>{{ .ConfirmationURL }}</p>
<p>This link will expire in 24 hours.</p>
<p>If you didn't create an account, you can safely ignore this email.</p>
```

### 4. Handle Auth Callback

Create an auth callback handler to process email confirmations:
# Security Guide for MealTracker

## Current Database Setup

### ⚠️ **Important: Current Implementation is for Development Only**

The current MealTracker app uses **localStorage** for data persistence, which is:
- **Client-side only** - All data is stored in the user's browser
- **Not secure** - Data is not encrypted and can be easily accessed
- **Not scalable** - Limited storage capacity
- **Not production-ready** - No server-side validation or security

## Production Security Recommendations

### 1. **Backend Database Migration**

#### Recommended Stack:
- **Supabase** (PostgreSQL with built-in auth)
- **Firebase** (NoSQL with Google Auth)
- **MongoDB Atlas** (Cloud MongoDB)
- **PostgreSQL** with Express.js backend

#### Migration Steps:
```javascript
// Example Supabase integration
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
)

// Replace localStorage with Supabase
const saveUserData = async (userData) => {
  const { data, error } = await supabase
    .from('users')
    .insert([userData])
  
  if (error) throw error
  return data
}
```

### 2. **Authentication Security**

#### Current Issues:
- Passwords stored in plain text
- No session management
- No JWT tokens
- No password hashing

#### Recommended Solutions:
```javascript
// Use proper authentication service
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Hash passwords
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 12)
}

// Verify passwords
const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword)
}

// Generate JWT tokens
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' })
}
```

### 3. **Data Protection**

#### Implement:
- **Input Validation** - Sanitize all user inputs
- **SQL Injection Prevention** - Use parameterized queries
- **XSS Protection** - Escape HTML content
- **CSRF Protection** - Use CSRF tokens
- **Rate Limiting** - Prevent brute force attacks

```javascript
// Input validation example
import joi from 'joi'

const userSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().min(8).required(),
  name: joi.string().min(2).max(50).required()
})

const validateUser = (userData) => {
  const { error } = userSchema.validate(userData)
  if (error) throw new Error(error.details[0].message)
}
```

### 4. **Environment Variables**

Create `.env` file:
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/mealtracker
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# Authentication
JWT_SECRET=your-super-secret-jwt-key
SESSION_SECRET=your-session-secret

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

### 5. **Role-Based Access Control (RBAC)**

#### Current Implementation:
✅ Basic role system (admin, moderator, user)
✅ Permission-based access control
✅ Route protection

#### Enhancements Needed:
```javascript
// Database-level row security
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Admins can see all data
CREATE POLICY "Admins can view all data" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );
```

### 6. **API Security**

#### Implement:
- **HTTPS Only** - Force SSL/TLS
- **API Rate Limiting** - Prevent abuse
- **Request Validation** - Validate all inputs
- **Error Handling** - Don't expose sensitive info

```javascript
// Express.js security middleware
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import cors from 'cors'

app.use(helmet()) // Security headers
app.use(cors({ origin: process.env.FRONTEND_URL })) // CORS

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
})
app.use('/api/', limiter)
```

### 7. **Deployment Security**

#### Netlify Security Headers:
Create `_headers` file:
```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'
```

#### Environment Variables on Netlify:
1. Go to Site Settings → Environment Variables
2. Add production environment variables
3. Never commit secrets to Git

### 8. **Monitoring & Logging**

#### Implement:
- **Error Tracking** (Sentry)
- **Performance Monitoring** (New Relic)
- **Security Monitoring** (Audit logs)
- **Backup Strategy** (Automated backups)

```javascript
// Error tracking
import * as Sentry from "@sentry/react"

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  environment: process.env.NODE_ENV
})
```

## Security Checklist

### ✅ **Immediate Actions:**
- [ ] Move to production database (Supabase recommended)
- [ ] Implement proper authentication
- [ ] Add input validation
- [ ] Set up environment variables
- [ ] Enable HTTPS

### ✅ **Short Term:**
- [ ] Add rate limiting
- [ ] Implement audit logging
- [ ] Set up monitoring
- [ ] Add backup strategy
- [ ] Security testing

### ✅ **Long Term:**
- [ ] Penetration testing
- [ ] Security code review
- [ ] Compliance audit (if needed)
- [ ] Regular security updates

## Current Demo Security

The current app includes:
- ✅ Role-based access control
- ✅ Permission checks
- ✅ Route protection
- ✅ Fixed logout functionality
- ✅ User status management

But lacks:
- ❌ Server-side validation
- ❌ Encrypted data storage
- ❌ Secure authentication
- ❌ API security
- ❌ Production-ready database

## Next Steps

1. **Choose a backend service** (Supabase recommended)
2. **Migrate authentication** to proper service
3. **Implement security headers**
4. **Add monitoring**
5. **Test security measures**

The current implementation is perfect for development and demonstration, but requires these security enhancements for production use.
# MealTracker - Complete Supabase Integration

A comprehensive meal tracking application with Supabase backend integration and localStorage fallback.

## 🚀 Features

### Authentication & User Management
- **Supabase Authentication** with email/password
- **Role-based Access Control** (Admin, Moderator, User)
- **User Profile Management** with complete health metrics
- **Admin Panel** for user management
- **Automatic fallback** to localStorage when Supabase is unavailable

### Meal Tracking
- **AI-powered meal analysis** (simulated)
- **Photo upload** and meal descriptions
- **Comprehensive nutrition tracking** (calories, protein, carbs, fat)
- **Meal history** with search and filtering
- **Analytics dashboard** with charts and progress tracking

### Security & Performance
- **Row Level Security** (RLS) policies
- **Data encryption** and secure storage
- **Real-time sync** between devices
- **Offline capability** with localStorage fallback

## 🔧 Setup Instructions

### 1. Supabase Configuration

#### Create a Supabase Project:
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Copy your project URL and anon key

#### Update Configuration:
Replace the placeholder values in `src/lib/supabase.js`:

```javascript
const SUPABASE_URL = 'https://your-project-id.supabase.co'
const SUPABASE_ANON_KEY = 'your-anon-key-here'
```

#### Run Database Migration:
Execute the SQL in `supabase/migrations/001_initial_schema.sql` in your Supabase SQL editor.

### 2. Environment Variables (Optional)

Create a `.env` file for additional security:

```bash
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Authentication Setup

The app automatically handles:
- ✅ User registration with Supabase Auth
- ✅ Profile creation with trigger functions
- ✅ Session management
- ✅ Role-based permissions

## 📊 Database Schema

### Users Table
```sql
- id (UUID, Primary Key)
- email (Text, Unique)
- name (Text)
- age (Integer)
- weight (Decimal)
- height (Decimal)
- activity_level (Text)
- goal (Text)
- target_weight (Decimal)
- target_date (Date)
- daily_goal (Integer)
- role (Text: admin/moderator/user)
- status (Text: active/inactive)
- profile_photo (Text)
- created_at (Timestamp)
- last_login (Timestamp)
```

### Meals Table
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key)
- name (Text)
- description (Text)
- image (Text)
- calories (Integer)
- protein (Decimal)
- carbs (Decimal)
- fat (Decimal)
- meal_type (Text)
- timestamp (Timestamp)
- created_at (Timestamp)
```

## 🔐 Security Features

### Row Level Security (RLS)
- **Users**: Can only access their own data
- **Admins**: Can access all user data
- **Meals**: Users can only access their own meals

### Authentication Policies
- ✅ Email/password authentication
- ✅ Session management
- ✅ Automatic token refresh
- ✅ Secure logout

### Data Protection
- ✅ Input validation
- ✅ SQL injection prevention
- ✅ XSS protection
- ✅ Role-based access control

## 🎯 User Roles & Permissions

### Admin
- ✅ Manage all users
- ✅ View all analytics
- ✅ System settings
- ✅ User role management

### Moderator
- ✅ Content management
- ✅ View analytics
- ❌ User management

### User
- ✅ Personal meal tracking
- ✅ Profile management
- ❌ Admin features

## 📱 Demo Accounts

### For localStorage fallback:
- **Admin**: admin@mealtracker.com / admin123
- **Moderator**: mod@mealtracker.com / mod123
- **User**: demo@mealtracker.com / demo123

### For Supabase (create your own):
Use the signup form to create accounts that will be stored in Supabase.

## 🔄 Fallback System

The app intelligently switches between:

### Supabase (Primary)
- Real-time sync
- Secure cloud storage
- Multi-device access
- Advanced analytics

### localStorage (Fallback)
- Offline functionality
- No internet required
- Demo accounts available
- Local data storage

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Environment Variables for Production
Set these in your hosting platform:
- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_ANON_KEY`

## 📈 Performance Features

### Database Optimization
- ✅ Indexed queries
- ✅ Efficient data fetching
- ✅ Pagination support
- ✅ Real-time subscriptions

### UI/UX Optimization
- ✅ Loading states
- ✅ Error handling
- ✅ Responsive design
- ✅ Smooth animations

## 🔧 Development

### Tech Stack
- **Frontend**: React 18, Tailwind CSS, Framer Motion
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Charts**: ECharts
- **Icons**: React Icons
- **Routing**: React Router

### Key Features
- ✅ Real-time data sync
- ✅ Offline capability
- ✅ Mobile-responsive
- ✅ Role-based access
- ✅ Comprehensive analytics
- ✅ Secure authentication

## 📝 Migration from localStorage

The app automatically detects Supabase availability and migrates data when possible. Users can seamlessly switch between storage methods.

## 🤝 Support

For issues or questions:
1. Check Supabase connection status (top-right indicator)
2. Verify database schema is properly set up
3. Ensure environment variables are configured
4. Check browser console for detailed error messages

The app provides clear feedback about storage method and connection status throughout the interface.
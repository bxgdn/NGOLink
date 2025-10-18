# Setup Instructions

Follow these steps to get the NGO & Volunteer Matching Platform up and running.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Convex account (free at [convex.dev](https://convex.dev))

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Convex Backend

1. Install Convex CLI globally (if not already installed):
```bash
npm install -g convex
```

2. Initialize and deploy Convex:
```bash
npx convex dev
```

This will:
- Create a new Convex project (or link to existing)
- Deploy your backend functions
- Generate a deployment URL

3. The CLI will display your deployment URL. Copy it!

## Step 3: Configure Environment Variables

1. Create a `.env.local` file in the root directory:
```bash
cp .env.example .env.local
```

2. Edit `.env.local` and add your Convex deployment URL:
```
VITE_CONVEX_URL=https://your-project.convex.cloud
```

## Step 4: Initialize Default Data

Once Convex is running, you can initialize default achievements by opening your Convex dashboard and running:

```javascript
// In the Convex dashboard Functions tab, run:
await ctx.runMutation(api.achievements.initializeDefaultAchievements, {});
```

Or you can wait for the first user to sign up, which will trigger the initialization automatically.

## Step 5: Start the Development Server

In a new terminal (keep `npx convex dev` running in the first terminal):

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Step 6: Test the Application

### Create a Volunteer Account
1. Go to `http://localhost:3000`
2. Click "Sign Up"
3. Choose "Volunteer"
4. Complete the onboarding process

### Create an NGO Account
1. Open an incognito/private window
2. Go to `http://localhost:3000`
3. Click "Sign Up"
4. Choose "NGO / Organization"
5. Complete the organization setup

### Testing Features

**As a Volunteer:**
- Browse opportunities in the Swipe Deck
- Complete the profile with skills and interests
- Claim tasks from the Task Board
- View achievements and leaderboard

**As an NGO:**
- Create volunteer opportunities
- Review volunteer applications
- Create and assign tasks
- Review submitted work

## Default Test Accounts

Since this is a demo app with simplified authentication, you can create accounts with any email address. For testing, you might want to create:

- Volunteer: `volunteer@test.com`
- NGO: `ngo@test.com`

## Project Structure

```
├── convex/              # Backend (Convex)
│   ├── schema.ts        # Database schema
│   ├── users.ts         # User functions
│   ├── ngos.ts          # NGO functions
│   ├── opportunities.ts # Opportunities
│   ├── matches.ts       # Matching system
│   ├── tasks.ts         # Task management
│   ├── achievements.ts  # Gamification
│   ├── messages.ts      # Chat
│   └── notifications.ts # Notifications
│
├── src/
│   ├── components/      # Reusable components
│   ├── context/         # React context (Auth)
│   ├── pages/          # Page components
│   │   ├── volunteer/  # Volunteer pages
│   │   └── ngo/        # NGO pages
│   └── styles/         # CSS files
│
├── package.json
└── vite.config.js
```

## Key Features Implemented

✅ **User Management**
- Volunteer and NGO account types
- Profile creation and editing
- Skill and interest tracking

✅ **Matching System**
- Swipe-based opportunity discovery
- Super likes for priority applications
- Match acceptance/rejection by NGOs

✅ **Task Management**
- Create and assign tasks
- Task board for volunteers
- Submission and review workflow

✅ **Gamification**
- Achievements and badges
- Medal tiers (bronze, silver, gold)
- Leaderboards
- Progress tracking

✅ **Communication**
- In-app chat between matches
- Notifications system

✅ **NGO Features**
- Opportunity creation and management
- Applicant review dashboard
- Task management
- Analytics and stats

## Troubleshooting

### "Cannot find module 'convex/react'"
Run `npm install` to ensure all dependencies are installed.

### Convex deployment URL not working
Make sure `npx convex dev` is running and the URL in `.env.local` matches your deployment URL.

### Pages not loading
Clear your browser cache and restart the dev server.

### Database issues
You can clear your Convex database from the Convex dashboard under the "Data" tab.

## Production Deployment

### Deploy Convex Backend
```bash
npx convex deploy
```

### Deploy Frontend
The frontend can be deployed to:
- Vercel: `vercel deploy`
- Netlify: `netlify deploy`
- Any static hosting service

Make sure to set the `VITE_CONVEX_URL` environment variable in your hosting platform.

## Notes

- This is a demonstration app with simplified authentication
- In production, implement proper authentication (OAuth, JWT, etc.)
- Add proper NGO verification workflow
- Implement file upload for portfolios and attachments
- Add email notifications
- Implement proper user sessions and security

## Support

For issues or questions:
1. Check the Convex documentation: https://docs.convex.dev
2. Review the code comments
3. Check console logs for errors

Enjoy building your volunteer community! 🌱


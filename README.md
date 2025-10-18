# NGO & Volunteer Matching Platform

A comprehensive web application that connects volunteers with NGOs through skill-based matching, gamified tasks, and achievements.

## Features

- 🤝 **Smart Matching**: Swipe-based interface to match volunteers with opportunities
- 🎯 **Skill-Based Matching**: Match based on skills, interests, and availability
- 🏆 **Gamification**: Earn badges, medals, and climb leaderboards
- 📋 **Task Management**: Complete discrete tasks and track progress
- 💬 **Real-time Chat**: Communicate with matched organizations
- 📊 **Analytics**: Track volunteer hours and impact

## Tech Stack

- **Backend**: Convex
- **Frontend**: React.js with Vite
- **Routing**: React Router
- **Styling**: Custom CSS with green theme

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up Convex:
```bash
npx convex dev
```

3. Start the development server (in another terminal):
```bash
npm run dev
```

4. Open your browser to `http://localhost:3000`

## Project Structure

```
├── convex/              # Backend code
│   ├── schema.ts        # Database schemas
│   ├── users.ts         # User-related functions
│   ├── ngos.ts          # NGO-related functions
│   ├── opportunities.ts # Opportunity management
│   ├── matches.ts       # Matching logic
│   ├── tasks.ts         # Task management
│   └── achievements.ts  # Gamification
├── src/                 # Frontend code
│   ├── components/      # Reusable components
│   ├── pages/          # Page components
│   ├── styles/         # CSS files
│   └── main.jsx        # Entry point
```

## Color Scheme

- Dark Green: #19381F
- Yellow: #EEE82C
- Light Green: #91CB3E
- Medium Green: #53A548
- Forest Green: #4C934C


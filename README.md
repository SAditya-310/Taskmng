# TaskManager

TaskManager is a full-stack task management app with a React client, a Node.js/Express backend, and MongoDB for persistence.

## Features
- User signup and login
- Admin and member roles
- Task assignment and tracking
- Profile and dashboard views
- Member management for admins

## Project Structure

```text
TaskManager/
├── client-side/   # React app
└── server-side/   # Express API and MongoDB models
```

## Prerequisites
- Node.js 18+
- MongoDB connection string

## Setup

Install dependencies from the repository root:

```powershell
npm run install:all
```

Create a `.env` file inside `server-side` with your MongoDB connection string and JWT secret.

## Run the app

Start the backend:

```powershell
cd server-side
npm start
```

Start the frontend:

```powershell
cd client-side
npm start
```

## Notes
- The backend entry point is [server-side/server.js](server-side/server.js).
- The main React navigation is in [client-side/src/components/navbar.jsx](client-side/src/components/navbar.jsx).

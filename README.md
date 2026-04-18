SwapReads — Real Backend Book Exchange Platform

A full-stack book exchange web app where real users can list, search, and exchange books.


Project Structure

swapreads/
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── middleware/
│   │   └── auth.js            # JWT auth middleware
│   ├── models/
│   │   ├── User.js            # User schema
│   │   ├── Book.js            # Book schema
│   │   ├── Wishlist.js        # Books needed/wishlist
│   │   ├── Request.js         # Exchange requests
│   │   └── Notification.js    # Notifications
│   ├── routes/
│   │   ├── auth.js            # Signup, Login, Profile
│   │   ├── books.js           # CRUD + Search + Smart Match
│   │   ├── wishlist.js        # Wishlist management
│   │   ├── requests.js        # Exchange request workflow
│   │   ├── notifications.js   # Notification system
│   │   └── users.js           # People/community
│   ├── server.js              # Main Express + Socket.IO server
│   ├── package.json
│   └── .env.example           # Environment variables template
└── frontend/
    └── index.html             # Complete single-file frontend
```


Setup Instructions

1. Prerequisites
- Node.js v18+ — https://nodejs.org
- MongoDB — either:
  - Local: https://www.mongodb.com/try/download/community
  - Cloud: https://www.mongodb.com/atlas (free tier)

2. Backend Setup

cd swapreads/backend

Install dependencies
npm install

Create your .env file
cp .env.example .env


Edit .env and fill in:

env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://youruser:yourpass@cluster0.xxxxx.mongodb.net/swapreads
JWT_SECRET=make_this_a_long_random_string_minimum_32_chars
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
```

MongoDB Atlas (free cloud DB):
1. Go to https://cloud.mongodb.com → Create free cluster
2. Database Access → Add user with password
3. Network Access → Allow 0.0.0.0/0
4. Connect → Drivers → Copy connection string → paste in .env

3. Start the Backend

npm run dev
npm start

You should see:

✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
 SwapReads server running on port 5000


 Security Features
- Passwords hashed with **bcrypt** (12 rounds)
- **JWT** authentication (7-day expiry)
- **Rate limiting** (200 req/15 min)
- **Helmet.js** security headers
- Input validation with **express-validator**
- XSS protection via HTML escaping in frontend
- CORS configured to specific origin



Features
-  Real user auth (signup/login/JWT)
-  Add books you have (+5 points each)
-  Wishlist (books you need)
-  Smart match system (notifies when match found)
-  Full request workflow (send → accept/reject → complete)
-  Points system (10 on signup, +5 per book, +10 per exchange)
-  Star ratings after exchanges
-  Real-time notifications via Socket.IO
-  Live request stream feed
-  User profiles with rating averages
-  Search with category filters
-  Edit profile

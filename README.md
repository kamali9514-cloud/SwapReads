# 📚 SwapReads — Real Backend Book Exchange Platform

A full-stack book exchange web app where real users can list, search, and exchange books.

---

## 🗂 Project Structure

```
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

---

## ⚙️ Setup Instructions

### 1. Prerequisites
- **Node.js** v18+ — https://nodejs.org
- **MongoDB** — either:
  - Local: https://www.mongodb.com/try/download/community
  - Cloud (recommended): https://www.mongodb.com/atlas (free tier)

### 2. Backend Setup

```bash
cd swapreads/backend

# Install dependencies
npm install

# Create your .env file
cp .env.example .env
```

Edit `.env` and fill in:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://youruser:yourpass@cluster0.xxxxx.mongodb.net/swapreads
JWT_SECRET=make_this_a_long_random_string_minimum_32_chars
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
```

> **MongoDB Atlas (free cloud DB):**
> 1. Go to https://cloud.mongodb.com → Create free cluster
> 2. Database Access → Add user with password
> 3. Network Access → Allow 0.0.0.0/0
> 4. Connect → Drivers → Copy connection string → paste in .env

### 3. Start the Backend

```bash
# Development (auto-restart on changes)
npm run dev

# Production
npm start
```

You should see:
```
✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
🚀 SwapReads server running on port 5000
```

### 4. Frontend Setup

Open `frontend/index.html` in your code editor and verify this line at the top of the `<script>`:

```js
const API_BASE = 'http://localhost:5000/api';
```

Change it to your deployed backend URL when going live.

Then simply open `frontend/index.html` in a browser — or serve it:

```bash
# Quick static server (if you have Python)
cd frontend
python3 -m http.server 3000

# Or with Node
npx serve frontend
```

---

## 🚀 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/signup` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login |
| GET | `/api/auth/me` | ✅ | Get current user |
| PUT | `/api/auth/profile` | ✅ | Update profile |
| GET | `/api/books` | ❌ | List books (filter/search) |
| POST | `/api/books` | ✅ | Add a book (+5 pts) |
| GET | `/api/books/my-books` | ✅ | My books |
| GET | `/api/books/matches` | ✅ | Smart match |
| PUT | `/api/books/:id` | ✅ | Update book |
| DELETE | `/api/books/:id` | ✅ | Delete book |
| GET | `/api/wishlist` | ✅ | My wishlist |
| POST | `/api/wishlist` | ✅ | Add to wishlist |
| DELETE | `/api/wishlist/:id` | ✅ | Remove from wishlist |
| GET | `/api/requests` | ✅ | My requests |
| POST | `/api/requests` | ✅ | Send request |
| PUT | `/api/requests/:id/accept` | ✅ | Accept request |
| PUT | `/api/requests/:id/reject` | ✅ | Reject request |
| PUT | `/api/requests/:id/complete` | ✅ | Mark complete (+10 pts) |
| POST | `/api/requests/:id/rate` | ✅ | Rate exchange |
| GET | `/api/notifications` | ✅ | Get notifications |
| PUT | `/api/notifications/read-all` | ✅ | Mark all read |
| GET | `/api/users` | ✅ | People list |
| GET | `/api/users/:id` | ❌ | User public profile |

---

## 🌐 Deployment

### Backend → Render (free)
1. Push code to GitHub
2. Go to https://render.com → New Web Service
3. Connect your repo → set `Root Directory` to `backend`
4. Build command: `npm install`
5. Start command: `node server.js`
6. Add environment variables from `.env`

### Frontend → Netlify / Vercel (free)
1. Update `API_BASE` in `index.html` to your Render URL
2. Drag-drop the `frontend/` folder to https://netlify.com/drop

---

## 🔒 Security Features
- Passwords hashed with **bcrypt** (12 rounds)
- **JWT** authentication (7-day expiry)
- **Rate limiting** (200 req/15 min)
- **Helmet.js** security headers
- Input validation with **express-validator**
- XSS protection via HTML escaping in frontend
- CORS configured to specific origin

---

## ✨ Features
- ✅ Real user auth (signup/login/JWT)
- ✅ Add books you have (+5 points each)
- ✅ Wishlist (books you need)
- ✅ Smart match system (notifies when match found)
- ✅ Full request workflow (send → accept/reject → complete)
- ✅ Points system (10 on signup, +5 per book, +10 per exchange)
- ✅ Star ratings after exchanges
- ✅ Real-time notifications via Socket.IO
- ✅ Live request stream feed
- ✅ User profiles with rating averages
- ✅ Search with category filters
- ✅ Edit profile

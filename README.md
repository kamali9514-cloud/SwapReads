SwapReads — Book Exchange Platform

  A full-stack web application that enables users to list, discover, and exchange books with others. Built with a complete backend system, real-time features, and a responsive frontend.

Features
User authentication (JWT-based signup/login)
Add, edit, and manage books
Wishlist system for desired books
Smart book matching between users
Exchange request workflow (send → accept/reject → complete)
Points-based reward system
User ratings and profiles
Real-time notifications
Search and filter functionality


Tech Stack

Frontend:

HTML
CSS
JavaScript

Backend:

Node.js
Express.js

Database:

MongoDB (Atlas)

Other:

Socket.IO (real-time updates)
JWT (authentication)
bcrypt (password hashing)


Project Structure
swapreads/
├── backend/
├── frontend/


Setup Instructions
1. Clone the repository
git clone https://github.com/your-username/swapreads.git
cd swapreads
2. Backend Setup
cd backend
npm install

Create a .env file:

PORT=5000
MONGODB_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:3000

Start backend:

npm run dev
3. Frontend Setup

Open:

frontend/index.html

Or run:

npx serve frontend


Deployment
Frontend: Netlify
Backend: Render
Database: MongoDB Atlas

Update API URL in frontend:

const API_BASE = "https://your-backend-url.onrender.com/api";

Security
Password hashing with bcrypt
JWT authentication
Input validation
CORS protection

API Highlights
/api/auth → Authentication
/api/books → Book management
/api/requests → Exchange system
/api/wishlist → Wishlist
/api/notifications → Notifications

Author
KAMALI S


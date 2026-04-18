

📚 SwapReads — Book Exchange Platform
Full-stack web application for exchanging books between users
Built with backend, database, and responsive frontend
🚀 Features
JWT-based authentication (signup/login)
Add, edit, and manage books
Wishlist system
Smart book matching
Exchange workflow (request → accept/reject → complete)
Points-based system
User profiles and ratings
Real-time notifications (Socket.IO)
Search and filter
🛠 Tech Stack
Frontend: HTML, CSS, JavaScript
Backend: Node.js, Express.js
Database: MongoDB Atlas
Other: JWT, bcrypt, Socket.IO
📂 Project Structure
backend/ → API, database, auth
frontend/ → UI
⚙️ Setup
git clone https://github.com/your-username/swapreads.git
cd swapreads

Backend:

cd backend
npm install

Create .env:

PORT=5000
MONGODB_URI=your_connection
JWT_SECRET=your_secret
CLIENT_URL=http://localhost:3000

Run backend:

npm run dev

Frontend:

Open frontend/index.html
OR run: npx serve frontend
🌐 Deployment
Frontend: Netlify
Backend: Render
Database: MongoDB Atlas

Update API:

const API_BASE = "https://your-backend-url.onrender.com/api
";
🔒 Security
bcrypt password hashing
JWT authentication
Input validation
CORS protection
📌 API
/api/auth
/api/books
/api/requests
/api/wishlist
/api/notifications
👨‍💻 Author
Your Name
📄 License
MIT License

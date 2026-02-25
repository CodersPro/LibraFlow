require('dotenv').config();

// validate essential environment variables early
if (!process.env.MONGO_URI) {
  console.error('❌ MONGO_URI is not defined in backend/.env');
}
if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET is not defined in backend/.env. Authentication will fail.');
}

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

const app = express();
const server = http.createServer(app);

// Configuration Socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Middleware pour attacher l'instance io à la requête
app.use((req, res, next) => {
  req.io = io;
  next();
});

connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/books', require('./routes/books'));
app.use('/api/loans', require('./routes/loans'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/notifications', require('./routes/notifications'));

app.get('/', (req, res) => {
  res.json({ message: '📚 BIT Library API — En ligne !' });
});

// Gestion des connexions Socket.io
io.on('connection', (socket) => {
  console.log('🔌 Un client s\'est connecté :', socket.id);

  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`👤 Utilisateur ${userId} a rejoint sa room.`);
  });

  socket.on('disconnect', () => {
    console.log('🔌 Client déconnecté');
  });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route introuvable' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});
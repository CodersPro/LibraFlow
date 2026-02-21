require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/auth',  require('./routes/auth'));
app.use('/api/books', require('./routes/books'));
app.use('/api/loans', require('./routes/loans'));
app.use('/api/ai',    require('./routes/ai'));
app.use('/api/stats', require('./routes/stats'));

app.get('/', (req, res) => {
  res.json({ message: '📚 BIT Library API — En ligne !' });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route introuvable' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});
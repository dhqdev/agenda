const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'agenda-secret-key-2025';

app.use(cors());
app.use(express.json());
app.use(express.static('client/dist'));

const db = new sqlite3.Database('./agenda.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    time TIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.run(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword],
      function(err) {
        if (err) {
          return res.status(400).json({ error: 'Usuário já existe' });
        }
        
        const token = jwt.sign({ id: this.lastID, username }, JWT_SECRET);
        res.json({ token, user: { id: this.lastID, username, email } });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  
  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err || !user) {
      return res.status(400).json({ error: 'Credenciais inválidas' });
    }
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Credenciais inválidas' });
    }
    
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
    res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
  });
});

app.get('/api/events', authenticateToken, (req, res) => {
  const { month, year } = req.query;
  let query = 'SELECT * FROM events WHERE user_id = ?';
  let params = [req.user.id];
  
  if (month && year) {
    query += ' AND strftime("%m", date) = ? AND strftime("%Y", date) = ?';
    params.push(month.padStart(2, '0'), year);
  }
  
  query += ' ORDER BY date, time';
  
  db.all(query, params, (err, events) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar eventos' });
    }
    res.json(events);
  });
});

app.post('/api/events', authenticateToken, (req, res) => {
  const { title, description, date, time } = req.body;
  
  db.run(
    'INSERT INTO events (user_id, title, description, date, time) VALUES (?, ?, ?, ?, ?)',
    [req.user.id, title, description, date, time],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Erro ao criar evento' });
      }
      
      db.get('SELECT * FROM events WHERE id = ?', [this.lastID], (err, event) => {
        if (err) {
          return res.status(500).json({ error: 'Erro ao buscar evento' });
        }
        res.json(event);
      });
    }
  );
});

app.put('/api/events/:id', authenticateToken, (req, res) => {
  const { title, description, date, time } = req.body;
  const eventId = req.params.id;
  
  db.run(
    'UPDATE events SET title = ?, description = ?, date = ?, time = ? WHERE id = ? AND user_id = ?',
    [title, description, date, time, eventId, req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Erro ao atualizar evento' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Evento não encontrado' });
      }
      
      res.json({ message: 'Evento atualizado com sucesso' });
    }
  );
});

app.delete('/api/events/:id', authenticateToken, (req, res) => {
  const eventId = req.params.id;
  
  db.run(
    'DELETE FROM events WHERE id = ? AND user_id = ?',
    [eventId, req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Erro ao deletar evento' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Evento não encontrado' });
      }
      
      res.json({ message: 'Evento deletado com sucesso' });
    }
  );
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

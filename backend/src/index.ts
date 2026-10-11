import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './db/pool';
import fs from 'fs';
import path from 'path';
import authRoutes from './routes/auth';
import habitsRoutes from './routes/habits';
import achievementsRoutes from './routes/achievements';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/habits', habitsRoutes);
app.use('/api/achievements', achievementsRoutes);

app.get('/api/health', (_req, res) => res.json({ ok: true }));

async function initDB() {
  const sql = fs.readFileSync(path.join(__dirname, 'db', 'schema.sql'), 'utf8');
  await pool.query(sql);
  console.log('Database schema initialized');
}

app.listen(PORT, async () => {
  try {
    await initDB();
    console.log(`Server running on port ${PORT}`);
  } catch (err) {
    console.error('Failed to init DB:', err);
  }
});

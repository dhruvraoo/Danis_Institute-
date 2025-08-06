import { RequestHandler } from "express";
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || "<YOUR_MONGODB_ATLAS_URI>";
const DB_NAME = "daniweb";
const ADMIN_COLLECTION = "admin";

let cachedClient: MongoClient | null = null;

async function getMongoClient() {
  if (cachedClient) return cachedClient;
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  cachedClient = client;
  return client;
}

// Initialize SQLite DB (db.sqlite3 in project root)
const db = new Database('db.sqlite3');

// Ensure admin table exists
const createTable = `CREATE TABLE IF NOT EXISTS admin (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password_hash TEXT NOT NULL
);`;
db.prepare(createTable).run();

// Ensure admin user exists with password 'admin123' (hashed)
const adminUser = db.prepare('SELECT * FROM admin WHERE username = ?').get('admin');
if (!adminUser) {
  const hash = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO admin (username, password_hash) VALUES (?, ?)').run('admin', hash);
}

export const handleAdminLogin: RequestHandler = async (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ success: false, message: 'Password required' });
  }
  const admin = db.prepare('SELECT * FROM admin WHERE username = ?').get('admin');
  if (!admin) {
    return res.status(500).json({ success: false, message: 'Admin user not found' });
  }
  const match = await bcrypt.compare(password, admin.password_hash);
  if (match) {
    return res.json({ success: true });
  } else {
    return res.status(401).json({ success: false, message: 'Invalid password' });
  }
}; 
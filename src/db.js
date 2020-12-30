const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

function query(text, params = []) {
  return pool.query(text, params)
}

module.exports = {
  query: query,
  track: (foo) => query("INSERT INTO tracks (track) VALUES ($1)", [foo]),
  get_tracks: () => query("SELECT DISTINCT track FROM tracks")
}
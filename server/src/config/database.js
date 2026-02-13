import mysql from 'mysql2/promise';

let pool = null;

function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      port: 3306,
      waitForConnections: true,
      connectionLimit: 10,
    });
  }
  return pool;
}

// Export methods that use the pool
export default {
  async getConnection() {
    return getPool().getConnection();
  },
  async query(sql, params) {
    return getPool().query(sql, params);
  },
  async execute(sql, params) {
    return getPool().execute(sql, params);
  }
};
import mysql from "mysql2/promise";

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

let initialized = false;

export async function initDatabase() {
  if (initialized) return;
  initialized = true;
  try {
    const connection = await pool.getConnection();

    // Create cabins table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS cabins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        local_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        country VARCHAR(100),
        region VARCHAR(100),
        municipality VARCHAR(100),
        latitude DOUBLE NOT NULL,
        longitude DOUBLE NOT NULL,
        altitude INT DEFAULT 0,
        capacity INT,
        amenities TEXT,
        is_free BOOLEAN DEFAULT true,
        requires_booking BOOLEAN DEFAULT false,
        type VARCHAR(100),
        email VARCHAR(255),
        phone VARCHAR(50),
        website VARCHAR(255),
        facebook VARCHAR(255),
        instagram VARCHAR(255),
        description TEXT,
        last_updated DATETIME NOT NULL
      );
    `);

    // Create cabin_images table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS cabin_images (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        cabin_local_id VARCHAR(50),
        name VARCHAR(255),
        file_name VARCHAR(255),
        original_url TEXT,
        preview_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create admin_users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS admin_users (
        username VARCHAR(100) PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.execute(
      `INSERT IGNORE INTO admin_users (username) VALUES (?)`,
      [process.env.ADMIN_USERNAME]
    );

    connection.release();
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}

// Execute a query with parameters
export async function query(sql: string, params: any[] = []) {
  try {
    // console.log("Insert params:", params);
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
}

// Get a single connection from the pool
export async function getConnection() {
  return await pool.getConnection();
}

// Close all connections in the pool
export async function closePool() {
  await pool.end();
}

export default { query, getConnection, closePool, initDatabase };

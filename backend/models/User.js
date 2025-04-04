const pool = require("../config/db");

const createUserTable = async () => {//must be created before parlay table
    const query = `
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password TEXT NOT NULL
    );
`;
    await pool.query(query);
};

createUserTable();
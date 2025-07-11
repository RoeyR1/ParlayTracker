const pool = require("../config/db");

const createParlayTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS parlays (
      id SERIAL PRIMARY KEY, 
      user_id INT REFERENCES users(id) ON DELETE CASCADE,  
      date DATE NOT NULL,  
      money_spent DECIMAL(10,2) NOT NULL,  
      win BOOLEAN NOT NULL,  
      num_legs INT NOT NULL,
      payout DECIMAL(10,2) DEFAULT 0 NOT NULL
    );
  `;
  await pool.query(query);
};

createParlayTable();
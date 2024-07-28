const { Pool } = require('pg');
require('dotenv').config();
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = {
  query: (querystring, parameter) => pool.query(querystring, parameter),
};

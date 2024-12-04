// const mysql = require('mysql2');

// const db = mysql.createPool({
//     host: "localhost",  // Ispravka: koristi samo "localhost"
//     user: "root",
//     password: "Alibasic1",
//     database: "nwatch",
// });



// module.exports = db;


const mysql = require('mysql2')
require("dotenv").config();

// const db = mysql.createPool({
//     host: process.env.DB_HOST, 
//     user: process.env.DB_USERNAME, 
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_DBNAME,
//     waitForConnections: true,
//     connectionLimit: 10,
//     queueLimit: 0
//   });

  
const db = mysql.createPool({
  host: 'sql8.freesqldatabase.com', 
  user: 'sql8748198', 
  password: 'dAuGMhsAYf',
  database: 'sql8748198',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
  
  module.exports = db;
  


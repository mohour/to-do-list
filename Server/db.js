const {Pool}= require('pg');

const pool = new Pool({
    user:"postgres",
    password:"Simolool1997",
    host:"localhost",
    port:5432,
    database:"todolist"
});

module.exports = pool;


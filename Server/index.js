const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const pool = require('./db'); 

dotenv.config();

const app = express();
const PORT = process.env.PORT ;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Welcome to the Server!');
})

app.get('/todos', async(req, res) => {
    try {
        const todos = await pool.query("SELECT * FROM todos");
        res.json(todos.rows);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/todos', async(req, res) => {
    try {
        const {title,descp, completed} = req.body;
        const  newtodo= await pool.query("INSERT INTO todos (title,descp,completed) VALUES  ($1, $2, $3) RETURNING *", [title, descp, completed]);
        res.json({newtodo,msg: 'Todo added successfully',success: true});
        
        
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/todos/:id', async(req, res) => {
    try {
        const {id}=req.params;
        const todos=await pool.query("SELECT * FROM todos WHERE id=$1",[id]);
        res.json(todos.rows);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });}});

app.put('/todos/:id', async(req, res) => {
    try {
        const {id} = req.params;
        const {title,descp,completed} =req.body;
        const todos = await pool.query("UPDATE todos SET title=$1, descp=$2, completed=$3 WHERE id=$4 RETURNING *", [title, descp, completed, id]);
        res.json(todos.rows);}
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.delete('/todos/:id', async(req, res) => {
    try {
        const {id}=req.params;
        const todos =await pool.query("DELETE FROM todos WHERE id=$1 RETURNING *", [id]);
        res.json({msg: 'task deleted successfully'});
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.delete('/todos', async(req, res) => {
    try {
        const todos = await pool.query("DELETE FROM todos");
        res.json({msg: 'All tasks deleted successfully'});
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });   
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
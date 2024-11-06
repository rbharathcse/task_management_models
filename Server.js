
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const Task = require('./Models/Task');


dotenv.config();

const app = express();


app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static('public'));

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB connection error:', err));


app.get('/', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.render('index', { tasks });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tasks', error: err.message });
  }
});


app.get('/tasks/new', (req, res) => {
  res.render('new');
});


app.post('/tasks', async (req, res) => {
  console.log(req.body);
  const { title, description } = req.body;

  try {
    const newTask = new Task({ title, description });
    await newTask.save();
    res.redirect('/');
  } catch (err) {
    res.status(500).json({ message: 'Failed to create task', error: err.message });
  }
});


app.get('/tasks/edit/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const task = await Task.findById(id);
    res.render('edit', { task });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching task for edit', error: err.message });
  }
});

app.post('/tasks/edit/:id', async (req, res) => {
  const { id } = req.params;
  var { title, description, completed } = req.body;
  completed=completed === 'on';

  try {
    const updatedTask = await Task.findByIdAndUpdate(id, { title, description, completed }, { new: true });
    res.redirect('/');
  } catch (err) {
    res.status(500).json({ message: 'Failed to update task', error: err.message });
  }
});


app.post('/tasks/delete/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await Task.findByIdAndDelete(id);
    res.redirect('/');
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete task', error: err.message });
  }
});


const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

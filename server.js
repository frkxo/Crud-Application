const e = require('express');
const express = require('express');
const mongoose = require('mongoose');
const Book = require('./book');
const Joi = require('joi');

const app = express();
app.use(express.json());
const port = 3000;

function validateBook (book) {
    const schema = Joi.object({
        title: Joi.string().min(3).required(),
        author: Joi.string().min(3).required()
    });
    return schema.validateBook(book);
}

// My MongoDB string mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.2.5
mongoose.connect('mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.2.5', {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => console.log('Connected to MongoDB...'))
    .catch(err => console.error('Could not connect to MongoDB...', e))

app.get('/', (req, res) => {
    res.send('Selam dünya');
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

// a temporary database array since I don't know how to work with the databases.
// let books = [];

app.post('/books', async (req, res) => {
    const { error } = validateBook(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    try {
        let book = new Book ({title: req.body.title, author: req.body.author});
        book = await book.save();
        res.send(book);
    } catch (err){
        res.status(400).send(err.message);
    }
});

// GET ALL BOOKS
app.get('/books', async (req, res) => {
    const books = await Book.find();
    res.send(books);
});

// GET A SINGLE BOOK
app.get('/books/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).send('Book not found!')
        }
        res.send(book);
    } catch (err){
        res.status(500).send('Something went wrong!');
    }
});

// UPDATE A BOOK 
app.put('/books/:id', async (req, res) => {
    const { error } = validateBook(req.body);
    if (error) {
        return res.send(400).send(error.details[0].message);
    }

    try {
        const book = await Book.findByIdAndUpdate(req.params.id, {title: req.body.title, author: req.body.author}, {new: true});
        if (!book) {
            return res.status(404).send('Book not found!');
        }
        res.send(book);
    } catch (err) {
        res.status(500).send('Something went wrong!');
    }
}); 

// DELETE A BOOK 
app.delete('/books/:id', async (req, res) => {
    try {
        const book = await Book.findByIdAndDelete(req.params.id);
        if (!book) {
            return res.status(404).send('Book not found!');
        }
        res.status(204).send();
    } catch (err) {
        res.status(500).send('Something went worng!');
    }
});

module.exports = app;
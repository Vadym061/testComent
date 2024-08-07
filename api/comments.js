const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { join } = require('path');

// Ініціалізація додатка Express
const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(join(__dirname, 'uploads')));

// Підключення до MongoDB (використовуйте MongoDB Atlas для розгортання)
const uri = process.env.MONGODB_URI || 'mongodb+srv://root:OnPemGXXk4nz58Qg@cluster0.7wjwyci.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('MongoDB connected');
}).catch(err => {
    console.error('MongoDB connection error', err);
});

// Визначення схеми та моделі
const reviewSchema = new mongoose.Schema({
    name: String,
    feedback: String,
    avatar: String,
});

const Review = mongoose.model('Review', reviewSchema);

// Налаштування Multer для завантаження файлів
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    },
});

const upload = multer({ storage });

// Визначення маршрутів
app.post('/api/comments', upload.single('avatar'), async (req, res) => {
    try {
        const { name, feedback } = req.body;
        const avatar = req.file ? req.file.path : '';

        const newReview = new Review({ name, feedback, avatar });
        await newReview.save();
        res.status(201).json(newReview);
    } catch (error) {
        console.error('Error adding comment:', error.message);
        res.status(500).json({ message: 'Error adding comment', error: error.message });
    }
});

app.get('/api/comments', async (req, res) => {
    try {
        const reviews = await Review.find();
        res.json(reviews);
    } catch (error) {
        console.error('Error fetching comments', error);
        res.status(500).json({ message: 'Error fetching comments' });
    }
});

app.delete('/api/comments/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Review.findByIdAndDelete(id);
        if (!result) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Error deleting comment', error);
        res.status(500).json({ message: 'Error deleting comment' });
    }
});

// Експортуємо додаток як серверлес функцію Vercel
module.exports = app;
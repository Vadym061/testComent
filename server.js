const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Підключення до локального MongoDB
mongoose.connect('mongodb://localhost:27017/portfolio', {
    serverSelectionTimeoutMS: 5000  // Задаємо ліміт часу для вибору сервера
}).then(() => {
    console.log('MongoDB connected');
}).catch(err => {
    console.error('MongoDB connection error', err);
});

// Схема коментарів
const reviewSchema = new mongoose.Schema({
    name: String,
    feedback: String,
    avatar: String,
});

const Review = mongoose.model('Review', reviewSchema);

// Налаштування multer для завантаження зображень
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    },
});

const upload = multer({ storage });

// Маршрут для відправки відгуку
app.post('/api/comments', upload.single('avatar'), async (req, res) => {
    try {
        const { name, feedback } = req.body;
        const avatar = req.file ? req.file.path : '';

        const newReview = new Review({ name, feedback, avatar });
        await newReview.save();
        res.status(201).json(newReview);
    } catch (error) {
        console.error('Error adding comment:', error.message); // Виводимо деталі помилки
        res.status(500).json({ message: 'Error adding comment', error: error.message });
    }
});

// Маршрут для отримання відгуків
app.get('/api/comments', async (req, res) => {
    try {
        const reviews = await Review.find();
        res.json(reviews);
    } catch (error) {
        console.error('Error fetching comments', error);
        res.status(500).json({ message: 'Error fetching comments' });
    }
});

// Маршрут для видалення коментаря
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

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});
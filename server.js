const mongoose = require('mongoose');
const express = require('express');
const dotEnv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes.js');
const fs = require('fs');
const path = require('path');

dotEnv.config(); // Load .env early

const app = express();

const uploadDir = process.env.UPLOADS_PATH || path.join(__dirname, '/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log("Upload Folder Created.");
}

app.use('/uploads', express.static(uploadDir));

app.use(cors({
    origin: 'https://my-frontend-kohl.vercel.app',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log("MongoDB connected successfully!");
})
.catch((err) => {
    console.error("MongoDB connection error:", err);
});

app.use('/', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server started and running at port ${PORT}`);
});

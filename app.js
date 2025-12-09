const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const expenseRoutes = require('./routes/expenses');

const app = express();
const PORT = process.env.PORT || 3000;
const mongoose = require('mongoose');

const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/expense-splitter';
mongoose.connect(dbUrl, {});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

// View engine setup
app.engine('ejs', require('ejs-mate'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

// Data Store (In-memory for this session)
// We'll pass this to our routes or handle it within the route module.
// For simplicity, let's keep the state in the route module.

// Routes
app.use('/', expenseRoutes);

// 404 Handler
app.use((req, res) => {
    res.status(404).render('layouts/boilerplate', {
        title: 'Page Not Found',
        body: '<h1>404 - Page Not Found</h1><a href="/">Go Home</a>'
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

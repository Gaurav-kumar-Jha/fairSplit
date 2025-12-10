const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const expenseRoutes = require('./routes/expenses');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;
const mongoose = require('mongoose');

const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

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
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(async (username, password, done) => {
    try {
        const { user, error } = await User.authenticate()(username, password);
        if (error) {
            // "error" here is typically an object with a message, or null
            return done(null, false, { message: error.message || 'Authentication failed' });
        }
        if (!user) {
            return done(null, false, { message: 'Incorrect username or password' });
        }
        return done(null, user);
    } catch (e) {
        return done(e);
    }
}));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
});

// Data Store (In-memory for this session)
// We'll pass this to our routes or handle it within the route module.
// For simplicity, let's keep the state in the route module.

// Routes
app.use('/', expenseRoutes);
app.use('/', authRoutes);

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

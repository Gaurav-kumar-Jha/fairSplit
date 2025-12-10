const mongoose = require('mongoose');
const Expense = require('./models/expense');
const User = require('./models/user');
const Participant = require('./models/participant'); // Legacy

const dbUrl = 'mongodb://127.0.0.1:27017/expense-splitter';
mongoose.connect(dbUrl, {});

const resetDb = async () => {
    await Expense.deleteMany({});
    await User.deleteMany({});
    await Participant.deleteMany({}); // Cleanup legacy
    console.log("Database cleared");
    mongoose.connection.close();
};

resetDb();

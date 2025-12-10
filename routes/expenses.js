const express = require('express');
const router = express.Router();
const Expense = require('../models/expense');
const User = require('../models/user');
const calculateDebts = require('../utils/expenseCalc');
const { isLoggedIn } = require('../middleware');

// GET / - Dashboard
router.get('/', isLoggedIn, async (req, res) => {
    const expenses = await Expense.find({
        $or: [
            { payer: req.user._id },
            { recipient: req.user._id, status: 'accepted' }
        ]
    }).populate('payer recipient');

    res.render('expenses/index', { expenses, pageTitle: 'Dashboard' });
});

// GET /requests - View Requests
router.get('/requests', isLoggedIn, async (req, res) => {
    const receivedRequests = await Expense.find({
        recipient: req.user._id,
        status: 'pending'
    }).populate('payer');

    const sentRequests = await Expense.find({
        payer: req.user._id,
        status: 'pending'
    }).populate('recipient');

    res.render('expenses/requests', { receivedRequests, sentRequests, pageTitle: 'Requests' });
});

// POST /expenses - Add Expense (Request)
router.post('/expenses', isLoggedIn, async (req, res) => {
    const { description, amount, username } = req.body;

    // Find recipient by username
    const recipientUser = await User.findOne({ username: username.trim() });

    if (!recipientUser) {
        // Handle error: User not found (Quick fix: just redirect for now)
        // Ideally flash message
        console.log("User not found");
        return res.redirect('/');
    }

    if (recipientUser._id.equals(req.user._id)) {
        console.log("Cannot add yourself");
        return res.redirect('/');
    }

    if (description && amount) {
        const expense = new Expense({
            description,
            amount: parseFloat(amount),
            payer: req.user._id,
            recipient: recipientUser._id,
            status: 'pending'
        });
        await expense.save();
    }
    res.redirect('/requests'); // Redirect to requests to see sent items
});

// POST /expenses/:id/respond - Accept/Reject
router.post('/expenses/:id/respond', isLoggedIn, async (req, res) => {
    const { status } = req.body; // accepted or rejected

    // Security: ensure current user is recipient
    const targetExpense = await Expense.findOne({ _id: req.params.id, recipient: req.user._id });

    if (targetExpense && ['accepted', 'rejected'].includes(status)) {
        targetExpense.status = status;
        await targetExpense.save();
    }
    res.redirect('/requests');
});

// POST /expenses/delete/:id - Delete Expense (Only Payer can delete?)
router.post('/expenses/delete/:id', isLoggedIn, async (req, res) => {
    await Expense.findOneAndDelete({ _id: req.params.id, payer: req.user._id });
    res.redirect('/');
});


// GET /summary - View Plan
router.get('/summary', isLoggedIn, async (req, res) => {
    // Fetch all ACCEPTED expenses involving me
    const expenses = await Expense.find({
        $or: [
            { payer: req.user._id, status: 'accepted' },
            { recipient: req.user._id, status: 'accepted' }
        ]
    }).populate('payer recipient');

    // Calculate debts using the utility for net settlement
    const debts = calculateDebts(expenses);

    res.render('expenses/summary', { debts, hasExpenses: expenses.length > 0, pageTitle: 'Settlement Summary' });
});

module.exports = router;


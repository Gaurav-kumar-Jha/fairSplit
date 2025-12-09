const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const calculateDebts = require('../utils/expenseCalc');

let participants = [];
let expenses = [];

// GET / - Dashboard
router.get('/', (req, res) => {
    res.render('expenses/index', { participants, expenses, pageTitle: 'Dashboard' });
});

// POST /participants - Add Participant
router.post('/participants', (req, res) => {
    const { name } = req.body;
    if (name && !participants.includes(name.trim())) {
        participants.push(name.trim());
    }
    res.redirect('/');
});

// POST /expenses - Add Expense
router.post('/expenses', (req, res) => {
    const { description, amount, payer } = req.body;
    if (description && amount && payer) {
        expenses.push({
            id: uuidv4(),
            description,
            amount: parseFloat(amount),
            payer,
            date: new Date()
        });
    }
    res.redirect('/');
});

// POST /expenses/delete/:id - Delete Expense
router.post('/expenses/delete/:id', (req, res) => {
    expenses = expenses.filter(e => e.id !== req.params.id);
    res.redirect('/');
});

// GET /summary - View Plan
router.get('/summary', (req, res) => {
    const debts = calculateDebts(participants, expenses);
    res.render('expenses/summary', { debts, participants, expenses, pageTitle: 'Settlement Summary' });
});

// POST /reset - Clear data
router.post('/reset', (req, res) => {
    participants = [];
    expenses = [];
    res.redirect('/');
});

module.exports = router;

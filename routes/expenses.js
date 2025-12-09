const express = require('express');
const router = express.Router();
const calculateDebts = require('../utils/expenseCalc');
const Participant = require('../models/participant');
const Expense = require('../models/expense');

// GET / - Dashboard
router.get('/', async (req, res) => {
    const participants = await Participant.find({});
    const expenses = await Expense.find({});
    res.render('expenses/index', { participants: participants.map(p => p.name), expenses, pageTitle: 'Dashboard' });
});

// POST /participants - Add Participant
router.post('/participants', async (req, res) => {
    const { name } = req.body;
    if (name) {
        try {
            const existing = await Participant.findOne({ name: name.trim() });
            if (!existing) {
                const participant = new Participant({ name: name.trim() });
                await participant.save();
            }
        } catch (e) {
            console.log(e);
        }
    }
    res.redirect('/');
});

// POST /expenses - Add Expense
router.post('/expenses', async (req, res) => {
    const { description, amount, payer } = req.body;
    if (description && amount && payer) {
        const expense = new Expense({
            description,
            amount: parseFloat(amount),
            payer
        });
        await expense.save();
    }
    res.redirect('/');
});

// POST /expenses/delete/:id - Delete Expense
router.post('/expenses/delete/:id', async (req, res) => {
    await Expense.findByIdAndDelete(req.params.id);
    res.redirect('/');
});

// GET /summary - View Plan
router.get('/summary', async (req, res) => {
    const participantsDoc = await Participant.find({});
    const expenses = await Expense.find({});
    const participants = participantsDoc.map(p => p.name);

    const debts = calculateDebts(participants, expenses);
    res.render('expenses/summary', { debts, participants, expenses, pageTitle: 'Settlement Summary' });
});

// POST /reset - Clear data
router.post('/reset', async (req, res) => {
    await Participant.deleteMany({});
    await Expense.deleteMany({});
    res.redirect('/');
});

module.exports = router;

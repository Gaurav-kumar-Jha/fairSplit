function calculateDebts(participants, expenses) {
    if (participants.length === 0) return [];

    let balances = {};
    participants.forEach(p => balances[p] = 0);

    expenses.forEach(exp => {
        const amount = parseFloat(exp.amount);
        const payer = exp.payer;
        const splitAmount = amount / participants.length;

        // Payer paid the full amount, so they are "up" by that amount initially
        // But we subtract the fair share from everyone including the payer
        // Net change for payer = +Amount - (Amount/N)
        // Net change for others = -(Amount/N)

        // Let's stick to simple ledger:
        // Credit the payer
        if (balances[payer] !== undefined) {
            balances[payer] += amount;
        }

        // Debit everyone their share
        participants.forEach(p => {
            balances[p] -= splitAmount;
        });
    });

    // Separate into debtors and creditors
    let debtors = [];
    let creditors = [];

    for (const [person, amount] of Object.entries(balances)) {
        // Round to 2 decimals to avoid floating point issues
        let net = Math.round(amount * 100) / 100;
        if (net < -0.01) debtors.push({ person, amount: net }); // amount is negative
        if (net > 0.01) creditors.push({ person, amount: net });  // amount is positive
    }

    // Sort by magnitude to minimize transactions (heuristic)
    debtors.sort((a, b) => a.amount - b.amount); // Ascending (most negative first)
    creditors.sort((a, b) => b.amount - a.amount); // Descending (most positive first)

    let debts = [];
    let i = 0; // debtors index
    let j = 0; // creditors index

    while (i < debtors.length && j < creditors.length) {
        let debtor = debtors[i];
        let creditor = creditors[j];

        // The amount to be settled is the minimum of magnitude of debt or credit
        let amount = Math.min(Math.abs(debtor.amount), creditor.amount);

        // Record the transaction
        debts.push({
            from: debtor.person,
            to: creditor.person,
            amount: amount.toFixed(2)
        });

        // Update remaining balances
        debtor.amount += amount;
        creditor.amount -= amount;

        // Check if settled (close to 0)
        if (Math.abs(debtor.amount) < 0.01) i++;
        if (creditor.amount < 0.01) j++;
    }

    return debts;
}

module.exports = calculateDebts;

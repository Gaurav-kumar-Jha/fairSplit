function calculateDebts(expenses) {
    let balances = {};

    // 1. Calculate Net Balances
    expenses.forEach(exp => {
        const payer = exp.payer.username;
        const recipient = exp.recipient.username;
        const amount = parseFloat(exp.amount);

        if (!balances[payer]) balances[payer] = 0;
        if (!balances[recipient]) balances[recipient] = 0;

        balances[payer] += amount;      // Payer gets money back (positive balance)
        balances[recipient] -= amount;  // Recipient owes money (negative balance)
    });

    // 2. Separate into Debtors and Creditors
    let debtors = [];
    let creditors = [];

    for (const [person, amount] of Object.entries(balances)) {
        let net = Math.round(amount * 100) / 100; // Round to 2 decimals
        if (net < -0.01) debtors.push({ person, amount: net });
        if (net > 0.01) creditors.push({ person, amount: net });
    }

    // Sort by magnitude to optimize matching
    debtors.sort((a, b) => a.amount - b.amount); // Ascending (most negative first)
    creditors.sort((a, b) => b.amount - a.amount); // Descending (most positive first)

    // 3. Match Debtors to Creditors
    let debts = [];
    let i = 0;
    let j = 0;

    while (i < debtors.length && j < creditors.length) {
        let debtor = debtors[i];
        let creditor = creditors[j];

        // The amount to settle is the minimum of what the debtor owes and what the creditor is owed
        let amount = Math.min(Math.abs(debtor.amount), creditor.amount);

        debts.push({
            from: debtor.person,
            to: creditor.person,
            amount: amount.toFixed(2)
        });

        // Update balances
        debtor.amount += amount;
        creditor.amount -= amount;

        // Move pointers if settled (approximate zero check)
        if (Math.abs(debtor.amount) < 0.01) i++;
        if (creditor.amount < 0.01) j++;
    }

    return debts;
}

module.exports = calculateDebts;

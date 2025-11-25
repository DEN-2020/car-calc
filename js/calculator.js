// ===============================
// LOAN / FINANCING CALCULATOR
// ===============================

export function calcLoan({ price, down, years, rate }) {
    price = Number(price);
    down = Number(down);
    years = Number(years);
    rate = Number(rate);

    const loanAmount = price - down;
    if (loanAmount <= 0) {
        return {
            monthly: 0,
            interest: 0,
            total: 0
        };
    }

    const months = years * 12;
    const monthlyRate = rate / 100 / 12;

    const monthlyPayment =
        (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));

    const totalPaid = monthlyPayment * months;
    const totalInterest = totalPaid - loanAmount;

    return {
        monthly: monthlyPayment,
        interest: totalInterest,
        total: totalPaid
    };
}

// =======================
// Pure Loan Math Module
// =======================

export function calculateLoan(data) {
  const {
    price, down, rate, termMonths, balloon,
    fees, extraMonthly, extraStart
  } = data;

  const principal = price - down + fees;
  const monthlyRate = rate / 100 / 12;

  // Base monthly payment formula (without balloon)
  const baseMonthly = (monthlyRate * principal) /
    (1 - Math.pow(1 + monthlyRate, -termMonths));

  // Balloon adjusts final payment
  const balloonPV = balloon / Math.pow(1 + monthlyRate, termMonths);

  const monthly = baseMonthly - (monthlyRate * balloonPV);

  let totalInterest = 0;
  let remaining = principal;
  let saved = 0;

  for (let m = 1; m <= termMonths; m++) {
    const interest = remaining * monthlyRate;
    let payment = monthly;

    if (m >= extraStart)
      payment += extraMonthly;

    const principalPay = payment - interest;
    remaining -= principalPay;

    totalInterest += interest;

    if (remaining <= 0) break;
  }

  const totalCost = principal + totalInterest;

  return {
    monthly: monthly.toFixed(2),
    totalInterest: totalInterest.toFixed(2),
    totalCost: totalCost.toFixed(2),
    apr: rate.toFixed(2),
    saved: saved.toFixed(2)
  };
}

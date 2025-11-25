// loan.js — module

function getNum(id) {
  return parseFloat(document.getElementById(id).value) || 0;
}

function calculateLoan() {
  const price = getNum("loan_price");
  const down = getNum("loan_down");
  const years = getNum("loan_years");
  const rate = getNum("loan_rate") / 100;

  const financed = price - down;
  const months = years * 12;
  const monthlyRate = rate / 12;

  // Monthly payment (standard amortization formula)
  const monthly =
    financed *
    (monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1);

  const totalPaid = monthly * months;
  const interest = totalPaid - financed;

  // update UI
  document.getElementById("loan_monthly").textContent = monthly.toFixed(2);
  document.getElementById("loan_interest").textContent = interest.toFixed(2);
  document.getElementById("loan_total").textContent = totalPaid.toFixed(2);
}

document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("loan_calc_btn")
    .addEventListener("click", calculateLoan);
  
  // autocalc on input change
  ["loan_price","loan_down","loan_years","loan_rate"].forEach(id => {
    document.getElementById(id).addEventListener("input", calculateLoan);
  });

  calculateLoan();
});

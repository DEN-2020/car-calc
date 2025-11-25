import { addFeeRow } from "./ui.js";
import { calculateLoan } from "./calculator.js";

// -----------------------
// Add fees
// -----------------------
document.getElementById("add-fee").onclick = addFeeRow;

// -----------------------
// Recalculate on input
// -----------------------
document.addEventListener("input", update);

function update() {
  const price = Number(document.getElementById("loan_price").value);
  const down = Number(document.getElementById("loan_down").value);
  const rate = Number(document.getElementById("loan_rate").value);

  const termType = document.getElementById("loan_term_type").value;
  const termValue = Number(document.getElementById("loan_term_value").value);

  const termMonths = termType === "years"
    ? termValue * 12
    : termValue;

  const balloon = Number(document.getElementById("loan_balloon").value);
  const extraMonthly = Number(document.getElementById("extra_monthly").value);
  const extraStart = Number(document.getElementById("extra_start").value);

  const fees = [...document.querySelectorAll(".fee-value")]
      .map(f => Number(f.value) || 0)
      .reduce((a, b) => a + b, 0);

  if (!price || !termMonths || !rate) return; // not enough data

  const r = calculateLoan({
    price, down, rate, termMonths, balloon,
    fees, extraMonthly, extraStart
  });

  document.getElementById("res_monthly").textContent = r.monthly;
  document.getElementById("res_interest").textContent = r.totalInterest;
  document.getElementById("res_total_cost").textContent = r.totalCost;
  document.getElementById("res_apr").textContent = r.apr;
  document.getElementById("res_saved").textContent = r.saved;
}

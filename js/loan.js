// js/loan.js

// ---------- helpers ----------
function getNum(id) {
  const el = document.getElementById(id);
  if (!el) return 0;
  const v = parseFloat(el.value);
  return isNaN(v) ? 0 : v;
}

function formatMoney(x) {
  return x.toFixed(2);
}

// ---------- main calc ----------
function calcLoan() {
  const price = getNum("loan_price");
  const down = getNum("loan_down");
  const trade = getNum("loan_trade"); // если поля нет — вернётся 0
  const fees = getNum("loan_fees");
  const years = getNum("loan_years");
  const rateYear = getNum("loan_rate");
  const typeEl = document.getElementById("loan_type");
  const type = typeEl ? typeEl.value : "annuity";

  const resultBox = document.getElementById("loan-result");
  if (!resultBox) return;

  if (price <= 0 || years <= 0) {
    resultBox.innerHTML = `<p>Please fill at least <b>car price</b> and <b>loan term</b>.</p>`;
    return;
  }

  // сколько реально идёт в кредит: price - down - trade + fees
  let principal = price - down - trade + fees;
  if (principal < 0) principal = 0;

  const nMonths = years * 12;
  const rMonth = rateYear > 0 ? (rateYear / 100) / 12 : 0;

  let monthly = 0;
  let totalLoanPaid = 0;
  let totalInterest = 0;

  if (type === "annuity" && rMonth > 0) {
    const pow = Math.pow(1 + rMonth, nMonths);
    monthly = principal * rMonth * pow / (pow - 1);
    totalLoanPaid = monthly * nMonths;
    totalInterest = totalLoanPaid - principal;
  } else {
    monthly = principal / nMonths;
    totalLoanPaid = monthly * nMonths;
    totalInterest = 0;
  }

  const totalCash = down + fees + totalLoanPaid;

  resultBox.innerHTML = `
    <div class="result-box">

      <div class="result-row">
        <span class="result-label">Net loan amount</span>
        <span class="result-value">${formatMoney(principal)} €</span>
      </div>

      <div class="result-row">
        <span class="result-label">Monthly payment</span>
        <span class="result-value main green">${formatMoney(monthly)} €</span>
      </div>

      <div class="result-row">
        <span class="result-label">Total interest (loan only)</span>
        <span class="result-value orange">${formatMoney(totalInterest)} €</span>
      </div>

      <div class="result-row">
        <span class="result-label">Total loan payments</span>
        <span class="result-value">${formatMoney(totalLoanPaid)} €</span>
      </div>

      <hr style="border:none;border-top:1px solid #333;margin:8px 0;">

      <div class="result-row">
        <span class="result-label">Upfront cash (down + fees)</span>
        <span class="result-value">${formatMoney(down + fees)} €</span>
      </div>

      <div class="result-row">
        <span class="result-label">Total cash out (all years)</span>
        <span class="result-value main">${formatMoney(totalCash)} €</span>
      </div>

      <p class="result-note">
        Note: trade-in reduces the loan principal. Insurance, fuel, service, tax, etc.
        will be added later as separate blocks.
      </p>
    </div>
  `;

  // сохраняем для summary
  try {
    const summary = {
      price,
      down,
      trade,
      fees,
      years,
      rateYear,
      type,
      principal,
      monthly,
      totalLoanPaid,
      totalInterest,
      totalCash,
    };
    localStorage.setItem("carcalc_loan_summary", JSON.stringify(summary));
  } catch {
    // ignore
  }

  // сохраняем форму
  saveFormState();
}

// ---------- wiring ----------
document.addEventListener("DOMContentLoaded", () => {
  // грузим сохранённые значения в поля
  try {
    const raw = localStorage.getItem("carcalc_loan_form");
    if (raw) {
      const saved = JSON.parse(raw);
      for (const [id, val] of Object.entries(saved)) {
        const el = document.getElementById(id);
        if (el && typeof val !== "undefined") {
          el.value = val;
        }
      }
    }
  } catch {
    // ignore
  }

  // вешаем кнопку
  const btn = document.getElementById("loan_calc_btn");
  if (btn) {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      calcLoan();
    });
  }

  // опционально — авто-пересчёт при вводе
  const form = document.getElementById("loan-form");
  if (form) {
    form.addEventListener("input", () => {
      saveFormState();
    });
  }
});

function saveFormState() {
  const ids = [
    "loan_price",
    "loan_down",
    "loan_trade",
    "loan_fees",
    "loan_years",
    "loan_rate",
    "loan_type",
  ];
  const data = {};
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) data[id] = el.value;
  });
  try {
    localStorage.setItem("carcalc_loan_form", JSON.stringify(data));
  } catch {
    // ignore
  }
}

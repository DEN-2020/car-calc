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
export function calcLoan() {
  const price = getNum("loan_price");
  const down = getNum("loan_down");
  const trade = getNum("loan_trade");
  const fees = getNum("loan_fees");
  const years = getNum("loan_years");
  const rateYear = getNum("loan_rate");
  const type = (document.getElementById("loan_type") || {}).value || "annuity";

  const resultBox = document.getElementById("loan-result");
  if (!resultBox) return;

  // базовая валидация
  if (price <= 0 || years <= 0) {
    resultBox.innerHTML = `<p>Please fill at least <b>car price</b> and <b>loan term</b>.</p>`;
    return;
  }

  // сколько реально идёт в кредит
  // net = цена - down - trade + fees, но не меньше 0
  let principal = price - down - trade + fees;
  if (principal < 0) principal = 0;

  const nMonths = years * 12;
  const rMonth = rateYear > 0 ? (rateYear / 100) / 12 : 0;

  let monthly = 0;
  let totalLoanPaid = 0;
  let totalInterest = 0;

  if (type === "annuity" && rMonth > 0) {
    // стандартная аннуитетная формула
    const pow = Math.pow(1 + rMonth, nMonths);
    monthly = principal * rMonth * pow / (pow - 1);
    totalLoanPaid = monthly * nMonths;
    totalInterest = totalLoanPaid - principal;
  } else {
    // simple: без процентов, для отладки/нулевой ставки
    monthly = principal / nMonths;
    totalLoanPaid = monthly * nMonths;
    totalInterest = 0;
  }

  // сколько ты реально вытащишь из кармана за всё время:
  // начальный кэш (down + fees) + все платежи по кредиту
  const totalCash = down + fees + totalLoanPaid;

  // ---------- вывод ----------
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

  // — опционально — сохраняем в localStorage для future summary page —
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
    // ничего страшного, просто не сохранилось
  }
}

// ---------- wiring ----------
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loan-form");
  const btn = document.getElementById("loan_calc_btn");

  // загрузим сохранённые значения, если есть
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
    // игнор
  }

  // реакция на кнопку
  if (btn) {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      calcLoan();
      saveFormState();
    });
  }

  // авто-пересчёт при изменении полей (опционально)
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

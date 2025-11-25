import { calcLoan } from "./calculator.js";

export function initLoanUI() {
    const priceEl = document.getElementById("loan_price");
    const downEl = document.getElementById("loan_down");
    const yearsEl = document.getElementById("loan_years");
    const rateEl = document.getElementById("loan_rate");

    const outMonthly = document.getElementById("loan_monthly");
    const outInterest = document.getElementById("loan_interest");
    const outTotal = document.getElementById("loan_total");

    function update() {
        const res = calcLoan({
            price: priceEl.value,
            down: downEl.value,
            years: yearsEl.value,
            rate: rateEl.value
        });

        outMonthly.textContent = res.monthly.toFixed(2);
        outInterest.textContent = res.interest.toFixed(2);
        outTotal.textContent = res.total.toFixed(2);
    }

    // Auto-update on input
    [priceEl, downEl, yearsEl, rateEl].forEach(el =>
        el.addEventListener("input", update)
    );

    update();
}

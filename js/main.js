import { FINLAND_PRESETS as P } from "./presets.js";
import { inputRow, customRow } from "./ui.js";
import { yearlyFuelCost, monthly, totalYearly } from "./calculator.js";

let customId = 0;

const basicEl = document.getElementById("car-basic");
const loanEl = document.getElementById("car-loan");
const recurringEl = document.getElementById("car-recurring");
const customList = document.getElementById("custom-list");
const totalEl = document.getElementById("total-output");

function init() {
  // Basic
  basicEl.appendChild(inputRow("Purchase price", "car_price", "€"));
  basicEl.appendChild(inputRow("Annual mileage", "km_year", "km", P.annualMileage));
  basicEl.appendChild(inputRow("Fuel price", "fuel_price", "€/L", P.fuelPrice));
  basicEl.appendChild(inputRow("Consumption", "fuel_l100", "L/100km", P.avgConsumption));

  // Loan
  loanEl.appendChild(inputRow("Loan amount", "loan_amount", "€"));
  loanEl.appendChild(inputRow("Loan term", "loan_months", "months"));
  loanEl.appendChild(inputRow("Monthly payment", "loan_payment", "€"));

  // Recurring
  recurringEl.appendChild(inputRow("Insurance", "ins_year", "€/year", P.insurance));
  recurringEl.appendChild(inputRow("Inspection", "insp_year", "€/year", P.inspection));
  recurringEl.appendChild(inputRow("Road tax", "tax_year", "€/year", P.roadTax));

  document.querySelectorAll("input").forEach(i =>
    i.addEventListener("input", calculate)
  );

  document.getElementById("add-custom").onclick = () => {
    customId++;
    const row = customRow(customId);
    customList.appendChild(row);
    row.querySelector(".remove").onclick = () => {
      row.remove();
      calculate();
    };
    row.querySelectorAll("input").forEach(i => i.addEventListener("input", calculate));
  };

  calculate();
}

function calculate() {
  const km = +document.getElementById("km_year").value || 0;
  const fuel = yearlyFuelCost(
    km,
    +document.getElementById("fuel_l100").value || 0,
    +document.getElementById("fuel_price").value || 0
  );

  const insurance = +document.getElementById("ins_year").value || 0;
  const insp = +document.getElementById("insp_year").value || 0;
  const tax = +document.getElementById("tax_year").value || 0;

  const customCosts = [...document.querySelectorAll("#custom-list input[id^='value-']")]
    .map(i => +i.value || 0);

  const yearly = totalYearly([fuel, insurance, insp, tax, ...customCosts]);
  const monthlyTotal = monthly(yearly);

  totalEl.innerHTML = `
    <div class="total-row">Fuel: <b>${fuel.toFixed(0)} € / year</b></div>
    <div class="total-row">Total yearly: <b>${yearly.toFixed(0)} €</b></div>
    <div class="total-row">Monthly cost: <b>${monthlyTotal.toFixed(0)} €</b></div>
  `;
}

init();

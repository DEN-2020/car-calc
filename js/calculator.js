export function yearlyFuelCost(km, l100, price) {
  return (km / 100) * l100 * price;
}

export function monthly(value) {
  return value / 12;
}

export function loanMonthly(payment, months) {
  return payment / months;
}

export function totalYearly(blocks) {
  return blocks.reduce((s, v) => s + (v || 0), 0);
}

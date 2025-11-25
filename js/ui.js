export function inputRow(label, id, suffix = "", value = "") {
  const div = document.createElement("div");
  div.className = "row";
  div.innerHTML = `
    <label for="${id}">${label}</label>
    <input id="${id}" type="number" step="0.01" value="${value}">
    <span class="suffix">${suffix}</span>
  `;
  return div;
}

export function customRow(id) {
  const div = document.createElement("div");
  div.className = "row";
  div.innerHTML = `
    <input id="name-${id}" placeholder="Name">
    <input id="value-${id}" type="number" step="0.01" placeholder="€/year">
    <button class="remove" data-id="${id}">×</button>
  `;
  return div;
}

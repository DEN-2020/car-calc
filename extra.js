// js/extra.js

(function () {
    function getNumberById(id) {
        var el = document.getElementById(id);
        if (!el) return 0;
        var v = parseFloat(el.value.replace(",", "."));
        return isNaN(v) ? 0 : v;
    }

    function normalizeType(type) {
        if (!type) return "once";
        if (type === "year" || type === "month" || type === "once") return type;
        return "once";
    }

    // --- EXTRA (tax / insurance / service / other) ---

    window.getExtraSummary = function (months) {
        var years = months / 12;
        if (!isFinite(years) || years <= 0) years = 1;

        var toggle = document.getElementById("extra_toggle");
        if (!toggle || !toggle.checked) {
            return {
                enabled: false,
                perMonth: 0,
                perYear: 0,
                periodTotal: 0,
                afterLoanYear: 0,
                breakdown: []
            };
        }

        function addItem(label, valueId, typeId) {
            var v = getNumberById(valueId);
            var sel = document.getElementById(typeId);
            var t = normalizeType(sel ? sel.value : "once");
            return { label: label, value: v, type: t };
        }

        var items = [
            addItem("Tax", "tax_value", "tax_type"),
            addItem("Insurance", "insurance_value", "insurance_type"),
            addItem("Service", "service_value", "service_type"),
            addItem("Other", "other_value", "other_type")
        ];

        var periodTotal = 0;
        var perYear = 0;
        var perMonth = 0;
        var afterLoanYear = 0;

        items.forEach(function (it) {
            if (it.value <= 0) return;
            if (it.type === "once") {
                periodTotal += it.value;
            } else if (it.type === "year") {
                var pt = it.value * years;
                periodTotal += pt;
                perYear += it.value;
                afterLoanYear += it.value;
            } else if (it.type === "month") {
                var pm = it.value * months;
                periodTotal += pm;
                perMonth += it.value;
                afterLoanYear += it.value * 12;
            }
        });

        // если есть ежемесячные — переведём их в годовую составляющую
        perYear += perMonth * 12;

        return {
            enabled: true,
            perMonth: perMonth + perYear / 12,
            perYear: perYear,
            periodTotal: periodTotal,
            afterLoanYear: afterLoanYear,
            breakdown: items
        };
    };

    // --- CUSTOM EXPENSES ---

    function createCustomRow(index) {
        var container = document.createElement("div");
        container.className = "custom-row";
        container.dataset.index = String(index);

        var titleInput = document.createElement("input");
        titleInput.type = "text";
        titleInput.placeholder = "Name";
        titleInput.className = "custom-title";

        var valueInput = document.createElement("input");
        valueInput.type = "number";
        valueInput.placeholder = "Amount";
        valueInput.className = "custom-value";

        var select = document.createElement("select");
        select.className = "custom-type";
        select.innerHTML = ""
            + "<option value='year'>Yearly</option>"
            + "<option value='month'>Monthly</option>"
            + "<option value='once'>Once</option>";

        var btnRemove = document.createElement("button");
        btnRemove.type = "button";
        btnRemove.className = "remove-btn";
        btnRemove.textContent = "✖";

        btnRemove.addEventListener("click", function () {
            if (container.parentNode) {
                container.parentNode.removeChild(container);
            }
        });

        container.appendChild(titleInput);
        container.appendChild(valueInput);
        container.appendChild(select);
        container.appendChild(btnRemove);

        return container;
    }

    function addCustomRow() {
        var list = document.getElementById("custom_list");
        if (!list) return;
        var index = list.children.length;
        list.appendChild(createCustomRow(index));
    }

    window.getCustomSummary = function (months) {
        var years = months / 12;
        if (!isFinite(years) || years <= 0) years = 1;

        var toggle = document.getElementById("custom_toggle");
        if (!toggle || !toggle.checked) {
            return {
                enabled: false,
                perMonth: 0,
                perYear: 0,
                periodTotal: 0,
                afterLoanYear: 0,
                items: []
            };
        }

        var list = document.getElementById("custom_list");
        if (!list) {
            return {
                enabled: false,
                perMonth: 0,
                perYear: 0,
                periodTotal: 0,
                afterLoanYear: 0,
                items: []
            };
        }

        var rows = list.getElementsByClassName("custom-row");
        var items = [];

        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            var titleInput = row.querySelector(".custom-title");
            var valueInput = row.querySelector(".custom-value");
            var typeSelect = row.querySelector(".custom-type");

            var name = titleInput && titleInput.value ? titleInput.value : "Custom " + (i + 1);
            var v = valueInput ? parseFloat(valueInput.value.replace(",", ".")) : 0;
            if (!isFinite(v) || v <= 0) continue;
            var t = normalizeType(typeSelect ? typeSelect.value : "once");

            items.push({
                label: name,
                value: v,
                type: t
            });
        }

        var periodTotal = 0;
        var perYear = 0;
        var perMonth = 0;
        var afterLoanYear = 0;

        items.forEach(function (it) {
            if (it.type === "once") {
                periodTotal += it.value;
            } else if (it.type === "year") {
                var pt = it.value * years;
                periodTotal += pt;
                perYear += it.value;
                afterLoanYear += it.value;
            } else if (it.type === "month") {
                var pm = it.value * months;
                periodTotal += pm;
                perMonth += it.value;
                afterLoanYear += it.value * 12;
            }
        });

        perYear += perMonth * 12;

        return {
            enabled: true,
            perMonth: perMonth + perYear / 12,
            perYear: perYear,
            periodTotal: periodTotal,
            afterLoanYear: afterLoanYear,
            items: items
        };
    };

    document.addEventListener("DOMContentLoaded", function () {
        var extraToggle = document.getElementById("extra_toggle");
        if (extraToggle) {
            extraToggle.addEventListener("change", function () {
                var block = document.getElementById("extra_block");
                if (!block) return;
                block.classList.toggle("hidden", !extraToggle.checked);
            });
        }

        var customToggle = document.getElementById("custom_toggle");
        if (customToggle) {
            customToggle.addEventListener("change", function () {
                var block = document.getElementById("custom_block");
                if (!block) return;
                block.classList.toggle("hidden", !customToggle.checked);
            });
        }

        var btnAdd = document.getElementById("btn_add_custom");
        if (btnAdd) {
            btnAdd.addEventListener("click", function () {
                addCustomRow();
            });
        }
    });
})();

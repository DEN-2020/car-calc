// js/calc_all.js

(function () {
    if (!window.formatMoney) {
        window.formatMoney = function (value, decimals) {
            if (!isFinite(value)) return "-";
            var d = typeof decimals === "number" ? decimals : 2;
            return value.toLocaleString("en-US", {
                minimumFractionDigits: d,
                maximumFractionDigits: d
            });
        };
    }

    var state = {
        loan: null,
        extra: null,
        custom: null,
        afterLoan: null,
        irrYearly: null
    };

    function computeAfterLoanSummary(extraSummary, customSummary) {
        var year = 0;
        if (extraSummary && extraSummary.enabled) {
            year += extraSummary.afterLoanYear;
        }
        if (customSummary && customSummary.enabled) {
            year += customSummary.afterLoanYear;
        }
        var perYear = year;
        var perMonth = perYear / 12;
        var perDay = perYear / 365;
        return {
            perDay: perDay,
            perMonth: perMonth,
            perYear: perYear
        };
    }

    function buildLoanCardContent(loan) {
        var irrText = (loan.irrYearly != null && isFinite(loan.irrYearly))
            ? (loan.irrYearly * 100).toFixed(2) + " %"
            : "N/A";

        var html = "";
        html += "<ul class='result-list'>";
        html += "<li><strong>Monthly payment:</strong> " + formatMoney(loan.monthlyPayment) + "</li>";
        html += "<li><strong>Total interest:</strong> " + formatMoney(loan.totalInterest) + "</li>";
        html += "<li><strong>Balloon payment:</strong> " + formatMoney(loan.balloon) + "</li>";
        html += "<li><strong>Loan total (credit only):</strong> " + formatMoney(loan.loanTotalWithoutExtras) + "</li>";
        html += "<li><strong>Loan + fees + down payment (period):</strong> " + formatMoney(loan.loanPeriodTotal) + "</li>";
        html += "<li><strong>Per day (loan):</strong> " + formatMoney(loan.perDay) + "</li>";
        html += "<li><strong>Per month (loan):</strong> " + formatMoney(loan.perMonth) + "</li>";
        html += "<li><strong>Per year (loan):</strong> " + formatMoney(loan.perYear) + "</li>";
        html += "<li><strong>True annual cost (IRR):</strong> " + irrText + "</li>";
        html += "</ul>";
        return html;
    }

    function buildExtraCardContent(extra, months) {
        if (!extra.enabled) {
            return "<div>No extra costs selected.</div>";
        }
        var years = months / 12;
        var html = "";
        html += "<ul class='result-list'>";
        html += "<li><strong>Period total (extra):</strong> " + formatMoney(extra.periodTotal) + "</li>";
        html += "<li><strong>Per year (extra):</strong> " + formatMoney(extra.perYear) + "</li>";
        html += "<li><strong>Per month (extra):</strong> " + formatMoney(extra.perMonth) + "</li>";
        html += "<li><strong>Per day (extra ~):</strong> " + formatMoney(extra.perYear / 365) + "</li>";
        html += "</ul>";
        return html;
    }

    function buildCustomCardContent(custom, months) {
        if (!custom.enabled) {
            return "<div>No custom costs added.</div>";
        }

        var html = "";
        html += "<ul class='result-list'>";
        html += "<li><strong>Period total (custom):</strong> " + formatMoney(custom.periodTotal) + "</li>";
        html += "<li><strong>Per year (custom):</strong> " + formatMoney(custom.perYear) + "</li>";
        html += "<li><strong>Per month (custom):</strong> " + formatMoney(custom.perMonth) + "</li>";
        html += "<li><strong>Per day (custom ~):</strong> " + formatMoney(custom.perYear / 365) + "</li>";
        html += "</ul>";
        return html;
    }

    function buildAfterLoanCardContent(afterLoan) {
        var html = "";
        html += "<ul class='result-list'>";
        html += "<li><strong>Per day after loan:</strong> " + formatMoney(afterLoan.perDay) + "</li>";
        html += "<li><strong>Per month after loan:</strong> " + formatMoney(afterLoan.perMonth) + "</li>";
        html += "<li><strong>Per year after loan:</strong> " + formatMoney(afterLoan.perYear) + "</li>";
        html += "</ul>";
        return html;
    }

    function buildIrrCardContent(loan) {
        var irrText = (loan.irrYearly != null && isFinite(loan.irrYearly))
            ? (loan.irrYearly * 100).toFixed(2) + " %"
            : "N/A";

        var html = "";
        html += "<ul class='result-list'>";
        html += "<li><strong>True Annual Cost (IRR):</strong> " + irrText + "</li>";
        html += "<li>This is an approximate effective annual rate based on credit cashflows.</li>";
        html += "</ul>";
        return html;
    }

    function createResultCard(cardId, icon, title, contentHtml, enabled) {
        enabled = enabled !== false;
        var enabledStr = enabled ? "true" : "false";
        var toggleIcon = enabled ? "🟢" : "🔴";

        var div = document.createElement("div");
        div.className = "result-card";
        div.dataset.cardId = cardId;
        div.dataset.enabled = enabledStr;

        var header = document.createElement("div");
        header.className = "result-card-header";

        var iconSpan = document.createElement("span");
        iconSpan.className = "rc-icon";
        iconSpan.textContent = icon;

        var titleSpan = document.createElement("span");
        titleSpan.className = "rc-title";
        titleSpan.textContent = title;

        var toggleBtn = document.createElement("button");
        toggleBtn.type = "button";
        toggleBtn.className = "rc-toggle";
        toggleBtn.dataset.role = "toggle";
        toggleBtn.textContent = toggleIcon;

        header.appendChild(iconSpan);
        header.appendChild(titleSpan);
        header.appendChild(toggleBtn);

        var body = document.createElement("div");
        body.className = "result-card-body";
        body.innerHTML = contentHtml;

        div.appendChild(header);
        div.appendChild(body);

        return div;
    }

    function recalcTotal() {
        var totalSummary = document.getElementById("total_summary");
        var totalValueEl = document.getElementById("total_value");
        if (!totalSummary || !totalValueEl) return;

        var perDay = 0;
        var perMonth = 0;
        var perYear = 0;
        var periodTotal = 0;

        // Loan
        var loanCard = document.querySelector(".result-card[data-card-id='loan']");
        if (loanCard && loanCard.dataset.enabled === "true" && state.loan && state.loan.valid) {
            periodTotal += state.loan.loanPeriodTotal;
            perDay += state.loan.perDay;
            perMonth += state.loan.perMonth;
            perYear += state.loan.perYear;
        }

        // Extra
        var extraCard = document.querySelector(".result-card[data-card-id='extra']");
        if (extraCard && extraCard.dataset.enabled === "true" && state.extra && state.extra.enabled) {
            periodTotal += state.extra.periodTotal;
            perYear += state.extra.perYear;
            perMonth += state.extra.perMonth;
            perDay += state.extra.perYear / 365;
        }

        // Custom
        var customCard = document.querySelector(".result-card[data-card-id='custom']");
        if (customCard && customCard.dataset.enabled === "true" && state.custom && state.custom.enabled) {
            periodTotal += state.custom.periodTotal;
            perYear += state.custom.perYear;
            perMonth += state.custom.perMonth;
            perDay += state.custom.perYear / 365;
        }

        // After-loan – это НЕ добавляем к periodTotal, а только информативно.
        // IRR-карточка тоже не влияет на суммы.

        var html = "";
        html += "<ul class='result-list total-list'>";
        html += "<li><strong>Per day (total):</strong> " + formatMoney(perDay) + "</li>";
        html += "<li><strong>Per month (total):</strong> " + formatMoney(perMonth) + "</li>";
        html += "<li><strong>Per year (total):</strong> " + formatMoney(perYear) + "</li>";
        html += "<li><strong>For full loan period (approx):</strong> " + formatMoney(periodTotal) + "</li>";
        html += "</ul>";

        totalValueEl.innerHTML = html;
        totalSummary.classList.remove("hidden");
    }

    function mountCards(loan, extra, custom, afterLoan) {
        var container = document.getElementById("final_result");
        if (!container) return;
        container.innerHTML = "";

        // Loan
        if (loan && loan.valid) {
            container.appendChild(
                createResultCard("loan", "💸", "Loan Summary", buildLoanCardContent(loan), true)
            );
        }

        // Extra
        if (extra && extra.enabled) {
            container.appendChild(
                createResultCard("extra", "🧾", "Extra Costs", buildExtraCardContent(extra, loan.months), true)
            );
        }

        // Custom
        if (custom && custom.enabled) {
            container.appendChild(
                createResultCard("custom", "🛠", "Custom Costs", buildCustomCardContent(custom, loan.months), true)
            );
        }

        // After loan
        if (afterLoan) {
            container.appendChild(
                createResultCard("after", "⏳", "After-Loan Costs", buildAfterLoanCardContent(afterLoan), true)
            );
        }

        // IRR card
        if (loan && loan.valid) {
            container.appendChild(
                createResultCard("irr", "📊", "True Annual Cost (IRR)", buildIrrCardContent(loan), true)
            );
        }

        container.classList.remove("hidden");
        recalcTotal();
    }

    function setupCardToggle() {
        var container = document.getElementById("final_result");
        if (!container) return;

        container.addEventListener("click", function (e) {
            var target = e.target;
            if (!target || target.dataset.role !== "toggle") return;

            var card = target.closest(".result-card");
            if (!card) return;

            var id = card.dataset.cardId;
            if (id === "total") return; // на всякий

            var enabled = card.dataset.enabled === "true";

            if (enabled) {
                // отключаем
                card.dataset.enabled = "false";
                target.textContent = "🔴";
                card.classList.add("disabled");
                card.classList.add("fade-out");
                // можно полностью скрывать body
                var body = card.querySelector(".result-card-body");
                if (body) {
                    body.style.display = "none";
                }
            } else {
                // включаем
                card.dataset.enabled = "true";
                target.textContent = "🟢";
                card.classList.remove("disabled");
                card.classList.remove("fade-out");
                var body2 = card.querySelector(".result-card-body");
                if (body2) {
                    body2.style.display = "";
                }
            }

            recalcTotal();
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        var btnAll = document.getElementById("btn_calc_all");
        if (btnAll) {
            btnAll.addEventListener("click", function () {
                var loan = window.calculateLoan();
                if (!loan.valid) {
                    alert("Loan is not valid. Please check loan inputs.");
                    return;
                }
                var extra = window.getExtraSummary(loan.months);
                var custom = window.getCustomSummary(loan.months);
                var afterLoan = computeAfterLoanSummary(extra, custom);

                state.loan = loan;
                state.extra = extra;
                state.custom = custom;
                state.afterLoan = afterLoan;
                state.irrYearly = loan.irrYearly;

                mountCards(loan, extra, custom, afterLoan);
            });
        }

        setupCardToggle();
    });
})();

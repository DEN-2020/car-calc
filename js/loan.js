// js/loan.js

(function () {
    function getNumber(id) {
        var el = document.getElementById(id);
        if (!el) return 0;
        var v = parseFloat(el.value.replace(",", "."));
        return isNaN(v) ? 0 : v;
    }

    function getTermMonths() {
        var years = getNumber("loan_years");
        var months = getNumber("loan_months");
        if (months > 0) return Math.round(months);
        if (years > 0) return Math.round(years * 12);
        return 0;
    }

    // общая помощка для денег
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

    // простая NPV / IRR на месячном шаге
    function npv(rate, cashflows) {
        var sum = 0;
        for (var t = 0; t < cashflows.length; t++) {
            sum += cashflows[t] / Math.pow(1 + rate, t);
        }
        return sum;
    }

    function computeIRR(cashflows) {
        // поиск по отрезку [-0.9; 1.0] (от -90% до +100% в месяц)
        var low = -0.9;
        var high = 1.0;
        var fLow = npv(low, cashflows);
        var fHigh = npv(high, cashflows);

        if (fLow * fHigh > 0) {
            // нет смены знака, IRR не находим
            return null;
        }

        for (var i = 0; i < 60; i++) {
            var mid = (low + high) / 2;
            var fMid = npv(mid, cashflows);
            if (Math.abs(fMid) < 1e-8) {
                return mid;
            }
            if (fLow * fMid < 0) {
                high = mid;
                fHigh = fMid;
            } else {
                low = mid;
                fLow = fMid;
            }
        }
        return (low + high) / 2;
    }

    // основной расчёт кредита, доступен глобально
    window.calculateLoan = function () {
        var carPrice = getNumber("car_price");
        var downPayment = getNumber("down_payment");
        var balloon = getNumber("balloon_payment");
        var months = getTermMonths();
        var rateYear = getNumber("interest_rate");
        var loanTypeEl = document.getElementById("loan_type");
        var includeFeesEl = document.getElementById("include_fees_to_loan");

        var loanType = loanTypeEl ? loanTypeEl.value : "annuity";
        var includeFeesToLoan = includeFeesEl ? includeFeesEl.value : "no";

        var bankFee = getNumber("bank_fee");
        var dealerFee = getNumber("dealer_fee");
        var deliveryFee = getNumber("delivery_fee");
        var serviceFee = getNumber("service_fee");

        var upfrontFees = bankFee + dealerFee + deliveryFee + serviceFee;

        var errors = [];

        if (carPrice <= 0) errors.push("Car price must be greater than 0.");
        if (months <= 0) errors.push("Loan term must be set (years or months).");
        if (rateYear < 0) errors.push("Interest rate cannot be negative.");

        // базовый principal с учётом баллонного платежа
        var principal = carPrice - downPayment - balloon;
        if (includeFeesToLoan === "yes") {
            principal += upfrontFees;
        }

        if (principal <= 0) {
            errors.push("Loan principal is not positive. Check price, down payment and balloon.");
        }

        var monthRate = rateYear > 0 ? (rateYear / 100) / 12 : 0;

        var monthlyPayment = 0;
        var totalPayments = 0;
        var totalInterest = 0;

        if (errors.length === 0) {
            if (loanType === "annuity") {
                if (monthRate === 0) {
                    monthlyPayment = principal / months;
                } else {
                    var pow = Math.pow(1 + monthRate, months);
                    monthlyPayment = principal * monthRate * pow / (pow - 1);
                }
                totalPayments = monthlyPayment * months;
                totalInterest = totalPayments - principal;
            } else {
                // дифференцированный
                var principalPart = principal / months;
                var sumPayments = 0;
                var rest = principal;
                for (var k = 0; k < months; k++) {
                    var interestPart = rest * monthRate;
                    var pmt = principalPart + interestPart;
                    sumPayments += pmt;
                    rest -= principalPart;
                }
                monthlyPayment = principalPart + principal * monthRate; // первый платёж
                totalPayments = sumPayments;
                totalInterest = sumPayments - principal;
            }
        }

        // Общая стоимость кредита (Только кредитная часть)
        var loanTotalWithoutExtras = totalPayments + balloon;

        // "Loan cashflows" для IRR:
        // t0: + (carPrice - downPayment) (условно получаем "финансирование авто")
        // t0: - upfrontFees если не включены в тело
        // t1..tN-1: -monthlyPayment
        // tN: -monthlyPayment - balloon
        var cashflows = [];
        if (errors.length === 0) {
            var t0 = (carPrice - downPayment);
            if (includeFeesToLoan === "no") {
                t0 -= upfrontFees;
            }
            cashflows.push(t0);

            if (months > 0) {
                for (var i2 = 1; i2 <= months; i2++) {
                    if (i2 === months) {
                        cashflows.push(-monthlyPayment - balloon);
                    } else {
                        cashflows.push(-monthlyPayment);
                    }
                }
            }
        }

        var irrMonthly = null;
        var irrYearly = null;
        if (errors.length === 0) {
            irrMonthly = computeIRR(cashflows);
            if (irrMonthly !== null && isFinite(irrMonthly) && irrMonthly > -0.99) {
                irrYearly = Math.pow(1 + irrMonthly, 12) - 1;
            }
        }

        // Расклад по "в день / месяц / год / период"
        var periodYears = months / 12;
        var loanPeriodTotal = loanTotalWithoutExtras + (includeFeesToLoan === "no" ? upfrontFees : 0) + downPayment;
        // loanPeriodTotal = кредитные платежи + balloon + upfrontFees(если не включены) + downPayment

        var perYear = periodYears > 0 ? loanPeriodTotal / periodYears : loanTotalWithoutExtras;
        var perMonth = months > 0 ? loanPeriodTotal / months : loanPeriodTotal;
        var perDay = perYear / 365;

        return {
            valid: errors.length === 0,
            errors: errors,
            carPrice: carPrice,
            downPayment: downPayment,
            balloon: balloon,
            principal: principal,
            months: months,
            rateYear: rateYear,
            loanType: loanType,
            includeFeesToLoan: includeFeesToLoan,
            upfrontFees: upfrontFees,
            monthlyPayment: monthlyPayment,
            totalPayments: totalPayments,
            totalInterest: totalInterest,
            loanTotalWithoutExtras: loanTotalWithoutExtras,
            loanPeriodTotal: loanPeriodTotal,
            perDay: perDay,
            perMonth: perMonth,
            perYear: perYear,
            periodYears: periodYears,
            irrMonthly: irrMonthly,
            irrYearly: irrYearly
        };
    };

    function renderLoanResult(summary) {
        var box = document.getElementById("loan_result");
        if (!box) return;

        if (!summary.valid) {
            box.innerHTML = "<ul class='error-list'>" + summary.errors.map(function (e) {
                return "<li>" + e + "</li>";
            }).join("") + "</ul>";
            box.classList.remove("hidden");
            return;
        }

        var irrText = summary.irrYearly != null && isFinite(summary.irrYearly)
            ? (summary.irrYearly * 100).toFixed(2) + " %"
            : "N/A";

        var html = "";
        html += "<div class='loan-summary'>";
        html += "<div><strong>Monthly payment:</strong> " + formatMoney(summary.monthlyPayment) + "</div>";
        html += "<div><strong>Total interest:</strong> " + formatMoney(summary.totalInterest) + "</div>";
        html += "<div><strong>Balloon payment:</strong> " + formatMoney(summary.balloon) + "</div>";
        html += "<div><strong>Total loan cost (credit only):</strong> " + formatMoney(summary.loanTotalWithoutExtras) + "</div>";
        html += "<div><strong>Loan + fees + down payment (period):</strong> " + formatMoney(summary.loanPeriodTotal) + "</div>";
        html += "<div><strong>True annual cost (IRR):</strong> " + irrText + "</div>";
        html += "</div>";

        box.innerHTML = html;
        box.classList.remove("hidden");
    }

    document.addEventListener("DOMContentLoaded", function () {
        var btn = document.getElementById("btn_calc_loan");
        if (btn) {
            btn.addEventListener("click", function () {
                var summary = window.calculateLoan();
                renderLoanResult(summary);
            });
        }
    });
})();

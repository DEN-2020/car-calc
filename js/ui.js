// THEME --------------------------------------
document.addEventListener("DOMContentLoaded", () => {

    const html = document.documentElement;
    const themeBtn = document.getElementById("theme_toggle");

    // Load theme
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
        html.setAttribute("data-theme", savedTheme);
        themeBtn.textContent = savedTheme === "dark" ? "🌙" : "☀️";
    }

    themeBtn.addEventListener("click", () => {
        const current = html.getAttribute("data-theme");
        const next = current === "dark" ? "light" : "dark";

        html.setAttribute("data-theme", next);
        localStorage.setItem("theme", next);

        themeBtn.textContent = next === "dark" ? "🌙" : "☀️";
    });

    // FOOTER YEAR
    const yearEl = document.getElementById("footer_year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

});

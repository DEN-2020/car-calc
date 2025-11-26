document.addEventListener("DOMContentLoaded", () => {
    const html = document.documentElement;
    const themeBtn = document.getElementById("theme_toggle");

    // 1) Check saved user preference
    const savedTheme = localStorage.getItem("theme");

    // 2) Check system preference
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const systemTheme = systemDark ? "dark" : "light";

    // Apply theme logic with user priority
    let activeTheme;

    if (savedTheme) {
        // User-selected theme overrides system
        activeTheme = savedTheme;
    } else {
        // No user preference → follow system
        activeTheme = systemTheme;
    }

    html.setAttribute("data-theme", activeTheme);
    themeBtn.textContent = activeTheme === "dark" ? "🌙" : "☀️";

    // 3) Toggle theme manually
    themeBtn.addEventListener("click", () => {
        const current = html.getAttribute("data-theme");
        const next = current === "dark" ? "light" : "dark";

        html.setAttribute("data-theme", next);
        localStorage.setItem("theme", next);
        themeBtn.textContent = next === "dark" ? "🌙" : "☀️";
    });

    // 4) React to system theme changes (only if user did NOT override)
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
        const userPref = localStorage.getItem("theme");
        if (userPref) return; // user manually selected → don't override

        const newSystemTheme = e.matches ? "dark" : "light";
        html.setAttribute("data-theme", newSystemTheme);
        themeBtn.textContent = newSystemTheme === "dark" ? "🌙" : "☀️";
    });

    // 5) Footer year
    const yearEl = document.getElementById("footer_year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
});

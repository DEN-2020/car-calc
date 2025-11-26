// LANGUAGE SWITCHER -----------------------------
let currentLang = "en";

async function loadLang(lang) {
    const res = await fetch(`lang/${lang}.json`);
    const dict = await res.json();

    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.dataset.i18n;
        if (dict[key]) el.textContent = dict[key];
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const langSel = document.getElementById("lang_select");

    loadLang("en");

    langSel.addEventListener("change", () => {
        currentLang = langSel.value;
        loadLang(currentLang);
        localStorage.setItem("lang", currentLang);
    });

    // restore language
    const saved = localStorage.getItem("lang");
    if (saved) {
        langSel.value = saved;
        loadLang(saved);
    }
});

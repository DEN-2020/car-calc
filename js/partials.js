document.addEventListener("DOMContentLoaded", () => {
    const includeTargets = document.querySelectorAll("[include-html]");

    includeTargets.forEach(async (el) => {
        const file = el.getAttribute("include-html");
        if (!file) return;

        try {
            const res = await fetch(file + "?v=" + Date.now()); // без кеша
            if (!res.ok) throw new Error(`File not found: ${file}`);

            const html = await res.text();
            el.innerHTML = html;
        } catch (err) {
            el.innerHTML = `<div style="color:red;">Error loading ${file}</div>`;
        }
    });
});

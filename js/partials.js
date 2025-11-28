document.addEventListener("DOMContentLoaded", () => {
    const elements = document.querySelectorAll("[include-html]");
    elements.forEach(async (el) => {
        const file = el.getAttribute("include-html");
        try {
            const resp = await fetch(file + "?v=" + Date.now());
            if (!resp.ok) throw new Error("File not found");
            const html = await resp.text();
            el.innerHTML = html;
        } catch (e) {
            el.innerHTML = `<div style="color:red">Include error: ${file}</div>`;
        }
        el.removeAttribute("include-html");
    });
});

let newWorker;

// Track update events
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.addEventListener("controllerchange", () => {
        window.location.reload();
    });

    navigator.serviceWorker.getRegistration().then(reg => {
        if (!reg) return;

        reg.addEventListener("updatefound", () => {
            newWorker = reg.installing;

            newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                    showUpdateBanner();
                }
            });
        });
    });
}

// Show update UI
function showUpdateBanner() {
    const banner = document.createElement("div");
    banner.className = "update-banner";
    banner.innerHTML = `
        New version available
        <button id="update_btn">Reload</button>
    `;
    document.body.appendChild(banner);

    document.getElementById("update_btn").onclick = () => {
        newWorker.postMessage("SKIP_WAITING");
    };
}

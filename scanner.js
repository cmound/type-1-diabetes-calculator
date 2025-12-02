/* ============================================================
   scanner.js
   Handles all barcode scanning for desktop + iPhone
   Uses QuaggaJS (desktop) and ZXing fallback (iOS)
   Emits a custom event "barcodeDetected" with the UPC code
=============================================================== */

/* ------------------------------------------------------------
   Load ZXing reader (used for iPhone Safari)
-------------------------------------------------------------*/
const ZXingReader = window.ZXing ? new ZXing.BrowserBarcodeReader() : null;

/* ------------------------------------------------------------
   QuaggaJS configuration (Desktop Webcams)
-------------------------------------------------------------*/
const quaggaConfig = {
    inputStream: {
        name: "Live",
        type: "LiveStream",
        constraints: {
            facingMode: "environment"
        }
    },
    decoder: {
        readers: ["ean_reader", "upc_reader", "upc_e_reader"]
    }
};

/* ------------------------------------------------------------
   Start QuaggaJS scanner (Desktop)
-------------------------------------------------------------*/
function startQuagga() {
    return new Promise((resolve, reject) => {
        if (!window.Quagga) {
            reject("QuaggaJS library not loaded.");
            return;
        }

        window.Quagga.init(quaggaConfig, err => {
            if (err) {
                reject(err);
                return;
            }
            window.Quagga.start();
            resolve();
        });

        window.Quagga.onDetected(result => {
            if (!result || !result.codeResult) return;

            const code = result.codeResult.code;

            stopQuagga();

            // Dispatch event for app.js
            document.dispatchEvent(new CustomEvent("barcodeDetected", { detail: code }));
        });
    });
}

function stopQuagga() {
    if (window.Quagga) {
        try { window.Quagga.stop(); } catch (e) {}
    }
}

/* ------------------------------------------------------------
   ZXing Fallback Scanner (iPhone)
-------------------------------------------------------------*/
async function startZXingVideoScan() {
    if (!ZXingReader) {
        alert("ZXing library not available.");
        return;
    }

    const videoElement = document.createElement("video");
    videoElement.setAttribute("playsinline", true);
    videoElement.style.width = "100%";
    videoElement.style.border = "3px solid #000";

    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.top = "0";
    container.style.left = "0";
    container.style.width = "100vw";
    container.style.height = "100vh";
    container.style.background = "rgba(0,0,0,0.85)";
    container.style.zIndex = "9999";
    container.style.padding = "20px";
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.justifyContent = "center";
    container.appendChild(videoElement);

    const closeBtn = document.createElement("button");
    closeBtn.innerText = "Cancel Scan";
    closeBtn.style.marginTop = "20px";
    closeBtn.style.padding = "10px";
    closeBtn.style.fontSize = "20px";
    closeBtn.addEventListener("click", () => {
        ZXingReader.reset();
        container.remove();
    });
    container.appendChild(closeBtn);

    document.body.appendChild(container);

    try {
        const controls = await ZXingReader.decodeFromVideoDevice(
            undefined,
            videoElement,
            (result, err) => {
                if (result) {
                    const code = result.text;
                    ZXingReader.reset();
                    container.remove();

                    document.dispatchEvent(
                        new CustomEvent("barcodeDetected", { detail: code })
                    );
                }
            }
        );
    } catch (e) {
        alert("Unable to access camera.");
        container.remove();
    }
}

/* ------------------------------------------------------------
   Decide which scanner to use
-------------------------------------------------------------*/
function deviceIsIOS() {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/* ------------------------------------------------------------
   PUBLIC FUNCTION: startBarcodeScan()
   Called from app.js when the user presses "Scan Barcode"
-------------------------------------------------------------*/
window.startBarcodeScan = async function () {
    if (deviceIsIOS()) {
        // iPhone camera cannot run Quagga
        startZXingVideoScan();
    } else {
        try {
            await startQuagga();
        } catch (err) {
            alert("Camera error: " + err);
        }
    }
};

/* ------------------------------------------------------------
   Cleanup on navigation
-------------------------------------------------------------*/
window.addEventListener("beforeunload", stopQuagga);

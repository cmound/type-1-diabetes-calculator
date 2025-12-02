/* ============================================================
   BARCODE SCANNER MODULE
   Handles barcode reading using ZXing (iOS-safe) and Quagga
   Dispatches custom "barcodeDetected" event when a barcode is found
============================================================ */

/* ------------------------------------------------------------
   Detect whether device is iOS (iPhone / iPad)
------------------------------------------------------------ */
function deviceIsIOS() {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/* ------------------------------------------------------------
   ZXing SCANNER (iOS Primary)
------------------------------------------------------------ */

async function startZXingVideoScan() {
    try {
        const codeReader = new ZXing.BrowserMultiFormatReader();
        const previewElem = document.createElement("video");
        previewElem.setAttribute("playsinline", true);
        previewElem.style.width = "100%";
        previewElem.style.maxWidth = "480px";
        previewElem.style.display = "block";
        previewElem.style.margin = "15px auto";

        const container = document.createElement("div");
        container.style.textAlign = "center";
        container.appendChild(previewElem);
        document.body.appendChild(container);

        const videoInputDevices = await codeReader.listVideoInputDevices();
        const selectedDeviceId = videoInputDevices[0].deviceId;

        await codeReader.decodeFromVideoDevice(
            selectedDeviceId,
            previewElem,
            (result, err) => {
                if (result) {
                    const code = result.getText();
                    cleanupScannerUI();
                    codeReader.reset();

                    document.dispatchEvent(
                        new CustomEvent("barcodeDetected", { detail: code })
                    );
                }
            }
        );
    } catch (e) {
        alert("Unable to access camera for barcode scanning.");
        cleanupScannerUI();
    }
}

/* ------------------------------------------------------------
   QuaggaJS SCANNER (Desktop Primary)
------------------------------------------------------------ */

function startQuagga() {
    return new Promise((resolve, reject) => {
        if (!window.Quagga) return reject("Quagga not loaded.");

        Quagga.init(
            {
                inputStream: {
                    name: "Live",
                    type: "LiveStream",
                    target: document.body,
                },
                decoder: {
                    readers: ["ean_reader", "upc_reader", "code_128_reader"],
                },
            },
            err => {
                if (err) return reject(err);
                Quagga.start();
                resolve();
            }
        );

        Quagga.onDetected(data => {
            const code = data.codeResult.code;
            Quagga.stop();
            cleanupScannerUI();

            document.dispatchEvent(
                new CustomEvent("barcodeDetected", { detail: code })
            );
        });
    });
}

/* ------------------------------------------------------------
   Cleanup scanner overlay / video UI
------------------------------------------------------------ */

function cleanupScannerUI() {
    const videos = document.querySelectorAll("video");
    videos.forEach(v => v.remove());

    const overlays = document.querySelectorAll(".scanner-overlay");
    overlays.forEach(o => o.remove());
}

/* ------------------------------------------------------------
   PUBLIC FUNCTION startBarcodeScan()
   Called from your index.html button
------------------------------------------------------------ */

window.startBarcodeScan = async function () {
    cleanupScannerUI();

    // Camera Overlay
    const overlay = document.createElement("div");
    overlay.className = "scanner-overlay";
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.background = "rgba(0,0,0,0.75)";
    overlay.style.zIndex = "9999";
    overlay.style.display = "flex";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";
    overlay.style.color = "#fff";
    overlay.style.fontSize = "20px";
    overlay.innerHTML = "<div>Initializing camera…</div>";
    document.body.appendChild(overlay);

    // Decide whether to use ZXing or Quagga
    try {
        if (deviceIsIOS()) {
            await startZXingVideoScan();
        } else {
            await startQuagga();
        }
    } catch (err) {
        alert("Camera error: " + err);
        cleanupScannerUI();
    }
};

/* ------------------------------------------------------------
   Stop scanner when user navigates away
------------------------------------------------------------ */

window.addEventListener("beforeunload", () => {
    cleanupScannerUI();
});

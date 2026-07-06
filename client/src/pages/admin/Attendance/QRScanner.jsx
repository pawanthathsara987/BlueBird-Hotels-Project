import { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function QRScanner({ onScanSuccess }) {
    const scannerRef = useRef(null);
    const isProcessing = useRef(false);

    useEffect(() => {
        let isMounted = true;
        let html5QrCode = null;

        const startScanner = async () => {
            try {
                // Ensure the container is empty before initializing to avoid duplicate elements
                const container = document.getElementById("qr-reader");
                if (container) {
                    container.innerHTML = "";
                }

                html5QrCode = new Html5Qrcode("qr-reader");
                scannerRef.current = html5QrCode;

                const config = {
                    fps: 10,
                    qrbox: {
                        width: 250,
                        height: 250,
                    },
                };

                if (!isMounted) return;

                await html5QrCode.start(
                    { facingMode: "environment" },
                    config,
                    async (decodedText) => {
                        // Ignore if we're already processing a scan
                        if (isProcessing.current) return;

                        isProcessing.current = true;

                        try {
                            await onScanSuccess(decodedText);
                        } finally {
                            // Allow another scan after 3 seconds
                            setTimeout(() => {
                                isProcessing.current = false;
                            }, 3000);
                        }
                    },
                    () => {}
                );

                // If the component unmounted while the scanner was starting, stop it immediately
                if (!isMounted) {
                    await html5QrCode.stop();
                    html5QrCode.clear();
                }
            } catch (err) {
                console.error("Camera Error:", err);
            }
        };

        startScanner();

        return () => {
            isMounted = false;
            if (html5QrCode) {
                if (html5QrCode.isScanning) {
                    html5QrCode
                        .stop()
                        .then(() => html5QrCode.clear())
                        .catch(console.error);
                }
            }
        };
    }, []);

    return (
        <div
            id="qr-reader"
            className="w-full rounded-lg overflow-hidden"
        />
    );
}
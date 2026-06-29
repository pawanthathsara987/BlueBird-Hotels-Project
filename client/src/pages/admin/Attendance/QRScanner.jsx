import { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function QRScanner({ onScanSuccess }) {
    const scannerRef = useRef(null);
    const isProcessing = useRef(false);

    useEffect(() => {
        const html5QrCode = new Html5Qrcode("qr-reader");

        scannerRef.current = html5QrCode;

        const config = {
            fps: 10,
            qrbox: {
                width: 250,
                height: 250,
            },
        };

        html5QrCode
            .start(
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
            )
            .catch((err) => {
                console.error("Camera Error:", err);
            });

        return () => {
            if (
                scannerRef.current &&
                scannerRef.current.isScanning
            ) {
                scannerRef.current
                    .stop()
                    .then(() => scannerRef.current.clear())
                    .catch(console.error);
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
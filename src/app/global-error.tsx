"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
    error, // eslint-disable-line @typescript-eslint/no-unused-vars
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html lang="en">
            <body className="bg-[#F5F5F5] font-sans">
                <div className="min-h-screen flex items-center justify-center p-4">
                    <div className="text-center max-w-md">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-8 h-8 text-[#E30613]" />
                        </div>
                        <h2 className="text-2xl font-bold text-[#002147] mb-3">
                            Application Error
                        </h2>
                        <p className="text-[#666666] mb-6">
                            A critical error occurred. Please refresh the page.
                        </p>
                        <button
                            onClick={reset}
                            className="inline-flex items-center gap-2 bg-[#E30613] text-white px-6 py-3 rounded font-semibold hover:bg-[#c20510] transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Refresh Page
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}

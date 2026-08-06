import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Letter Tracing — Learn the Alphabet",
  description: "A beautiful children's educational game for learning to trace the alphabet.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Letter Tracing",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="h-full overflow-hidden bg-[#F0E8FF] font-rounded antialiased">
        <main className="flex h-full items-center justify-center bg-[#E8DCFF]">
          {/* Game container — phone-sized frame on desktop, full screen on mobile */}
          <div
            className="relative overflow-hidden bg-white shadow-2xl"
            style={{
              width: "min(100vw, 420px)",
              height: "min(100vh, 896px)",
              borderRadius: "clamp(0px, calc((100vw - 420px) * 99), 32px)",
            }}
          >
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}

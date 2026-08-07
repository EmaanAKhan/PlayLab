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
        {/* Game container — fills the entire viewport on every device */}
        <main className="relative h-full w-full overflow-hidden bg-white">
          {children}
        </main>
      </body>
    </html>
  );
}

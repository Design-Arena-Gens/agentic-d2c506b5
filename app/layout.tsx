import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Mind Map Generator",
  description: "Convert PDFs to interactive mind maps with AI-powered medical accuracy verification",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}

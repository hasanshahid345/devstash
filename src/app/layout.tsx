import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DevStash",
  description: "A centralized developer knowledge hub.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}

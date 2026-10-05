import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Space World",
  description: "A cinematic journey through space",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
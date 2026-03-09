import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Soviron — AI Voice Cloning",
  description: "Clone any voice with a short audio sample. Generate natural, expressive speech in seconds. Professional quality, at a fraction of the cost.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Soviron — AI Text to Speech & Voice Cloning for Indian Languages",
  description: "Generate natural AI voices in Hindi, Tamil, Telugu, and more. Clone any voice in seconds. Free to start — no credit card required.",
  keywords: "text to speech India, Hindi TTS, voice cloning India, AI voice generator, Indian languages TTS, Hindi text to speech",
  metadataBase: new URL("https://www.soviron.tech"),
  openGraph: {
    title: "Soviron — AI Text to Speech & Voice Cloning",
    description: "Generate natural AI voices in Hindi, Tamil, Telugu, and more. Clone any voice in seconds.",
    url: "https://www.soviron.tech",
    siteName: "Soviron",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Soviron — AI Text to Speech & Voice Cloning",
    description: "Generate natural AI voices in Hindi, Tamil, Telugu, and more.",
  },
  alternates: {
    canonical: "https://www.soviron.tech",
  },
  icons: {
    icon: "/favicon.png",
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

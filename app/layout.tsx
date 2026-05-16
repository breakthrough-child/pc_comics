import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import ComicBackground from "./components/ComicBackground";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Premium Comics Platform",
  description: "Discover and read amazing premium comics",

  openGraph: {
    title: "Premium Comics Platform",
    description: "Enjoy premium comics from top creators",
    url: "https://yourdomain.com",
    siteName: "Comics",
    images: [
      {
        url: "/preview-banner.png", // add this image in /public
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Premium Comics Platform",
    description: "Enjoy premium comics",
    images: ["/preview-banner.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      data-theme="light"
    >
     {/* <body className="min-h-full flex flex-col">*/}
     <body className="min-h-full flex flex-col">
  <ComicBackground />

  <div style={{ position: "relative", zIndex: 10 }}>
    <Navbar />
    {children}
  </div>
</body>
    </html>
  );
}

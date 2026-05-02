import type { Metadata } from "next";
import { EB_Garamond } from "next/font/google";
import "./globals.css";

const garamond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-garamond",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Book-Cast",
  description:
    "A real-time literary broadcast. Watch a classic novel unfold, one word at a time, synchronized for everyone.",
  openGraph: {
    title: "Book-Cast",
    description:
      "A real-time literary broadcast. The Strange Case of Dr. Jekyll and Mr. Hyde, streaming live.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${garamond.variable} h-full antialiased`}>
      <body
        className="min-h-full flex flex-col"
        style={{ fontFamily: "var(--font-garamond), serif" }}
      >
        {children}
      </body>
    </html>
  );
}

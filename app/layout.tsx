import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Loader from "./components/Loader";
import { CartProvider } from "./context/CartContext";
import CartDrawer from "./components/CartDrawer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vamsi Crackers",
  description: "Crackers shop website",
  icons: {
    icon: "/assets/images/vamsi_crackers_logo.png", // favicon
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black`}
      >
        {/* Loading animation */}
        <Loader />

        {/* Main Application */}
        <CartProvider>
          <CartDrawer />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}

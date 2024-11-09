import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster"
import { Recursive } from "next/font/google";

const recursive = Recursive({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AWTTHN Voting Platform",
  description: "Association of Women Traditional Title Holders in Nigeria",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={` ${recursive.className}`}
        >
        {children}
        <Toaster />
      </body>
    </html>
  );
}

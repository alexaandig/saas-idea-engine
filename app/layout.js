import { Syne, DM_Mono } from "next/font/google";

const syne = Syne({ subsets: ["latin"], variable: "--font-syne" });
const dmMono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-dm-mono" });

export const metadata = {
  title: "Saas Idea Engine",
  description: "7-STEP AI FRAMEWORK + TOOLKIT",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${syne.variable} ${dmMono.variable}`}>{children}</body>
    </html>
  );
}

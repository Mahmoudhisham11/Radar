import "./globals.css";
import { Tajawal } from "next/font/google";
import AppShell from "@/components/layout/AppShell/AppShell";

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700", "800", "900"],
  variable: "--font-tajawal",
  display: "swap",
});

export const metadata = {
  title: "رادار — نظام ذكاء التسويق والنمو",
  description: "نظام شخصي مدعوم بالذكاء الاصطناعي لمراقبة التسويق وإدارة النمو",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" className={tajawal.variable}>
      <body className={tajawal.className}>
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}

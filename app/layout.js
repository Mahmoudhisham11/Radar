import "./globals.css";
import AppShell from "@/components/layout/AppShell/AppShell";

export const metadata = {
  title: "RADAR — AI Marketing Intelligence",
  description: "Personal AI-powered Marketing Intelligence and Growth Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}

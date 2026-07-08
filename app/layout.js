import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

export const metadata = {
  title: "Product Manager's CoPilot",
  description:
    "Your consulting co-pilot: 21 skills that turn a PM's query into a client-ready deliverable.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}

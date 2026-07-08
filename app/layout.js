import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

export const metadata = {
  title: "PM Consultant Skills",
  description:
    "21 consulting skills for product managers — pick a skill, drop your query, get a client-ready answer.",
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

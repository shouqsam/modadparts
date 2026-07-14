import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap"
});

export const metadata = {
  title: "سلماكس قطع غيار التجارة | قطع غيار السيارات",
  description:
    "متجر سلماكس قطع غيار التجارة في الرياض - نيسان، إنفينيتي، رينو. استفسار وطلب مباشر عبر واتساب، وتوصيل لجميع مناطق المملكة."
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.variable} font-cairo`}>{children}</body>
    </html>
  );
}

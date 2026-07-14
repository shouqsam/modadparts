import { Cairo } from "next/font/google";
import "./globals.css";
import {
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  getSiteUrl
} from "../lib/site";
import { WHATSAPP_NUMBER } from "../lib/whatsapp";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap"
});

const siteUrl = getSiteUrl();

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${SITE_NAME} | قطع غيار سيارات أصلية في الرياض`,
    template: `%s | ${SITE_NAME}`
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: {
    canonical: "/"
  },
  openGraph: {
    type: "website",
    locale: "ar_SA",
    url: siteUrl,
    siteName: SITE_NAME,
    title: `${SITE_NAME} | قطع غيار سيارات أصلية في الرياض`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: SITE_NAME
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | قطع غيار سيارات أصلية في الرياض`,
    description: SITE_DESCRIPTION,
    images: ["/logo.png"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png"
  }
};

function buildLocalBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "AutoPartsStore",
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: siteUrl,
    image: `${siteUrl}/logo.png`,
    telephone: `+${WHATSAPP_NUMBER}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "الرياض",
      addressRegion: "الرياض",
      addressCountry: "SA"
    },
    areaServed: {
      "@type": "Country",
      name: "Saudi Arabia"
    },
    currenciesAccepted: "SAR",
    paymentAccepted: "Cash, Bank Transfer",
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ],
      opens: "00:00",
      closes: "23:59"
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: `+${WHATSAPP_NUMBER}`,
      contactType: "customer service",
      availableLanguage: ["Arabic"],
      areaServed: "SA"
    },
    sameAs: [`https://wa.me/${WHATSAPP_NUMBER}`],
    knowsAbout: [
      "قطع غيار سيارات",
      "قطع غيار نيسان",
      "قطع غيار إنفينيتي",
      "قطع غيار رينو"
    ]
  };
}

export default function RootLayout({ children }) {
  const jsonLd = buildLocalBusinessJsonLd();

  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.variable} font-cairo`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}

export const SITE_NAME = "مدد قطع غيار التجارة";
export const SITE_SHORT_NAME = "مدد";

export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
  if (configured) return configured.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  return "http://localhost:3000";
}

export const SITE_DESCRIPTION =
  "مدد قطع غيار التجارة في الرياض — متجر قطع غيار سيارات أصلية لنيسان وإنفينيتي ورينو. اطلب عبر واتساب مع توصيل سريع لجميع مناطق المملكة.";

export const SITE_KEYWORDS = [
  "قطع غيار سيارات",
  "قطع غيار السيارات",
  "قطع غيار أصلية",
  "قطع غيار نيسان",
  "قطع غيار إنفينيتي",
  "قطع غيار رينو",
  "قطع غيار الرياض",
  "مدد قطع غيار التجارة",
  "متجر قطع غيار"
];

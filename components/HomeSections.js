"use client";

import { buildWhatsappLink, GENERAL_INQUIRY_MESSAGE } from "../lib/whatsapp";

const FEATURES = [
  {
    num: "01",
    title: "خدمة 24 ساعة",
    desc: "فريقنا جاهز للرد على استفساراتك في أي وقت",
    icon: ClockIcon
  },
  {
    num: "02",
    title: "سرعة الشحن",
    desc: "من الرياض — توصيل لجميع مناطق المملكة خلال 12 ساعة إلى يوم واحد",
    icon: TruckIcon
  },
  {
    num: "03",
    title: "أمان الدفع",
    desc: "معاملات آمنة وموثوقة مع كل طلب",
    icon: ShieldIcon
  },
  {
    num: "04",
    title: "قطع غيار أصلية",
    desc: "نضمن جودة وأصالة جميع القطع المعروضة",
    icon: BoxIcon
  }
];

const BRANDS = [
  { name: "Infiniti", logo: "/infiniti.png" },
  { name: "Nissan", logo: "/nissan.png" },
  { name: "Renault", logo: "/Renault.png" }
];

export default function HomeSections() {
  const contactLink = buildWhatsappLink(GENERAL_INQUIRY_MESSAGE);

  return (
    <div className="flex flex-col gap-10 md:gap-14">
      {/* لماذا مدد؟ */}
      <section className="text-center">
        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">لماذا تختار مدد لقطع غيار السيارات؟</h2>
        <p className="mt-2 text-gray-500 text-sm md:text-base">
          نوفر قطع غيار سيارات أصلية في الرياض مع تجربة شراء موثوقة وسريعة
        </p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {FEATURES.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.num}
                className="relative bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] border-t-[3px] border-brand px-5 pt-8 pb-7 text-center hover:shadow-[0_12px_36px_rgba(0,0,0,0.1)] transition-shadow"
              >
                <span className="absolute top-3 right-4 text-4xl font-extrabold text-gray-100 select-none leading-none">
                  {item.num}
                </span>
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center text-brand">
                  <Icon />
                </div>
                <h3 className="font-extrabold text-gray-900 text-lg">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </article>
            );
          })}
        </div>
      </section>

      {/* الماركات */}
      <section className="bg-white rounded-[1.75rem] shadow-[0_8px_30px_rgba(0,0,0,0.06)] px-5 py-10 md:px-10 md:py-12">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">الماركات التي نخدمها</h2>
          <p className="mt-2 text-gray-500 text-sm md:text-base">
            قطع غيار أصلية لأشهر العلامات في المنطقة
          </p>
        </div>

        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 max-w-3xl mx-auto">
          {BRANDS.map((brand) => (
            <div
              key={brand.name}
              className="bg-[#f3f4f6] rounded-2xl h-28 md:h-32 flex flex-col items-center justify-center gap-2 px-4"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={brand.logo}
                alt={brand.name}
                className="h-12 md:h-14 w-auto max-w-[140px] object-contain"
              />
              <span className="text-[11px] text-gray-400 font-medium">{brand.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-l from-[#1a0a10] via-[#12090c] to-[#0c0c0e] text-white px-6 py-8 md:px-10 md:py-10">
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-1/2 opacity-70"
          style={{
            background:
              "radial-gradient(ellipse at 80% 50%, rgba(155,35,66,0.55) 0%, transparent 65%)"
          }}
        />

        <div className="relative flex flex-col lg:flex-row lg:items-center gap-8 lg:gap-6">
          <div className="flex-1 text-center lg:text-right">
            <h2 className="text-2xl md:text-3xl font-extrabold">جاهزون لمساعدتك</h2>
            <p className="mt-2 text-white/65 text-sm md:text-base max-w-xl mx-auto lg:mx-0 lg:mr-0">
              ابحث عن القطعة أو تواصل مع فريقنا — نحن هنا من أجلك.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <a
                href="#products"
                className="inline-flex items-center gap-2 bg-brand hover:brightness-110 text-white font-bold px-5 py-3 rounded-xl transition"
              >
                <SearchIcon />
                تسوق الآن
              </a>
              <a
                href={contactLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-white/70 hover:bg-white/10 text-white font-bold px-5 py-3 rounded-xl transition"
              >
                <MailIcon />
                اتصل بنا
              </a>
            </div>
          </div>

          <div className="flex items-center justify-center lg:justify-end gap-3 lg:min-w-[240px]">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand/20 text-brand-accent">
              <HeadsetIcon />
            </div>
            <p className="text-sm md:text-base font-semibold text-white/90 leading-snug max-w-[11rem] text-right">
              متواجدون لخدمتكم على مدار الساعة
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function ClockIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M1 7h11v10H1zM12 10h4l3 3v4h-7V10z" strokeLinejoin="round" />
      <circle cx="5.5" cy="18.5" r="1.5" />
      <circle cx="16.5" cy="18.5" r="1.5" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M12 3l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3z" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BoxIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M3 8l9-4 9 4-9 4-9-4z" strokeLinejoin="round" />
      <path d="M3 8v8l9 4 9-4V8M12 12v8" strokeLinejoin="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 7 9-7" strokeLinejoin="round" />
    </svg>
  );
}

function HeadsetIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M4 12a8 8 0 0 1 16 0" strokeLinecap="round" />
      <path d="M4 12v4a2 2 0 0 0 2 2h1v-6H6a2 2 0 0 0-2 2zM20 12v4a2 2 0 0 1-2 2h-1v-6h1a2 2 0 0 1 2 2z" strokeLinejoin="round" />
      <path d="M14 19h-2a2 2 0 0 0 0 4h1" strokeLinecap="round" />
    </svg>
  );
}

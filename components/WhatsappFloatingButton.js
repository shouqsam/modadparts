"use client";

import { buildWhatsappLink, GENERAL_INQUIRY_MESSAGE } from "../lib/whatsapp";

export default function WhatsappFloatingButton() {
  const link = buildWhatsappLink(GENERAL_INQUIRY_MESSAGE);
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 left-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-white shadow-lg hover:scale-105 transition-transform"
      aria-label="تواصل معنا عبر الواتساب"
    >
      <svg viewBox="0 0 32 32" width="28" height="28" fill="currentColor" aria-hidden="true">
        <path d="M16.004 3C9.377 3 4 8.373 4 15c0 2.34.66 4.523 1.804 6.383L4 29l7.79-1.767A11.94 11.94 0 0 0 16.004 27C22.63 27 28 21.627 28 15S22.63 3 16.004 3Zm0 21.7c-1.98 0-3.822-.55-5.396-1.5l-.386-.23-4.62 1.048 1.03-4.5-.252-.4A9.63 9.63 0 0 1 5.3 15c0-5.9 4.8-10.7 10.704-10.7 5.9 0 10.7 4.8 10.7 10.7s-4.8 10.7-10.7 10.7Zm5.87-8.02c-.32-.16-1.9-.94-2.196-1.05-.294-.107-.508-.16-.722.16-.213.32-.827 1.05-1.014 1.265-.187.213-.373.24-.693.08-.32-.16-1.35-.497-2.573-1.586-.95-.847-1.593-1.894-1.78-2.214-.187-.32-.02-.493.14-.653.144-.144.32-.373.48-.56.16-.187.213-.32.32-.533.107-.213.053-.4-.027-.56-.08-.16-.72-1.734-.986-2.374-.26-.626-.523-.54-.72-.55l-.613-.01c-.213 0-.56.08-.853.4-.293.32-1.12 1.094-1.12 2.667 0 1.573 1.147 3.094 1.307 3.307.16.213 2.257 3.445 5.467 4.83.764.33 1.36.527 1.826.674.767.244 1.466.21 2.018.127.616-.092 1.9-.777 2.167-1.527.267-.75.267-1.393.187-1.527-.08-.133-.293-.213-.613-.373Z" />
      </svg>
    </a>
  );
}

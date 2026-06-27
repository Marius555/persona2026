/**
 * Best-effort BCP-47 locale for a visitor, inferred from their *physical region* rather
 * than their browser's UI language. A creator in Lithuania running an English-language
 * Chrome still expects Lithuanian date formatting (YYYY-MM-DD), while a visitor in the US
 * expects MM/DD/YYYY — but `navigator.language` only reports the browser menu language, so
 * it returns `en-US` for both. The IANA time zone tracks the operating system's region
 * (independent of the browser language), so we map it to a locale first, then fall back to
 * the browser language, then `en-US`.
 *
 * The map is intentionally curated (not exhaustive): it covers commonly populated zones,
 * and anything unmapped degrades gracefully to the browser language.
 */
const TIMEZONE_LOCALE: Record<string, string> = {
  // --- Europe ---
  "Europe/Vilnius": "lt-LT",
  "Europe/Riga": "lv-LV",
  "Europe/Tallinn": "et-EE",
  "Europe/Warsaw": "pl-PL",
  "Europe/Berlin": "de-DE",
  "Europe/Vienna": "de-AT",
  "Europe/Zurich": "de-CH",
  "Europe/Paris": "fr-FR",
  "Europe/Brussels": "fr-BE",
  "Europe/Madrid": "es-ES",
  "Europe/Lisbon": "pt-PT",
  "Europe/Rome": "it-IT",
  "Europe/Amsterdam": "nl-NL",
  "Europe/London": "en-GB",
  "Europe/Dublin": "en-IE",
  "Europe/Stockholm": "sv-SE",
  "Europe/Oslo": "nb-NO",
  "Europe/Copenhagen": "da-DK",
  "Europe/Helsinki": "fi-FI",
  "Europe/Prague": "cs-CZ",
  "Europe/Bratislava": "sk-SK",
  "Europe/Budapest": "hu-HU",
  "Europe/Bucharest": "ro-RO",
  "Europe/Sofia": "bg-BG",
  "Europe/Athens": "el-GR",
  "Europe/Kyiv": "uk-UA",
  "Europe/Kiev": "uk-UA",
  "Europe/Moscow": "ru-RU",
  "Europe/Istanbul": "tr-TR",
  "Europe/Zagreb": "hr-HR",
  "Europe/Belgrade": "sr-RS",
  "Europe/Ljubljana": "sl-SI",
  // --- Americas ---
  "America/New_York": "en-US",
  "America/Detroit": "en-US",
  "America/Chicago": "en-US",
  "America/Denver": "en-US",
  "America/Phoenix": "en-US",
  "America/Los_Angeles": "en-US",
  "America/Anchorage": "en-US",
  "Pacific/Honolulu": "en-US",
  "America/Toronto": "en-CA",
  "America/Vancouver": "en-CA",
  "America/Edmonton": "en-CA",
  "America/Winnipeg": "en-CA",
  "America/Halifax": "en-CA",
  "America/Mexico_City": "es-MX",
  "America/Sao_Paulo": "pt-BR",
  "America/Argentina/Buenos_Aires": "es-AR",
  "America/Bogota": "es-CO",
  "America/Santiago": "es-CL",
  "America/Lima": "es-PE",
  // --- Asia / Middle East ---
  "Asia/Tokyo": "ja-JP",
  "Asia/Shanghai": "zh-CN",
  "Asia/Hong_Kong": "zh-HK",
  "Asia/Taipei": "zh-TW",
  "Asia/Seoul": "ko-KR",
  "Asia/Kolkata": "en-IN",
  "Asia/Singapore": "en-SG",
  "Asia/Bangkok": "th-TH",
  "Asia/Jakarta": "id-ID",
  "Asia/Manila": "en-PH",
  "Asia/Dubai": "ar-AE",
  "Asia/Jerusalem": "he-IL",
  // --- Oceania ---
  "Australia/Sydney": "en-AU",
  "Australia/Melbourne": "en-AU",
  "Australia/Brisbane": "en-AU",
  "Australia/Perth": "en-AU",
  "Pacific/Auckland": "en-NZ",
  // --- Africa ---
  "Africa/Johannesburg": "en-ZA",
  "Africa/Cairo": "ar-EG",
  "Africa/Lagos": "en-NG",
  "Africa/Nairobi": "en-KE",
};

/** Stable value used on the server and the first client paint (keeps hydration safe). */
export const FALLBACK_LOCALE = "en-US";

export function resolveLocale(): string {
  if (typeof Intl !== "undefined") {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const mapped = tz ? TIMEZONE_LOCALE[tz] : undefined;
      if (mapped) return mapped;
    } catch {
      // Intl unavailable or threw — fall through to the browser language.
    }
  }
  if (typeof navigator !== "undefined" && navigator.language) {
    return navigator.language;
  }
  return FALLBACK_LOCALE;
}

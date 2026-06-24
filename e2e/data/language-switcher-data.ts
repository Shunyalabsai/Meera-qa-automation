/**
 * Language switcher — synced with frontend LanguageSwitcher.tsx (Google Translate).
 * 14 international + 21 regional Indian languages across 6 groups.
 */

export const LANGUAGE_SWITCHER_COPY = {
  searchPlaceholder: "Search language...",
  noResults: "No results",
  closeBackdrop: "Close language menu",
  listboxLabel: "Select Language",
  defaultTrigger: "English",
  defaultCode: "EN",
} as const;

export const LANGUAGE_REGION_GROUPS = [
  "🌐 International",
  "🇮🇳 Hindi Belt",
  "🇮🇳 South India",
  "🇮🇳 West India",
  "🇮🇳 East India",
  "🇮🇳 North-East",
  "🇮🇳 North India",
] as const;

export type LanguageEntry = {
  value: string;
  label: string;
  /** English name after em dash, e.g. "Hindi" */
  englishName: string;
  group: (typeof LANGUAGE_REGION_GROUPS)[number];
};

export const INTERNATIONAL_LANGUAGES: LanguageEntry[] = [
  { value: "en", label: "English", englishName: "English", group: "🌐 International" },
  { value: "ja", label: "Japanese", englishName: "Japanese", group: "🌐 International" },
  {
    value: "zh-CN",
    label: "Chinese (Simplified)",
    englishName: "Chinese (Simplified)",
    group: "🌐 International",
  },
  {
    value: "zh-TW",
    label: "Chinese (Traditional)",
    englishName: "Chinese (Traditional)",
    group: "🌐 International",
  },
  { value: "ar", label: "Arabic", englishName: "Arabic", group: "🌐 International" },
  { value: "de", label: "German", englishName: "German", group: "🌐 International" },
  { value: "fr", label: "French", englishName: "French", group: "🌐 International" },
  { value: "es", label: "Spanish", englishName: "Spanish", group: "🌐 International" },
  { value: "pt", label: "Portuguese", englishName: "Portuguese", group: "🌐 International" },
  { value: "ru", label: "Russian", englishName: "Russian", group: "🌐 International" },
  { value: "ko", label: "Korean", englishName: "Korean", group: "🌐 International" },
  { value: "tr", label: "Turkish", englishName: "Turkish", group: "🌐 International" },
  { value: "vi", label: "Vietnamese", englishName: "Vietnamese", group: "🌐 International" },
  { value: "id", label: "Indonesian", englishName: "Indonesian", group: "🌐 International" },
];

export const HINDI_BELT_LANGUAGES: LanguageEntry[] = [
  { value: "hi", label: "हिन्दी — Hindi", englishName: "Hindi", group: "🇮🇳 Hindi Belt" },
  { value: "bho", label: "भोजपुरी — Bhojpuri", englishName: "Bhojpuri", group: "🇮🇳 Hindi Belt" },
  { value: "mai", label: "मैथिली — Maithili", englishName: "Maithili", group: "🇮🇳 Hindi Belt" },
  {
    value: "raj",
    label: "राजस्थानी — Rajasthani",
    englishName: "Rajasthani",
    group: "🇮🇳 Hindi Belt",
  },
];

export const SOUTH_INDIA_LANGUAGES: LanguageEntry[] = [
  { value: "ta", label: "தமிழ் — Tamil", englishName: "Tamil", group: "🇮🇳 South India" },
  { value: "te", label: "తెలుగు — Telugu", englishName: "Telugu", group: "🇮🇳 South India" },
  { value: "kn", label: "ಕನ್ನಡ — Kannada", englishName: "Kannada", group: "🇮🇳 South India" },
  { value: "ml", label: "മലയാളം — Malayalam", englishName: "Malayalam", group: "🇮🇳 South India" },
];

export const WEST_INDIA_LANGUAGES: LanguageEntry[] = [
  { value: "mr", label: "मराठी — Marathi", englishName: "Marathi", group: "🇮🇳 West India" },
  { value: "gu", label: "ગુજરાતી — Gujarati", englishName: "Gujarati", group: "🇮🇳 West India" },
  { value: "kok", label: "कोंकणी — Konkani", englishName: "Konkani", group: "🇮🇳 West India" },
];

export const EAST_INDIA_LANGUAGES: LanguageEntry[] = [
  { value: "bn", label: "বাংলা — Bengali", englishName: "Bengali", group: "🇮🇳 East India" },
  { value: "or", label: "ଓଡ଼ିଆ — Odia", englishName: "Odia", group: "🇮🇳 East India" },
  { value: "as", label: "অসমীয়া — Assamese", englishName: "Assamese", group: "🇮🇳 East India" },
];

export const NORTH_EAST_LANGUAGES: LanguageEntry[] = [
  { value: "mni", label: "মেইতেই — Meitei", englishName: "Meitei", group: "🇮🇳 North-East" },
  { value: "ne", label: "नेपाली — Nepali", englishName: "Nepali", group: "🇮🇳 North-East" },
];

export const NORTH_INDIA_LANGUAGES: LanguageEntry[] = [
  { value: "pa", label: "ਪੰਜਾਬੀ — Punjabi", englishName: "Punjabi", group: "🇮🇳 North India" },
  { value: "ur", label: "اردو — Urdu", englishName: "Urdu", group: "🇮🇳 North India" },
  { value: "ks", label: "کٲشُر — Kashmiri", englishName: "Kashmiri", group: "🇮🇳 North India" },
  { value: "doi", label: "डोगरी — Dogri", englishName: "Dogri", group: "🇮🇳 North India" },
  { value: "sd", label: "سنڌي — Sindhi", englishName: "Sindhi", group: "🇮🇳 North India" },
];

export const ALL_UI_LANGUAGES: LanguageEntry[] = [
  ...INTERNATIONAL_LANGUAGES,
  ...HINDI_BELT_LANGUAGES,
  ...SOUTH_INDIA_LANGUAGES,
  ...WEST_INDIA_LANGUAGES,
  ...EAST_INDIA_LANGUAGES,
  ...NORTH_EAST_LANGUAGES,
  ...NORTH_INDIA_LANGUAGES,
];

export const LANGUAGE_SAMPLES = {
  searchHindi: "Hindi",
  searchTamil: "Tamil",
  searchJapanese: "Japanese",
  searchNoMatch: "zzzz-not-a-language",
  searchPartial: "Chinese",
  localStorageKey: "shunya_lang",
} as const;

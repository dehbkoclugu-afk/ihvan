export type SacredContentKind = 'quran' | 'translation' | 'tafsir' | 'dua';

export interface SacredSource {
  id: string;
  kind: SacredContentKind;
  language: string;
  name: string;
  publisher?: string;
  version?: string;
  url: string;
  humanAuthored: boolean;
  machineTranslated: false;
  status: 'active' | 'pending-license';
  license?: string;
}

/**
 * Sacred-content provenance is explicit and reviewable. A translation, tafsir or
 * dua source must not become active unless it is human-authored and its usage
 * terms have been checked. AI/machine-translated sacred content is prohibited.
 */
export const SACRED_SOURCES: SacredSource[] = [
  {
    id: 'quran-ar-tanzil-uthmani',
    kind: 'quran',
    language: 'ar',
    name: 'Tanzil Project — Uthmani Quran Text',
    url: 'https://tanzil.net',
    humanAuthored: true,
    machineTranslated: false,
    status: 'active',
    license: 'CC BY 3.0; verbatim only',
  },
  {
    id: 'meal-tr-quranenc-rwwad',
    kind: 'translation',
    language: 'tr',
    name: 'Türkçe Tercüme — Rowwad Translation Center',
    publisher: 'Rowwad Translation Center',
    version: '1.0.4',
    url: 'https://quranenc.com/en/browse/turkish_rwwad',
    humanAuthored: true,
    machineTranslated: false,
    status: 'active',
    license: 'QuranEnc redistribution terms; verbatim, attributed, versioned',
  },
  {
    id: 'meal-en-quranenc-rwwad',
    kind: 'translation',
    language: 'en',
    name: 'English Translation — Rowwad Translation Center',
    publisher: 'Rowwad Translation Center',
    version: '1.0.19',
    url: 'https://quranenc.com/en/browse/english_rwwad',
    humanAuthored: true,
    machineTranslated: false,
    status: 'active',
    license: 'QuranEnc redistribution terms; verbatim, attributed, versioned',
  },
  {
    id: 'tafsir-tr-pending',
    kind: 'tafsir',
    language: 'tr',
    name: 'Turkish tafsir — source not yet approved',
    url: '',
    humanAuthored: true,
    machineTranslated: false,
    status: 'pending-license',
  },
  {
    id: 'dua-tr-pending',
    kind: 'dua',
    language: 'tr',
    name: 'Dua translations — source not yet approved',
    url: '',
    humanAuthored: true,
    machineTranslated: false,
    status: 'pending-license',
  },
];

export function activeSource(kind: SacredContentKind, language?: string): SacredSource | undefined {
  return SACRED_SOURCES.find((source) => source.kind === kind && source.status === 'active' && (!language || source.language === language));
}

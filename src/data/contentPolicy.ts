export type SacredContentKind = 'quran' | 'translation' | 'tafsir' | 'dua';

export interface SacredSource {
  kind: SacredContentKind;
  name: string;
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
    kind: 'quran',
    name: 'Tanzil Project — Uthmani Quran Text',
    url: 'https://tanzil.net',
    humanAuthored: true,
    machineTranslated: false,
    status: 'active',
    license: 'CC BY 3.0; verbatim only',
  },
  {
    kind: 'translation',
    name: 'Turkish meal — source not yet approved',
    url: '',
    humanAuthored: true,
    machineTranslated: false,
    status: 'pending-license',
  },
  {
    kind: 'tafsir',
    name: 'Turkish tafsir — source not yet approved',
    url: '',
    humanAuthored: true,
    machineTranslated: false,
    status: 'pending-license',
  },
  {
    kind: 'dua',
    name: 'Dua translations — source not yet approved',
    url: '',
    humanAuthored: true,
    machineTranslated: false,
    status: 'pending-license',
  },
];

export function activeSource(kind: SacredContentKind): SacredSource | undefined {
  return SACRED_SOURCES.find((source) => source.kind === kind && source.status === 'active');
}

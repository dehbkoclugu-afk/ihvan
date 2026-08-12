import ar from '../src/i18n/locales/ar.ts';
import en from '../src/i18n/locales/en.ts';
import tr from '../src/i18n/locales/tr.ts';

const dictionaries = { en, tr, ar };
const sourceKeys = Object.keys(en).sort();
const production = process.argv.includes('--production');
const tokenPattern = /\{\{\s*[\w.-]+\s*\}\}/g;
const tokens = (value) => (value.match(tokenPattern) ?? []).map((token) => token.replace(/\s/g, '')).sort();

for (const [locale, dictionary] of Object.entries(dictionaries)) {
  const keys = Object.keys(dictionary).sort();
  if (JSON.stringify(keys) !== JSON.stringify(sourceKeys)) {
    const missing = sourceKeys.filter((key) => !(key in dictionary));
    const extra = keys.filter((key) => !(key in en));
    throw new Error(`${locale}: key mismatch; missing=${missing.join(',')}; extra=${extra.join(',')}`);
  }
  for (const key of sourceKeys) {
    const value = dictionary[key];
    if (typeof value !== 'string' || !value.trim()) throw new Error(`${locale}.${key}: empty value`);
    if (/TODO|TRANSLATE_ME|MISSING_TRANSLATION/i.test(value)) throw new Error(`${locale}.${key}: sentinel value`);
    if (JSON.stringify(tokens(value)) !== JSON.stringify(tokens(en[key]))) {
      throw new Error(`${locale}.${key}: interpolation tokens differ from English`);
    }
    if (production && /^[a-z][\w-]*(?:\.[\w-]+)+$/i.test(value.trim())) {
      throw new Error(`${locale}.${key}: looks like a raw translation key`);
    }
  }
}

console.log(`UI locale validation passed: ${sourceKeys.length} keys × ${Object.keys(dictionaries).length} locales.`);

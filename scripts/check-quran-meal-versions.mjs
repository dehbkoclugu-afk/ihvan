const bundled = new Map([
  ['turkish_rwwad', '1.0.4'],
  ['english_rwwad', '1.0.19'],
]);

const responses = await Promise.all(['tr', 'en'].map(async (language) => {
  const response = await fetch(`https://quranenc.com/api/v1/translations/list/${language}?localization=en`, {
    headers: { accept: 'application/json' },
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new Error(`QuranEnc ${language} registry returned ${response.status}`);
  const payload = await response.json();
  return Array.isArray(payload) ? payload : payload.translations;
}));

const remote = responses.flat();
for (const [key, version] of bundled) {
  const item = remote.find((candidate) => candidate.key === key);
  if (!item) throw new Error(`QuranEnc registry no longer lists ${key}`);
  if (item.version !== version) {
    throw new Error(`${key} update required: bundled ${version}, current ${item.version}`);
  }
  console.log(`${key}: current at ${version}`);
}

import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const root = process.cwd();
const dictionaryPath = path.join(root, 'src/i18n/locales/en.ts');
const dictionarySource = ts.createSourceFile(dictionaryPath, fs.readFileSync(dictionaryPath, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
const tokenMap = new Map();
const tokenPattern = /\{\{\s*([\w.-]+)\s*\}\}/g;

function explicitDictionaryKeys(file) {
  const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const keys = new Set();
  const visit = (node) => {
    if (ts.isPropertyAssignment(node) && ts.isStringLiteralLike(node.name)) keys.add(node.name.text);
    ts.forEachChild(node, visit);
  };
  visit(source);
  return keys;
}

const localeOverrides = new Map(['tr', 'ar'].map((locale) => [
  locale,
  explicitDictionaryKeys(path.join(root, `src/i18n/locales/${locale}.ts`)),
]));

function visitDictionary(node) {
  if (ts.isPropertyAssignment(node) && (ts.isStringLiteral(node.name) || ts.isNoSubstitutionTemplateLiteral(node.name))) {
    const value = node.initializer;
    if (ts.isStringLiteral(value) || ts.isNoSubstitutionTemplateLiteral(value)) {
      tokenMap.set(node.name.text, new Set([...value.text.matchAll(tokenPattern)].map((match) => match[1])));
    }
  }
  ts.forEachChild(node, visitDictionary);
}
visitDictionary(dictionarySource);

function sourceFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || absolute.includes(`${path.sep}i18n${path.sep}locales`)) return [];
      return sourceFiles(absolute);
    }
    return /\.(ts|tsx)$/.test(entry.name) && !/\.test\.ts$/.test(entry.name) ? [absolute] : [];
  });
}

const errors = [];
let checkedCalls = 0;
for (const file of [...sourceFiles(path.join(root, 'app')), ...sourceFiles(path.join(root, 'src'))]) {
  const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const check = (node) => {
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && ['copy', 't', 'translate'].includes(node.expression.text)) {
      const [keyArgument, valuesArgument] = node.arguments;
      if (keyArgument && ts.isStringLiteralLike(keyArgument)) {
        checkedCalls += 1;
        const expected = tokenMap.get(keyArgument.text);
        const position = source.getLineAndCharacterOfPosition(node.getStart(source));
        const location = `${path.relative(root, file)}:${position.line + 1}:${position.character + 1}`;
        if (!expected) {
          errors.push(`${location} unknown translation key ${keyArgument.text}`);
        } else {
          for (const [locale, overrides] of localeOverrides) {
            if (!overrides.has(keyArgument.text)) errors.push(`${location} ${keyArgument.text} missing explicit ${locale} localization`);
          }
        }
        if (expected?.size) {
          const supplied = new Set();
          if (valuesArgument && ts.isObjectLiteralExpression(valuesArgument)) {
            for (const property of valuesArgument.properties) {
              if (ts.isPropertyAssignment(property) || ts.isShorthandPropertyAssignment(property)) {
                if (ts.isIdentifier(property.name) || ts.isStringLiteral(property.name)) supplied.add(property.name.text);
              } else if (ts.isSpreadAssignment(property)) {
                errors.push(`${location} ${keyArgument.text} uses values that cannot be verified statically`);
              }
            }
          }
          if (valuesArgument && !ts.isObjectLiteralExpression(valuesArgument)) {
            errors.push(`${location} ${keyArgument.text} uses values that cannot be verified statically`);
          } else {
            const missing = [...expected].filter((name) => !supplied.has(name));
            const extra = [...supplied].filter((name) => !expected.has(name));
            if (missing.length || extra.length) {
              errors.push(`${location} ${keyArgument.text} missing=[${missing.join(', ')}] extra=[${extra.join(', ')}]`);
            }
          }
        }
      }
    }
    ts.forEachChild(node, check);
  };
  check(source);
}

if (errors.length) {
  console.error(`UI interpolation audit failed (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`UI interpolation audit passed: ${checkedCalls} literal calls checked against ${tokenMap.size} translation keys.`);

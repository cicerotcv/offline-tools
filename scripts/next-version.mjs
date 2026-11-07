#!/usr/bin/env node
/**
 * Release versioning for package.json, shared by the release workflows.
 *
 *   node scripts/next-version.mjs patch|minor|major   prints the next version
 *   node scripts/next-version.mjs --write 1.2.3       sets package.json version
 *   node scripts/next-version.mjs --is-release <old>  exits 0 when package.json
 *                                                     is a higher version than <old>
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const parse = (version) => {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version ?? '');
  if (!match) return null;
  return match.slice(1).map(Number);
};

export function bump(version, kind) {
  const parts = parse(version);
  if (!parts) throw new Error(`Not a plain semver version: ${version}`);
  const [major, minor, patch] = parts;
  if (kind === 'major') return `${major + 1}.0.0`;
  if (kind === 'minor') return `${major}.${minor + 1}.0`;
  if (kind === 'patch') return `${major}.${minor}.${patch + 1}`;
  throw new Error(`Unknown bump: ${kind}`);
}

/** True when `next` is a strictly higher semver than `previous`. */
export function isHigher(next, previous) {
  const a = parse(next);
  const b = parse(previous);
  if (!a) return false;
  if (!b) return true;
  for (let i = 0; i < 3; i++) {
    if (a[i] !== b[i]) return a[i] > b[i];
  }
  return false;
}

const isCli =
  Boolean(process.argv[1]) &&
  path.resolve(process.argv[1]) === import.meta.filename;

if (isCli) {
  const file = path.resolve(import.meta.dirname, '..', 'package.json');
  const pkg = JSON.parse(readFileSync(file, 'utf8'));
  const [command, value] = process.argv.slice(2);
  run(command, value, pkg, file);
}

function run(command, value, pkg, file) {
  if (command === '--write') {
    if (!parse(value)) throw new Error(`Not a plain semver version: ${value}`);
    pkg.version = value;
    writeFileSync(file, `${JSON.stringify(pkg, null, 2)}\n`);
  } else if (command === '--is-release') {
    process.exit(isHigher(pkg.version, value) ? 0 : 1);
  } else if (command) {
    console.log(bump(pkg.version, command));
  }
}

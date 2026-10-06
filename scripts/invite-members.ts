/**
 * Invite members to the members' area.
 *
 *   npx tsx scripts/invite-members.ts members.csv
 *   npx tsx scripts/invite-members.ts members.csv --dry-run
 *
 * The file is a plain list of emails, or a CSV with optional name and class
 * year columns, with or without a header row:
 *
 *   email,name,class_year
 *   jordan@gmail.com,Jordan Lee,2027
 *   sam@unc.edu
 *
 * Each new email gets an invite whose link ends on /setup-account. Emails that
 * already have an account are skipped. Reads PUBLIC_SUPABASE_URL,
 * SUPABASE_SECRET_KEY and SITE_URL from .env.local.
 *
 * This is the only code that uses the secret key. It runs on your computer,
 * never on the website.
 */
import { createClient } from '@supabase/supabase-js';
import { existsSync, readFileSync } from 'node:fs';

interface Row {
  email: string;
  name: string | null;
  classYear: number | null;
  line: number;
}

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const file = args.find((a) => !a.startsWith('--'));

if (!file) {
  console.error('Usage: npx tsx scripts/invite-members.ts <emails.csv|emails.txt> [--dry-run]');
  process.exit(1);
}
if (existsSync('.env.local')) process.loadEnvFile('.env.local');

const url = process.env.PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
const site = process.env.SITE_URL?.replace(/\/$/, '');
const missing = [!url && 'PUBLIC_SUPABASE_URL', !secret && 'SUPABASE_SECRET_KEY', !site && 'SITE_URL'].filter(Boolean);
if (missing.length) {
  console.error(`Missing ${missing.join(', ')} in .env.local (see .env.example).`);
  process.exit(1);
}

/** Split one CSV line, honouring "quoted, values". Tabs and semicolons work too. */
function splitLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cur += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',' || ch === '\t' || ch === ';') { out.push(cur.trim()); cur = ''; }
    else cur += ch;
  }
  out.push(cur.trim());
  return out;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parse(text: string): { rows: Row[]; bad: string[] } {
  const lines = text.replace(/^﻿/, '').split(/\r?\n/);
  let cols = { email: 0, name: 1, year: 2 };
  const rows: Row[] = [];
  const bad: string[] = [];
  const seen = new Set<string>();

  lines.forEach((raw, i) => {
    const line = raw.trim();
    if (!line || line.startsWith('#')) return;
    const cells = splitLine(line);
    const lower = cells.map((c) => c.toLowerCase());
    // Header row: work out which column is which.
    if (rows.length === 0 && lower.some((c) => c === 'email' || c === 'e-mail')) {
      const find = (...names: string[]) => lower.findIndex((c) => names.includes(c));
      cols = {
        email: find('email', 'e-mail'),
        name: find('name', 'full_name', 'full name'),
        year: find('class_year', 'class year', 'year', 'class'),
      };
      return;
    }
    const email = (cells[cols.email] ?? '').toLowerCase();
    if (!EMAIL.test(email)) {
      bad.push(`line ${i + 1}: "${line}" (no valid email)`);
      return;
    }
    if (seen.has(email)) return;
    seen.add(email);
    const name = cols.name >= 0 ? cells[cols.name] || null : null;
    const yearText = cols.year >= 0 ? cells[cols.year] ?? '' : '';
    const classYear = /^\d{4}$/.test(yearText) ? Number(yearText) : null;
    rows.push({ email, name, classYear, line: i + 1 });
  });
  return { rows, bad };
}

const supabase = createClient(url!, secret!, { auth: { autoRefreshToken: false, persistSession: false } });

async function existingEmails(): Promise<Set<string>> {
  const emails = new Set<string>();
  for (let page = 1; ; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw new Error(`Couldn't list existing users: ${error.message}`);
    for (const u of data.users) if (u.email) emails.add(u.email.toLowerCase());
    if (data.users.length < 1000) return emails;
  }
}

async function main() {
  const { rows, bad } = parse(readFileSync(file!, 'utf8'));
  if (rows.length === 0) {
    console.error(`No emails found in ${file}.`);
    process.exit(1);
  }

  const existing = await existingEmails();
  const invited: string[] = [];
  const skipped: string[] = [];
  const failed: string[] = [...bad];
  const redirectTo = `${site}/auth/confirm?next=/setup-account`;

  console.log(`${dryRun ? '[dry run] ' : ''}Inviting from ${file} → ${redirectTo}\n`);

  for (const row of rows) {
    if (existing.has(row.email)) {
      skipped.push(`${row.email} (already has an account)`);
      continue;
    }
    if (dryRun) {
      invited.push(row.email);
      continue;
    }
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(row.email, {
      redirectTo,
      data: { full_name: row.name ?? undefined, class_year: row.classYear ?? undefined },
    });
    if (error || !data.user) {
      failed.push(`${row.email}: ${error?.message ?? 'no user returned'}`);
      continue;
    }
    // The database trigger creates the profile; fill in name and year too in
    // case they were added after the fact.
    if (row.name || row.classYear) {
      const { error: profileErr } = await supabase
        .from('profiles')
        .upsert({ id: data.user.id, full_name: row.name, class_year: row.classYear });
      if (profileErr) failed.push(`${row.email}: invited, but profile not filled in (${profileErr.message})`);
    }
    invited.push(row.email);
    console.log(`  invited  ${row.email}`);
  }

  const list = (title: string, items: string[]) => {
    console.log(`\n${title} (${items.length})`);
    for (const i of items) console.log(`  - ${i}`);
  };
  list(dryRun ? 'Would invite' : 'Invited', invited);
  list('Skipped', skipped);
  list('Failed', failed);
  if (failed.length) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});

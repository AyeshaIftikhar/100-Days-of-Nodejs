import fs from 'node:fs';
import { EOL } from 'node:os';
import Table from 'cli-table3';

export function toCSV(rows) {
  if (!rows || rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const escape = (v) => {
    if (v == null) return '';
    const s = String(v);
    if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  };
  const lines = [];
  lines.push(headers.map(escape).join(','));
  for (const r of rows) {
    lines.push(headers.map(h => escape(r[h])).join(','));
  }
  return lines.join(EOL);
}

export function toTable(rows) {
  if (!rows || rows.length === 0) return '(no rows)';
  const headers = Object.keys(rows[0]);
  const t = new Table({ head: headers });
  for (const r of rows) {
    t.push(headers.map(h => r[h]));
  }
  return t.toString();
}

export function emit(rows, format, outputPath) {
  let out = '';
  switch ((format || 'table').toLowerCase()) {
    case 'json':
      out = JSON.stringify(rows || [], null, 2);
      break;
    case 'csv':
      out = toCSV(rows || []);
      break;
    default:
      out = toTable(rows || []);
  }
  if (outputPath) {
    fs.writeFileSync(outputPath, out);
    return `Wrote ${rows?.length ?? 0} row(s) to ${outputPath}`;
  }
  return out;
}
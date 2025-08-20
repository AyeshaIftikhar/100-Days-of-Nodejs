#!/usr/bin/env node
import { Command } from 'commander';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { checkUrl } from './checkers/urlChecker.js';
import { checkVpnOrProxy } from './checkers/vpnChecker.js';
import { log } from './utils/logger.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf-8'));
const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/default.json'), 'utf-8'));
const program = new Command();

program
  .name('proxypulse')
  .description(`${pkg.description}`)
  .version(pkg.version);

program.command('check-url')
  .argument('<url>', 'URL to check')
  .option('-X, --method <method>', 'HTTP method', 'GET')
  .option('-t, --timeout <ms>', 'Timeout in ms', String(process.env.REQUEST_TIMEOUT || config.requestTimeout))
  .action(async (url, options) => {
    log.title('ProxyPulse • URL Check');
    const res = await checkUrl(url, {
      timeout: Number(options.timeout),
      userAgent: config.userAgent,
      proxyUrl: process.env.HTTPS_PROXY || process.env.HTTP_PROXY || null,
      method: options.method
    });
    log.info(`URL: ${res.url}`);
    log.info(`OK: ${res.ok} • Status: ${res.http?.status ?? 'N/A'} • Time: ${res.elapsedMs} ms`);
    log.info(`DNS A: ${res.dns.A.join(', ') || '—'}`);
    if (res.dns.AAAA?.length) log.info(`DNS AAAA: ${res.dns.AAAA.join(', ')}`);
    if (res.errors.networkError) log.warn(`Network error: ${res.errors.networkError}`);
    if (res.http?.redirected) log.info(`Redirected to: ${res.http.finalUrl}`);
    if (res.usedProxy) log.warn(`Request used proxy from env (HTTP(S)_PROXY).`);
    console.log(JSON.stringify(res, null, 2));
  });

program.command('check-vpn')
  .description('Detect if current network likely uses VPN or proxy')
  .action(async () => {
    log.title('ProxyPulse • VPN/Proxy Check');
    const out = await checkVpnOrProxy({
      ipApis: config.ipApis,
      vpnHeuristics: config.vpnHeuristics
    });
    if (!out.ok) {
      log.err(out.message);
      if (out.diagnostics) console.log(out.diagnostics);
      process.exitCode = 1;
      return;
    }
    log.info(`Public IP: ${out.ip}`);
    log.info(`Org/ASN: ${out.organization || 'N/A'} (${out.asn || 'N/A'})`);
    log.ok(`VPN/Proxy verdict: ${out.vpnOrProxy.toUpperCase()} (score ${out.score})`);
    console.log(JSON.stringify(out, null, 2));
  });

program.command('serve')
  .description('Start the HTTP API server')
  .option('-p, --port <port>', 'Port to bind', String(process.env.PORT || config.port))
  .action(async (opts) => {
    process.env.PORT = opts.port;
    await import('./server.js');
  });

program.parse(process.argv);

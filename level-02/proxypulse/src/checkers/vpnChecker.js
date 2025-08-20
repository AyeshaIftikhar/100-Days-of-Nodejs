import axios from 'axios';

/**
 * getPublicIp tries multiple services and returns the first successful one.
 */
async function getPublicIp(ipApis) {
  const errors = [];
  for (const url of ipApis) {
    try {
      const res = await axios.get(url, { timeout: 6000, validateStatus: () => true });
      if (res.status >= 200 && res.status < 400) {
        // Try common formats
        if (res.data?.ip) return { ip: res.data.ip, raw: res.data, source: url };
        if (res.data?.query) return { ip: res.data.query, raw: res.data, source: url };
        if (typeof res.data === 'string') return { ip: res.data.trim(), raw: res.data, source: url };
      }
      errors.push(`${url} -> HTTP ${res.status}`);
    } catch (e) {
      errors.push(`${url} -> ${e.message}`);
    }
  }
  return { ip: null, raw: null, source: null, errors };
}

/**
 * Try to enrich IP info (org/ASN) using ipinfo and ipapi (no keys).
 */
async function enrichIp(ip) {
  const details = {};
  const attempts = [
    `https://ipinfo.io/${ip}/json`,
    `https://ipapi.co/${ip}/json`,
  ];
  for (const url of attempts) {
    try {
      const res = await axios.get(url, { timeout: 6000, validateStatus: () => true });
      if (res.status >= 200 && res.status < 400) {
        details[url.includes('ipinfo.io') ? 'ipinfo' : 'ipapi'] = res.data;
      }
    } catch {}
  }
  return details;
}

function decideVpnLikely({ org = '', asn = '', hostingKeywords = [], vpnKeywords = [] }) {
  const hay = `${org} ${asn}`.toLowerCase();
  const hasHosting = hostingKeywords.some(k => hay.includes(k.toLowerCase()));
  const hasVpn = vpnKeywords.some(k => hay.includes(k.toLowerCase()));
  // conservative: hosting or explicit vpn brands suggest "likely"
  const score = (hasHosting ? 0.6 : 0) + (hasVpn ? 0.7 : 0);
  const verdict = score >= 0.6 ? 'likely' : 'unlikely';
  return { verdict, score: Math.min(score, 1), reasons: { hasHosting, hasVpn } };
}

export async function checkVpnOrProxy(config) {
  const { ipApis, vpnHeuristics } = config;
  const { hostingAsnKeywords = [], vpnOrgKeywords = [] } = vpnHeuristics || {};

  const pub = await getPublicIp(ipApis || []);
  if (!pub.ip) {
    return {
      ok: false,
      message: 'Could not determine public IP',
      diagnostics: { attempts: pub.errors }
    };
  }

  const enrich = await enrichIp(pub.ip);
  const org =
    enrich.ipinfo?.org ||
    enrich.ipapi?.org ||
    enrich.ipapi?.asn ||
    '';

  const asn =
    enrich.ipapi?.asn ||
    (enrich.ipinfo?.org || '').split(' ')[0] ||
    '';

  const decision = decideVpnLikely({
    org,
    asn,
    hostingKeywords: hostingAsnKeywords,
    vpnKeywords: vpnOrgKeywords
  });

  return {
    ok: true,
    ip: pub.ip,
    source: pub.source,
    organization: org || null,
    asn: asn || null,
    vpnOrProxy: decision.verdict,
    score: decision.score,
    reasons: decision.reasons,
    raw: enrich
  };
}

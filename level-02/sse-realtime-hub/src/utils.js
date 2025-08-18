function sseFormat({ id, event, data, retry }) {
  // Build a properly formatted SSE message
  let lines = [];
  if (retry) lines.push(`retry: ${retry}`);
  if (id !== undefined) lines.push(`id: ${id}`);
  if (event) lines.push(`event: ${event}`);
  // Data can be multi-line; ensure stringified JSON by default
  // Handle case where data might be undefined
  if (data !== undefined) {
    const payload = typeof data === 'string' ? data : JSON.stringify(data);
    payload.split('\n').forEach((ln) => lines.push(`data: ${ln}`));
  } else {
    // Add an empty data field if data is undefined
    lines.push('data: ');
  }
  lines.push(''); // blank line to terminate the SSE message
  return lines.join('\n');
}

function safeJsonParse(maybe) {
  try {
    return JSON.parse(maybe);
  } catch {
    return maybe;
  }
}

module.exports = { sseFormat, safeJsonParse };

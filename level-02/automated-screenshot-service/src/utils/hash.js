import crypto from 'crypto';

export function hashParams(obj) {
  const json = JSON.stringify(sortObject(obj));
  return crypto.createHash('sha1').update(json).digest('hex').slice(0, 16);
}

function sortObject(o) {
  if (Array.isArray(o)) return o.map(sortObject);
  if (o && typeof o === 'object') {
    return Object.keys(o).sort().reduce((acc, k) => {
      acc[k] = sortObject(o[k]);
      return acc;
    }, {});
  }
  return o;
}

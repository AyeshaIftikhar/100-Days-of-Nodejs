export const ok = (body = {}, statusCode = 200, headers = {}) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json', ...headers },
  body: JSON.stringify(body)
});

export const bad = (message = 'Bad Request', statusCode = 400) => ok({ error: message }, statusCode);

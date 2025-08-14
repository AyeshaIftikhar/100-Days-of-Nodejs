// O(n) Fibonacci with memoization for demo purposes
function fib(n, memo = {}) {
  n = Number(n);
  if (Number.isNaN(n) || n < 0) throw new Error('n must be a non-negative integer');
  if (n <= 1) return n;
  if (memo[n]) return memo[n];
  memo[n] = fib(n - 1, memo) + fib(n - 2, memo);
  return memo[n];
}

module.exports = { fib };

const { fib } = require('../src/utils/fib');

describe('fib()', () => {
  test('base cases', () => {
    expect(fib(0)).toBe(0);
    expect(fib(1)).toBe(1);
  });

  test('small n', () => {
    expect(fib(5)).toBe(5);
    expect(fib(10)).toBe(55);
  });

  test('throws on invalid', () => {
    expect(() => fib(-1)).toThrow();
    expect(() => fib('nope')).toThrow();
  });
});

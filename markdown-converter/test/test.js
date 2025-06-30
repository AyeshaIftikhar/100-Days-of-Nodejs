const MarkdownConverter = require('../lib/converter');
const fs = require('fs').promises;
const path = require('path');

describe('MarkdownConverter', () => {
  let converter;
  const testFile = path.join(__dirname, 'test.md');
  const outputFile = path.join(__dirname, 'test.html');

  beforeAll(async () => {
    await fs.writeFile(testFile, '# Test\n\nThis is a test.');
    converter = new MarkdownConverter({
      outputDir: __dirname
    });
  });

  afterAll(async () => {
    await fs.unlink(testFile);
    await fs.unlink(outputFile).catch(() => {});
  });

  it('should convert markdown to html', async () => {
    const result = await converter.convertFile(testFile);
    expect(result.outputPath).toBe(outputFile);
    
    const html = await fs.readFile(outputFile, 'utf8');
    expect(html).toContain('<h1>Test</h1>');
    expect(html).toContain('<p>This is a test.</p>');
  });
});
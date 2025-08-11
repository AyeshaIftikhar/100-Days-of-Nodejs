const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const puppeteer = require('puppeteer');
const { format } = require('date-fns');

function currency(value, currencySymbol = 'PKR ') {
  return `${currencySymbol}${Number(value).toFixed(2)}`;
}

// Register Handlebars helpers
Handlebars.registerHelper('currency', (val, symbol) => currency(val, symbol || 'PKR '));
Handlebars.registerHelper('formatDate', (dateStr, fmt = 'yyyy-MM-dd') => {
  if (!dateStr) return '';
  try {
    return format(new Date(dateStr), fmt);
  } catch (e) {
    return dateStr;
  }
});
Handlebars.registerHelper('sumLine', (qty, unit_price, tax_rate) => {
  const subtotal = (qty || 1) * (unit_price || 0);
  const tax = tax_rate ? subtotal * (tax_rate / 100) : 0;
  return (subtotal + tax).toFixed(2);
});

async function renderTemplateToHTML(data) {
  const templatePath = path.join(__dirname, '..', 'templates', 'invoice.hbs');
  const cssPath = path.join(__dirname, '..', 'templates', 'style.css');

  const templateSrc = fs.readFileSync(templatePath, 'utf8');
  const css = fs.readFileSync(cssPath, 'utf8');

  const template = Handlebars.compile(templateSrc);
  // Add derived fields
  const items = data.items || [];
  let subtotal = 0;
  let totalTax = 0;
  items.forEach((it) => {
    const line = (it.quantity || 1) * (it.unit_price || 0);
    const tax = it.tax_rate ? line * (it.tax_rate / 100) : 0;
    subtotal += line;
    totalTax += tax;
  });
  const total = subtotal + totalTax;

  const html = template({
    ...data,
    items,
    subtotal: subtotal.toFixed(2),
    tax_total: totalTax.toFixed(2),
    total: total.toFixed(2),
    css,
    generated_at: format(new Date(), 'yyyy-MM-dd HH:mm')
  });

  return html;
}

/**
 * generateFromTemplate(invoiceData, outputPath)
 */
async function generateFromTemplate(invoiceData, outputPath) {
  // Render HTML
  const html = await renderTemplateToHTML(invoiceData);

  // Launch Puppeteer - by default it downloads Chromium
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
    // If you want to use system Chrome inside Docker, pass executablePath here.
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Emulate print CSS media for correct printable layout
    await page.emulateMediaType('screen');

    // Generate PDF
    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' }
    });
  } finally {
    await browser.close();
  }
}

module.exports = { generateFromTemplate };

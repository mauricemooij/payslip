require('dotenv').config();
const fs = require('fs');
const puppeteer = require('puppeteer');
const Handlebars = require('handlebars');
const Decimal = require('decimal.js');
const { endOfMonth, format, startOfMonth } = require('date-fns');

const data = fs.readFileSync('./tmp/data.csv', 'utf8');
const templateHtml = fs.readFileSync('payslip.html', 'utf8');

const formatDate = (d) => format(d, 'dd MMMM yyyy');

const all = process.argv[2] === '--all';

const main = async () => {
  const template = Handlebars.compile(templateHtml);

  const { parse } = await import('csv-parse/sync');
  const arr = parse(data, {
    columns: true,
    skip_empty_lines: true
  });

  const todo = all ? arr : arr.splice(arr.length-1, 1);

  for (const payment of todo) {
    const html = template({
      employee_name: process.env.EMPLOYEE_NAME,
      employee_address: process.env.EMPLOYEE_ADDRESS,
      employer_name: process.env.EMPLOYER_NAME,
      employer_address: process.env.EMPLOYER_ADDRESS,
      bank_acount_iban: process.env.BANK_ACCOUNT_IBAN,
      period: `${formatDate(startOfMonth(payment.pay_date))} - ${formatDate(endOfMonth(payment.pay_date))}`,
      pay_date: formatDate(payment.pay_date),
      basic_salary: new Decimal(payment.basic_salary).toFixed(2),
      bonus: new Decimal(payment.bonus).toFixed(2),
      total_salary: Decimal.add(payment.basic_salary, payment.bonus).toFixed(2),
    });

    const browser = await puppeteer.launch({
      executablePath: '/usr/bin/chromium-browser'
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.pdf({
      path: `./tmp/payslip-${format(payment.pay_date, 'yyyyMM')}.pdf`,
      format: 'A4',
      margin: {
        top: '20mm',
        bottom: '20mm',
        left: '15mm',
        right: '15mm'
      }});

    await browser.close();
  }
};

main().then(() => {
  process.exit(0);
}).catch((err) => {
  console.log(err);
  process.exit(1);
});

const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Read the Excel file
const excelPath = path.join(__dirname, '..', '..', 'sales-funnel-SD.xlsx');
const workbook = XLSX.readFile(excelPath);

// Function to parse currency value
function parseCurrency(value) {
  if (!value) return null;
  // Remove currency symbols, spaces, commas
  const cleaned = String(value).replace(/[₮$,\s]/g, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

// Function to parse percentage
function parsePercentage(value) {
  if (!value) return null;
  const cleaned = String(value).replace('%', '').trim();
  const num = parseFloat(cleaned);
  if (isNaN(num)) return null;
  return num > 1 ? num / 100 : num;
}

// Function to parse date
function parseDate(value) {
  if (!value) return null;

  // Try different date formats
  const dateStr = String(value).trim();

  // Format: 29-Oct-2025
  const match1 = dateStr.match(/(\d{1,2})-(\w{3})-(\d{4})/);
  if (match1) {
    const months = {
      'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
      'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
      'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
    };
    const day = match1[1].padStart(2, '0');
    const month = months[match1[2]];
    const year = match1[3];
    if (month) return `${year}-${month}-${day}`;
  }

  // Format: 2025-10-29
  const match2 = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (match2) return dateStr;

  // Try Date parse
  const d = new Date(value);
  if (!isNaN(d.getTime())) {
    return d.toISOString().split('T')[0];
  }

  return null;
}

// Function to escape SQL string
function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL';
  return `'${String(str).replace(/'/g, "''")}'`;
}

// Function to map stage
function mapStage(stage, isServiceContract = false) {
  const validStages = isServiceContract
    ? ['Closed', 'Hot', 'Warm']
    : ['Closed', 'Won', 'Hot', 'Warm', 'Cold', 'Lost'];

  if (validStages.includes(stage)) return stage;
  return isServiceContract ? 'Warm' : 'Cold';
}

// Function to map status
function mapStatus(status) {
  const statusMap = {
    'Not started': 'Not started',
    'In progress': 'In progress',
    'Complate': 'Complate',
    'Complete': 'Complate',
    'Completed': 'Complate'
  };
  return statusMap[status] || 'Not started';
}

// Process Sales Funnel sheet
const salesSheet = workbook.Sheets['Sales Funnel add'];
const salesData = XLSX.utils.sheet_to_json(salesSheet, { raw: false, defval: null });

// Process Service Contracts sheet
const serviceSheet = workbook.Sheets['Service contract'];
const serviceData = XLSX.utils.sheet_to_json(serviceSheet, { raw: false, defval: null });

// Generate SQL
let sql = `-- =============================================
-- Seed Data for Sales Funnel CRM
-- Generated from Excel file
-- Run this AFTER running 001_initial_schema.sql
-- =============================================

-- Sales Funnel Data
INSERT INTO public.sales_funnel (
  client_name, work_info, stage, price, price_without_vat,
  payment_percentage, paid_amount, created_date, close_date,
  team_member, progress_to_won, progress_notes, status, remarks
) VALUES
`;

// Filter valid sales data (has client name and stage)
const validSalesData = salesData.filter(row => {
  const clientName = row['Харилцагч'];
  const stage = row['Stage'];
  return clientName && stage && clientName !== 'Харилцагч';
});

console.log(`Found ${validSalesData.length} valid sales funnel rows`);

const salesValues = validSalesData.map(row => {
  const clientName = escapeSql(row['Харилцагч']);
  const workInfo = escapeSql(row['Ажлын мэдээлэл']);
  const stage = escapeSql(mapStage(row['Stage']));
  const price = parseCurrency(row[' Үнийн дүн ']) || 'NULL';
  const priceWithoutVat = parseCurrency(row[' Value(НӨАТ) ']) || 'NULL';
  const paymentPercentage = parsePercentage(row['Төлөлтийн хувь']) ?? 'NULL';
  const paidAmount = parseCurrency(row[' Төлсөн ба төлөх дүн ']) || 'NULL';
  const createdDate = parseDate(row['date']);
  const closeDate = parseDate(row['\r\nClose Date']);
  const teamMember = escapeSql(row['Team member']);
  const progressToWon = parsePercentage(row['Progress to Won']) ?? 'NULL';
  const progressNotes = escapeSql(row['Явцын мэдээлэл']);
  const status = escapeSql(mapStatus(row['Төлөв']));
  const remarks = escapeSql(row['Тодруулга']);

  return `(${clientName}, ${workInfo}, ${stage}, ${price}, ${priceWithoutVat}, ${paymentPercentage}, ${paidAmount}, ${createdDate ? `'${createdDate}'` : 'NULL'}, ${closeDate ? `'${closeDate}'` : 'NULL'}, ${teamMember}, ${progressToWon}, ${progressNotes}, ${status}, ${remarks})`;
});

sql += salesValues.join(',\n') + ';\n\n';

// Service Contracts
sql += `-- Service Contracts Data
INSERT INTO public.service_contracts (
  client_name, contract_info, stage, price, price_without_vat,
  payment_percentage, yearly_payment, created_date, close_date,
  team_member, progress_to_won, progress_notes, status, remarks
) VALUES
`;

// Filter valid service data
const validServiceData = serviceData.filter(row => {
  const clientName = row['Харилцагч'];
  const stage = row['Stage'];
  return clientName && stage && clientName !== 'Харилцагч';
});

console.log(`Found ${validServiceData.length} valid service contract rows`);

const serviceValues = validServiceData.map(row => {
  const clientName = escapeSql(row['Харилцагч']);
  const contractInfo = escapeSql(row['Гэрээний мэдээлэл'] || 'Service');
  const stage = escapeSql(mapStage(row['Stage'], true));
  const price = parseCurrency(row[' Үнийн дүн ']) || 'NULL';
  const priceWithoutVat = parseCurrency(row[' Value(НӨАТ) ']) || 'NULL';
  const paymentPercentage = parsePercentage(row['Төлөлтийн хувь']) ?? 'NULL';
  const yearlyPayment = parseCurrency(row[' Жилээр төлөх дун ']) || 'NULL';
  const createdDate = parseDate(row['date']);
  const closeDate = parseDate(row['\r\nClose Date']);
  const teamMember = escapeSql(row['Team member'] || 'Сервис гэрээ');
  const progressToWon = parsePercentage(row['Progress to Won']) ?? 'NULL';
  const progressNotes = escapeSql(row['Явцын мэдээлэл']);
  const status = escapeSql(mapStatus(row['Төлөв']));
  const remarks = escapeSql(row['Тодруулга']);

  return `(${clientName}, ${contractInfo}, ${stage}, ${price}, ${priceWithoutVat}, ${paymentPercentage}, ${yearlyPayment}, ${createdDate ? `'${createdDate}'` : 'NULL'}, ${closeDate ? `'${closeDate}'` : 'NULL'}, ${teamMember}, ${progressToWon}, ${progressNotes}, ${status}, ${remarks})`;
});

sql += serviceValues.join(',\n') + ';\n';

// Write to file
const outputPath = path.join(__dirname, 'migrations', '002_seed_data.sql');
fs.writeFileSync(outputPath, sql);
console.log(`\nSeed SQL written to: ${outputPath}`);
console.log(`Total Sales Funnel records: ${validSalesData.length}`);
console.log(`Total Service Contract records: ${validServiceData.length}`);

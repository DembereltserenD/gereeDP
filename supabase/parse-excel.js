const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Read the Excel file
const excelPath = path.join(__dirname, '..', 'sales-funnel-SD.xlsx');
const workbook = XLSX.readFile(excelPath);

// Get sheet names
console.log('Sheet names:', workbook.SheetNames);

// Function to parse date from Excel
function parseExcelDate(value) {
  if (!value) return null;
  if (typeof value === 'number') {
    // Excel date serial number
    const date = XLSX.SSF.parse_date_code(value);
    if (date) {
      return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
    }
  }
  if (typeof value === 'string') {
    // Try to parse string date
    const d = new Date(value);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }
  }
  return null;
}

// Function to parse number
function parseNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
}

// Function to escape SQL string
function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL';
  return `'${String(str).replace(/'/g, "''")}'`;
}

// Function to map stage names
function mapStage(stage) {
  const stageMap = {
    'Closed': 'Closed',
    'Won': 'Won',
    'Hot': 'Hot',
    'Warm': 'Warm',
    'Cold': 'Cold',
    'Lost': 'Lost'
  };
  return stageMap[stage] || 'Cold';
}

// Function to map status
function mapStatus(status) {
  const statusMap = {
    'Not started': 'Not started',
    'In progress': 'In progress',
    'Complate': 'Complate',
    'Complete': 'Complate'
  };
  return statusMap[status] || 'Not started';
}

// Parse Sales Funnel sheet
function parseSalesFunnel(sheet) {
  const data = XLSX.utils.sheet_to_json(sheet, { raw: false, defval: null });
  console.log('\n--- Sales Funnel Data ---');
  console.log('Total rows:', data.length);
  if (data.length > 0) {
    console.log('First row keys:', Object.keys(data[0]));
    console.log('First row sample:', JSON.stringify(data[0], null, 2));
  }
  return data;
}

// Parse Service Contracts sheet
function parseServiceContracts(sheet) {
  const data = XLSX.utils.sheet_to_json(sheet, { raw: false, defval: null });
  console.log('\n--- Service Contracts Data ---');
  console.log('Total rows:', data.length);
  if (data.length > 0) {
    console.log('First row keys:', Object.keys(data[0]));
    console.log('First row sample:', JSON.stringify(data[0], null, 2));
  }
  return data;
}

// Process each sheet
workbook.SheetNames.forEach(sheetName => {
  console.log(`\n========== Sheet: ${sheetName} ==========`);
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { raw: false, defval: null });
  console.log('Total rows:', data.length);
  if (data.length > 0) {
    console.log('Columns:', Object.keys(data[0]));
    console.log('Sample row:', JSON.stringify(data[0], null, 2));
  }
});

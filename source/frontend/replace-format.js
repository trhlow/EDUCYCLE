import fs from 'fs';
import path from 'path';

// Create src/utils/format.js if it doesn't exist
const utilsDir = 'src/utils';
if (!fs.existsSync(utilsDir)) {
  fs.mkdirSync(utilsDir, { recursive: true });
}

const formatContent = `export const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);

export const formatDate = (dateStr) =>
  dateStr ? new Date(dateStr).toLocaleDateString('vi-VN') : '—';

export const formatDateTime = (dateStr) =>
  dateStr ? new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }) : '—';
`;
fs.writeFileSync('src/utils/format.js', formatContent, 'utf-8');

// The files to process
const filesToProcess = [
  'src/pages/WishlistPage.jsx',
  'src/pages/TransactionsPage.jsx',
  'src/pages/TransactionDetailPage.jsx',
  'src/pages/PostProductPage.jsx',
  'src/pages/DashboardPage.jsx',
  'src/pages/AdminPage.jsx'
];

filesToProcess.forEach(filePath => {
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf-8');
  
  const hasFormatPrice = content.includes('formatPrice(');
  const hasFormatDate = content.includes('formatDate(');
  
  if (hasFormatPrice || hasFormatDate) {
    // Add import
    const imports = [];
    if (hasFormatPrice) imports.push('formatPrice');
    if (hasFormatDate) imports.push('formatDate');
    
    // Check if import already exists
    if (!content.includes('import { formatPrice ')) {
      content = `import { ${imports.join(', ')} } from '../utils/format';\n` + content;
    }
  }

  // Remove local declarations of formatPrice
  // Different variants exist in the codebase:
  // const formatPrice = (price) => '$' + price.toFixed(2);
  // const formatPrice = (price) => { ... }
  // const formatPrice = (p) => new Intl.NumberFormat ...
  // const formatPrice = (value) => ...
  content = content.replace(/const formatPrice = \([^)]*\) =>\s*{[^}]*};/g, '');
  content = content.replace(/const formatPrice = \([^)]*\) =>\s*[^;\n]*;/g, '');
  
  content = content.replace(/const formatDate = \([^)]*\) =>\s*{[^}]*};/g, '');
  content = content.replace(/const formatDate = \([^)]*\) =>\s*[^;\n]*;/g, '');
  
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log('Processed', filePath);
});

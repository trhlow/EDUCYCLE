import fs from 'fs';
import path from 'path';

const dir = 'src/pages';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Replace import
  content = content.replace(
    /import \{ useToast \} from '\.\.\/components\/Toast';/g,
    "import toast from 'react-hot-toast';"
  );
  
  // Remove const toast = useToast();
  content = content.replace(
    /^\s*const toast = useToast\(\);\s*$/gm,
    ''
  );
  
  // Custom toast.info() doesn't exist in react-hot-toast directly (it's usually toast() or toast.success()), but let's map it to toast, toast.success or toast.error
  content = content.replace(
    /toast\.info\(/g,
    'toast('
  );
  
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log('Processed', file);
});

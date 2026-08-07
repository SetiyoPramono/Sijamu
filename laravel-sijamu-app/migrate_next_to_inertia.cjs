const fs = require('fs');
const path = require('path');

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let original = content;

      // Replace Next.js Link
      content = content.replace(/import Link from 'next\/link';?/g, "import { Link } from '@inertiajs/react';");
      
      // Replace Next.js usePathname and useRouter
      content = content.replace(/import\s+{([^}]*)}?\s+from\s+'next\/navigation';?/g, (match, p1) => {
        let imports = p1.split(',').map(s => s.trim());
        let newImports = [];
        if (imports.includes('usePathname')) {
          newImports.push('usePage');
        }
        if (imports.includes('useRouter')) {
          newImports.push('router');
        }
        if (imports.includes('useSearchParams')) {
          // Inertia doesn't have useSearchParams natively like this, but we can get it from URL
          // We'll leave it as a comment to fix manually or use URLSearchParams(window.location.search)
        }
        if (newImports.length > 0) {
           return `import { ${newImports.join(', ')} } from '@inertiajs/react';`;
        }
        return match;
      });

      content = content.replace(/const (\w+) = usePathname\(\);?/g, "const { url: $1 } = usePage();");
      
      content = content.replace(/const (\w+)\s*=\s*useRouter\(\);?/g, "// router is imported from @inertiajs/react");
      content = content.replace(/router\.push\(/g, "router.visit(");
      content = content.replace(/router\.replace\(/g, "router.visit(");

      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

const targetDirs = [
  path.join(__dirname, 'resources', 'js', 'Components'),
  path.join(__dirname, 'resources', 'js', 'Pages', 'Sijamu')
];

for (const dir of targetDirs) {
  if (fs.existsSync(dir)) {
    processDirectory(dir);
  }
}
console.log('Migration script finished.');

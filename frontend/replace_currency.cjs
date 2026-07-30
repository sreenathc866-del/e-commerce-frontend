const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('d:/e-commerce/frontend/src');

let count = 0;
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  // replace >$ with >₹
  content = content.replace(/>\$/g, '>₹');
  // replace `$${ with `₹${
  content = content.replace(/`\$\$\{/g, '`₹${');
  // replace placeholder="$0" with placeholder="₹0"
  content = content.replace(/placeholder="\$0"/g, 'placeholder="₹0"');
  content = content.replace(/placeholder="\$1000\+"/g, 'placeholder="₹1000+"');
  // replace "over $50"
  content = content.replace(/over \$50/g, 'over ₹50');
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    count++;
    console.log(`Updated ${file}`);
  }
});

console.log(`Finished updating ${count} files.`);

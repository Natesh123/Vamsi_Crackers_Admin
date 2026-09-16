const fs = require('fs');
const path = require('path');
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) { 
      results.push(file);
    }
  });
  return results;
}
walk('./app').forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('vamsi_crackers_logo.png')) {
    fs.writeFileSync(file, content.replaceAll('vamsi_crackers_logo.png', 'vamsi_crackers_logo_v2.png'));
    console.log('Updated ' + file);
  }
});

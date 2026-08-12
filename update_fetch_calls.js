const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'app/admin/page.tsx');
let content = fs.readFileSync(targetFile, 'utf8');

// The goal is to append headers: { "Authorization": `Bearer ${localStorage.getItem("admin_token")}` } to fetch calls inside fetchData, handleUpload, etc.
// Since AST manipulation is complex for this, and simple regex might break things, 
// let's create a helper function at the top of the file and use a simpler regex replacement, or just do manual targeted replacements.

const helperFunc = `
// Helper for authenticated fetches
const authFetch = async (url: string, options: any = {}) => {
  const token = localStorage.getItem("admin_token");
  const headers = {
    ...options.headers,
    "Authorization": \`Bearer \${token}\`
  };
  return fetch(url, { ...options, headers });
};
`;

if (!content.includes('const authFetch = async')) {
    content = content.replace('export default function AdminDashboard() {', 'export default function AdminDashboard() {\n' + helperFunc);
}

// Replace fetch( to authFetch( for API calls except login
content = content.replace(/fetch\(\`\$\{apiUrl\}\/api\/(categories|products|orders|contacts|settings|upload)/g, 'authFetch(`${apiUrl}/api/$1');
// Also handle fetch without template literal if any, though most use template literals in this codebase based on previous views.

fs.writeFileSync(targetFile, content);
console.log('Updated fetch calls');

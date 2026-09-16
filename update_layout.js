const fs = require('fs');
const path = './app/layout.tsx';
let content = fs.readFileSync(path, 'utf8');
content = content.replace('<body', '<body\n        ><script dangerouslySetInnerHTML={{ __html: `window.onerror = function(msg, url, line, col, error) { alert("ERR: " + msg + " " + (error ? error.stack : "")); };` }} />');
fs.writeFileSync(path, content);

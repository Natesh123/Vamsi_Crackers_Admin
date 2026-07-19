const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// I want to replace everything starting from the END of the stat cards loop
// up to `{/* Right: Cart & Billing */}`
// The stat cards end with:
// `                    ))}
//                   </div>`

const startPattern = '                    ))}\n                  </div>';
const startIndex = content.indexOf(startPattern);

if (startIndex !== -1) {
    const startReplaceIndex = startIndex + startPattern.length;
    const endReplaceIndex = content.indexOf('{/* Right: Cart & Billing */}');
    
    if (endReplaceIndex !== -1 && startReplaceIndex < endReplaceIndex) {
        // Read the overviewContent from restore.js or just write a small script
        const prefix = content.substring(0, startReplaceIndex);
        const suffix = content.substring(endReplaceIndex);
        
        // I will copy the overviewContent string from restore.js
        const restoreScript = fs.readFileSync(path.join(__dirname, 'restore.js'), 'utf8');
        const contentMatch = restoreScript.match(/const overviewContent = `([\s\S]*?)`;/);
        
        if (contentMatch) {
            const overviewContent = contentMatch[1];
            content = prefix + '\n' + overviewContent + '\n                  ' + suffix;
            fs.writeFileSync(filePath, content);
            console.log("Successfully cleaned and restored!");
        }
    }
}

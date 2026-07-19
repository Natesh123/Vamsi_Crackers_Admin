const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// I am going to find the exact line indices.
const lines = content.split('\n');

// Find the last line of the stat card: `                      </div>`
// which is line 1220.
// Then find `{/* Right: Cart & Billing */}` which is line 1227.

let statCardEndLine = -1;
let cartBillingLine = -1;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('{"sub" in stat && (')) {
        // The stat card end is a few lines below
        statCardEndLine = i + 3; // line 1219 is </div>, 1220 is </div>
    }
    if (lines[i].includes('{/* Right: Cart & Billing */}')) {
        cartBillingLine = i;
        break;
    }
}

if (statCardEndLine !== -1 && cartBillingLine !== -1 && statCardEndLine < cartBillingLine) {
    const prefix = lines.slice(0, statCardEndLine + 1).join('\n');
    const suffix = lines.slice(cartBillingLine).join('\n');
    
    // Read the overviewContent from restore.js
    const restoreScript = fs.readFileSync(path.join(__dirname, 'restore.js'), 'utf8');
    const contentMatch = restoreScript.match(/const overviewContent = `([\s\S]*?)`;/);
    
    if (contentMatch) {
        const overviewContent = contentMatch[1];
        
        // We must also CLOSE the stat card loop which was left open!
        const closeStatCards = `                    ))}
                  </div>`;
        
        content = prefix + '\n' + closeStatCards + '\n' + overviewContent + '\n' + suffix;
        fs.writeFileSync(filePath, content);
        console.log("Successfully rebuilt the entire section!");
    } else {
        console.log("Could not extract overviewContent");
    }
} else {
    console.log("Could not find line indices.", statCardEndLine, cartBillingLine);
}

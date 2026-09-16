const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/admin/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// --- 1. Fix Stat Cards ---
// Remove the current messy stat card interior
content = content.replace(
    /<div className="flex justify-between items-start mb-4">[\s\S]*?(?=<\/div>\s*<\/div>\s*\)\)\}\s*<\/div>)/g,
    (match) => {
        // We need to replace the content inside the stat card map.
        // Actually, it's safer to just replace the whole map body.
        return match;
    }
);

// Let's accurately target the stat card map body
content = content.replace(
    /<div key=\{i\} className=\{`bg-white border border-slate-200 rounded-xl p-6 relative group transition-all duration-200 hover:shadow-md hover:border-blue-300 hover:-translate-y-0\.5`\}>[\s\S]*?\{"sub" in stat && \([\s\S]*?\}<\/div>/g,
    `<div key={i} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                           <span className="text-6xl">{stat.icon}</span>
                        </div>
                        <div className="flex justify-between items-center mb-4 relative z-10">
                          <span className="text-slate-500 font-semibold text-sm">
                            {stat.label}
                          </span>
                          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shadow-sm border border-slate-100">
                            <span className="text-sm">{stat.icon}</span>
                          </div>
                        </div>
                        <div className="relative z-10">
                          <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{stat.value}</h3>
                          {"sub" in stat && (
                            <p className="text-slate-500 text-xs mt-1 truncate font-medium">{stat.sub}</p>
                          )}
                        </div>
                      </div>`
);

// --- 2. Fix Category Share Progress Bars ---
content = content.replace(
    /<div className="w-full bg-slate-100 h-1\.5 rounded-full overflow-hidden">/g,
    '<div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden shadow-inner">'
);
content = content.replace(
    /<span className="font-bold text-slate-600">\{cat\.name\}<\/span>/g,
    '<span className="font-semibold text-slate-700">{cat.name}</span>'
);
content = content.replace(
    /<span className="font-black text-blue-600">\{count\} products \(\{percentage\}%\)<\/span>/g,
    '<span className="font-bold text-slate-900">{count} <span className="text-slate-400 font-normal">({percentage}%)</span></span>'
);
content = content.replace(
    /className="bg-blue-500 h-full rounded-full transition-all duration-500"/g,
    'className="bg-slate-900 h-full rounded-full transition-all duration-500"'
);


// --- 3. Fix Quick Management Inner Boxes ---
content = content.replace(
    /bg-white p-4 rounded-xl border border-slate-100/g,
    'bg-slate-50 p-4 rounded-xl border border-slate-200'
);
content = content.replace(
    /bg-slate-50 p-2\.5 rounded-lg border border-slate-100/g,
    'bg-white p-3 rounded-lg border border-slate-200 shadow-sm'
);

// Enhance Typography for inner boxes
content = content.replace(
    /text-xs font-black uppercase text-blue-600 mb-1/g,
    'text-xs font-bold text-slate-900 mb-1'
);

// --- 4. Fix Primary Buttons ---
// Change Add Product blue button to Apple/Vercel style black button
content = content.replace(
    /bg-blue-600 text-white font-bold rounded-lg shadow-sm hover:bg-blue-700 transition-colors/g,
    'bg-slate-900 text-white font-semibold rounded-lg shadow-md hover:bg-slate-800 transition-all hover:shadow-lg hover:-translate-y-0.5'
);
// Fix the text styling inside the big blue buttons (they were uppercase, font-black, etc)
content = content.replace(
    /className="py-3 rounded-xl bg-blue-600 text-slate-900 font-bold text-xs uppercase tracking-widest hover:-translate-y-0\.5 hover:shadow-lg transition-all text-center"/g,
    'className="py-3 rounded-xl bg-slate-900 text-white font-bold text-sm hover:-translate-y-0.5 hover:shadow-lg transition-all text-center shadow-md"'
);
content = content.replace(
    /className="flex-1 md:flex-none px-6 py-3 rounded-xl bg-blue-600 text-slate-900 font-bold text-xs uppercase tracking-widest hover:-translate-y-0\.5 hover:shadow-lg transition-all shadow-md"/g,
    'className="flex-1 md:flex-none px-6 py-3 rounded-xl bg-slate-900 text-white font-bold text-sm hover:-translate-y-0.5 hover:shadow-lg transition-all shadow-md"'
);
content = content.replace(
    /className="flex-1 md:flex-none px-6 py-3 rounded-xl bg-blue-600 text-[#0d0415] font-bold text-xs uppercase tracking-widest hover:-translate-y-0\.5 hover:shadow-lg transition-all shadow-md shadow-orange-500\/30"/g,
    'className="flex-1 md:flex-none px-6 py-3 rounded-xl bg-slate-900 text-white font-bold text-sm hover:-translate-y-0.5 hover:shadow-lg transition-all shadow-md"'
);
// General fallback for any remaining blue buttons in admin area
content = content.replace(
    /bg-blue-600/g,
    'bg-slate-900'
);
content = content.replace(
    /text-blue-600/g,
    'text-slate-900'
);
content = content.replace(
    /text-blue-700 bg-blue-50/g,
    'text-slate-900 bg-slate-100'
);
content = content.replace(
    /border-blue-100/g,
    'border-slate-200'
);
content = content.replace(
    /bg-blue-500/g,
    'bg-slate-900'
);

// Fix the active tab in sidebar which is currently blue
content = content.replace(
    /activeTab === tab.id\s*\?\s*"bg-slate-900 text-white shadow-md shadow-blue-500\/20"/g,
    'activeTab === tab.id ? "bg-slate-800 text-white shadow-sm" '
);

// Remove the text-[#0d0415] which looks broken on dark buttons
content = content.replace(/text-\[#0d0415\]/g, 'text-white');
content = content.replace(/text-slate-900 font-black text-xs uppercase/g, 'text-white font-bold text-sm');

// Soften borders globally for panels
content = content.replace(
    /className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm/g,
    'className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm'
);
content = content.replace(
    /className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 shadow-\[0_8px_30px_rgb\(0,0,0,0\.04\)\] transition-all"/g,
    'className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm transition-all"'
);

// Make headings less aggressive (tracking-wider -> tracking-tight)
content = content.replace(/tracking-widest/g, 'tracking-tight');
content = content.replace(/tracking-wider/g, 'tracking-tight');
content = content.replace(/uppercase/g, ''); // Remove aggressive uppercase from headings

fs.writeFileSync(filePath, content);
console.log("Ultimate Precision Refinement Applied!");

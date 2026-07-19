const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/admin/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Refine Sidebar Active State
content = content.replace(
    /activeTab === tab.id\s*\?\s*"bg-slate-800 text-white"/g,
    'activeTab === tab.id\n                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"'
);

// Refine Stats Cards to look extremely clean and modern
// Remove the big background gradients from the stat cards, keep them pure white
content = content.replace(
    /<div className={`absolute inset-0 bg-gradient-to-br \${stat\.color} opacity-[^<]+<\/div>/g,
    ''
);
// Make the icon smaller and placed top right instead of giant watermark
content = content.replace(
    /<div className="text-4xl absolute right-0 bottom-0 opacity-20[^<]+<\/div>/g,
    ''
);
// Completely rewrite the stat card interior for a super premium look
content = content.replace(
    /<div className="relative z-10">\s*<span className="text-slate-500 font-black uppercase tracking-widest text-\[10px\] mb-2 block drop-shadow-md">\s*\{stat\.label\}\s*<\/span>\s*<h3 className="text-3xl font-black text-slate-900 drop-shadow-lg">\{stat\.value\}<\/h3>\s*\{"sub" in stat && \(\s*<p className="text-slate-500 text-xs mt-2 line-clamp-1 font-medium">\{stat\.sub\}<\/p>\s*\)\}\s*<\/div>/g,
    `<div className="flex justify-between items-start mb-4">
                            <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                              {stat.label}
                            </span>
                            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-lg shadow-sm border border-slate-100">
                              {stat.icon}
                            </div>
                          </div>
                          <h3 className="text-2xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
                          {"sub" in stat && (
                            <p className="text-slate-500 text-xs mt-1 truncate font-medium">{stat.sub}</p>
                          )}`
);

// Fix the Drop shadow text in other places (drop-shadow makes text look messy in a clean theme)
content = content.replace(/drop-shadow-lg/g, '');
content = content.replace(/drop-shadow-md/g, '');
content = content.replace(/drop-shadow-2xl/g, '');
content = content.replace(/drop-shadow-sm/g, '');

// Enhance panels (Quick Management, Category Share) to use tracking-tight on headers for that premium SaaS feel
content = content.replace(
    /text-lg font-black text-slate-900 uppercase tracking-wider mb-6/g,
    'text-base font-black text-slate-900 uppercase tracking-widest mb-6'
);

// Smooth out button hover states
content = content.replace(
    /hover:scale-\[1\.02\]/g,
    'hover:-translate-y-0.5 hover:shadow-lg'
);

// Soften borders
content = content.replace(/border-slate-300/g, 'border-slate-200');

fs.writeFileSync(filePath, content);
console.log("Enterprise Theme Refined!");

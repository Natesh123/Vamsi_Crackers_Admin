const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/admin/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const authStartIndex = content.indexOf('return (', content.indexOf('if (!isAuthenticated)'));
if (authStartIndex === -1) {
    console.error("Could not find start of authenticated return block.");
    process.exit(1);
}

let preAuth = content.substring(0, authStartIndex);
let postAuth = content.substring(authStartIndex);

// Clean up all background and text colors to a pristine Light Theme
const replacements = [
    // 1. Main Background
    [/className="min-h-screen [^"]+"/g, 'className="min-h-screen bg-slate-50 text-slate-800 font-[\'Outfit\'] antialiased relative overflow-hidden"'],
    // 2. Remove messy ambient orbs
    [/<div className="absolute top-\[-10%\] left-\[-10%\].*?<\/div>/g, ''],
    [/<div className="absolute bottom-\[-10%\] right-\[-10%\].*?<\/div>/g, ''],
    // 3. Header
    [/<header className="bg-white\/[0-9]+ backdrop-blur-[^"]+"/g, '<header className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-40 py-4 px-6 lg:px-12 flex justify-between items-center shadow-sm"'],
    // 4. Sidebar Container
    [/<div className="sticky top-8 bg-[^"]+ min-h-\[calc\(100vh-140px\)\][^"]+"/g, '<div className="sticky top-8 bg-white border border-slate-200 rounded-3xl p-5 flex flex-row lg:flex-col gap-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] min-h-[calc(100vh-140px)] lg:min-h-[600px] overflow-hidden"'],
    [/<div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-amber-100\/30 to-transparent pointer-events-none"><\/div>/g, ''],
    // 5. Stat Cards
    [/className={`bg-white\/[0-9]+ backdrop-blur-[^`]+`}/g, 'className={`bg-white border border-slate-200 rounded-3xl p-6 relative overflow-hidden group hover:border-amber-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1`}'],
    // 6. Generic Panels (Category Share, Quick Management, etc.)
    [/className="bg-white\/[0-9]+ backdrop-blur-[^"]+ rounded-3xl/g, 'className="bg-white border border-slate-200 rounded-3xl'],
    [/shadow-\[0_10px_40px_rgba\(0,0,0,0\.0[0-9]\)\]/g, 'shadow-[0_8px_30px_rgb(0,0,0,0.04)]'],
    // 7. Table Containers
    [/className="bg-white\/[0-9]+ backdrop-blur-[^"]+ rounded-3xl overflow-hidden/g, 'className="bg-white border border-slate-200 rounded-3xl overflow-hidden'],
    // 8. Text colors
    [/\btext-slate-800\b/g, 'text-slate-900'],
    [/\btext-slate-500\b/g, 'text-slate-500'],
    [/\btext-amber-950\b/g, 'text-amber-950'],
    // Ensure table headers and borders are clean
    [/\bbg-slate-50\/50\b/g, 'bg-slate-50'],
    [/\bdivide-slate-[0-9]+\b/g, 'divide-slate-100'],
    // Modals (if any were touched)
    [/\bbg-[#130620]\/80\b/g, 'bg-white'],
];

replacements.forEach(([pattern, replacement]) => {
    postAuth = postAuth.replace(pattern, replacement);
});

// A few precise targeted replacements for the menu items to ensure they look good
postAuth = postAuth.replace(/text-amber-900 shadow-md shadow-amber-500\/20/g, "text-amber-950 shadow-sm shadow-amber-500/20");
postAuth = postAuth.replace(/from-amber-300 via-amber-400 to-amber-500/g, "from-amber-400 to-amber-500");

fs.writeFileSync(filePath, preAuth + postAuth);
console.log("Premium Light Theme applied successfully!");

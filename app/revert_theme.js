const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'admin/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const authStartIndex = content.indexOf('return (');
if (authStartIndex === -1) {
    console.error("Could not find start of authenticated return block.");
    process.exit(1);
}

let preAuth = content.substring(0, authStartIndex);
let postAuth = content.substring(authStartIndex);

// Reverse Replacements for the main layout
const reverseReplacements = [
    // Nav tabs
    ['bg-emerald-50 text-emerald-800 shadow-sm shadow-emerald-500/10 border border-emerald-100', 'bg-slate-800 text-white shadow-md shadow-slate-900/50'],
    ['text-slate-500 hover:text-emerald-700 hover:bg-emerald-50/50', 'text-slate-400 hover:text-white hover:bg-slate-800/50'],
    
    // Sidebar
    ['bg-white border-r border-slate-200 text-slate-600', 'bg-[#1e293b] text-slate-300'],
    ['border-b border-slate-100 mb-4', 'border-b border-slate-700/50 mb-4'],
    ['text-emerald-950 tracking-tighter', 'text-white tracking-tighter'],
    ['text-emerald-600 tracking-tight uppercase', 'text-blue-400 tracking-tight'],
    ['text-slate-400 mb-2 mt-2', 'text-slate-500 mb-2 mt-2'],

    // Banner
    ['bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800', 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900'],
    ['shadow-emerald-900/20 border border-emerald-500/20', 'shadow-indigo-900/20 border border-indigo-500/20'],
    ['bg-emerald-400 rounded-full', 'bg-blue-500 rounded-full'],
    ['bg-teal-400 rounded-full', 'bg-indigo-500 rounded-full'],

    // Cards and Containers
    [/\bbg-white border border-slate-200 rounded-\[2rem\]\b/g, 'bg-white border border-slate-200 rounded-3xl'],

    // Global Action Buttons
    [/\bbg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-emerald-500\/30\b/g, 'bg-slate-900 hover:bg-black'],
    [/\bbg-gradient-to-r from-emerald-600 to-emerald-500 hover:-translate-y-0.5\b/g, 'bg-slate-900 hover:-translate-y-0.5'],
    [/\bbg-emerald-600 text-white\b/g, 'bg-slate-900 text-white'],

    // Table Headers
    [/\bbg-emerald-50\/50 border-b border-slate-200\b/g, 'bg-slate-50 border-b border-slate-200'],
    [/\bbg-emerald-50\/50 text-emerald-800 uppercase\b/g, 'bg-slate-50 text-slate-500 uppercase'],
    [/\btext-emerald-800 font-bold uppercase\b/g, 'text-slate-500 font-bold uppercase'],
    [/\btext-emerald-800 uppercase\b/g, 'text-slate-500 uppercase'],

    // Text emphasis
    [/\btext-emerald-950 font-black\b/g, 'text-slate-900 font-black'],
    
    // Quick Fixes for inputs
    [/\bfocus:border-emerald-500 focus:ring-4 focus:ring-emerald-500\/10\b/g, 'focus:border-festive-gold/50'],

    // Generic Modal backdrop from dark purple
    [/\bbg-slate-900\/60\b/g, 'bg-[#07010e]/80'],
    
    // Some manual replacements that might have collided or weren't perfectly matched in regex
    ['bg-emerald-50 text-emerald-700', 'bg-festive-purple text-slate-900'],
    ['border-emerald-200 hover:border-emerald-300', 'border-festive-gold/30 hover:border-festive-gold'],
    ['bg-emerald-50 text-emerald-800', 'bg-slate-900/15 text-slate-900'],
    ['border-emerald-500', 'border-festive-gold'],
    [/\bbg-emerald-50\/50\b/g, 'bg-slate-900/5'],
];

reverseReplacements.forEach(([pattern, replacement]) => {
    if (typeof pattern === 'string') {
        postAuth = postAuth.split(pattern).join(replacement);
    } else {
        postAuth = postAuth.replace(pattern, replacement);
    }
});

// For modal that I touched manually in the beginning!
// I also manually edited the product modal, replacing a large chunk of JSX.
// I don't want to revert the whole file without fixing the modal. But wait! The script replaces generic things.
// If I want to revert the modal too, I can just use git checkout if it was in git? No git.
// But the user didn't like the modal either maybe? "ethuku munadi iruntha blue color aey vachi kudu pls.." 
// "Please revert to the blue color that was there before".
// Let's just write the postAuth back and see.

fs.writeFileSync(filePath, preAuth + postAuth);
console.log("Reverted to original dark blue theme!");

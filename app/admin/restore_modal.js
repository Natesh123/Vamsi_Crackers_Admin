const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const categoryModal = `      {/* CATEGORY CREATION/EDIT MODAL */}
      <div id="add-category-modal" className="fixed inset-0 z-[60] bg-[#07010e]/80 backdrop-blur-md hidden items-center justify-center p-4 overflow-y-auto">
        <div className="bg-[#12081d] border border-slate-200 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-slideDown m-auto relative">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse pointer-events-none"></div>
          
          {/* Modal Header */}
          <div className="bg-white px-6 py-5 border-b border-slate-200 flex justify-between items-center relative z-10">
            <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              {editingCategory ? "✏️ Edit Category" : "➕ Add Category"}
            </h3>
            <button
              type="button"
              onClick={() => {
                document.getElementById("add-category-modal")?.classList.add("hidden");
                setEditingCategory(null);
                setNewCategoryName("");
                setEditCategoryName("");
              }}
              className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Modal Body / Form */}
          <form onSubmit={editingCategory ? handleUpdateCategory : handleAddCategory} className="p-6 space-y-6 bg-white relative z-10">
            <div>
              <label className="block text-sm font-bold tracking-widest uppercase text-slate-400 mb-2">Category Name (English)</label>
              <input
                type="text"
                required
                value={editingCategory ? editCategoryName : newCategoryName}
                onChange={(e) => editingCategory ? setEditCategoryName(e.target.value) : setNewCategoryName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-base text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-inner"
                placeholder="e.g. Flower Pots"
              />
              <p className="text-xs text-slate-400 mt-2 font-medium">Tamil translation will be automatically generated</p>
            </div>
            
            <div>
              <label className="block text-sm font-bold tracking-widest uppercase text-slate-400 mb-2">Tamil Translation (Auto)</label>
              <div className="relative">
                <input
                  type="text"
                  value={editingCategory ? editCatTamilTranslation : newCatTamilTranslation}
                  onChange={(e) => editingCategory ? setEditCatTamilTranslation(e.target.value) : setNewCatTamilTranslation(e.target.value)}
                  className="w-full bg-emerald-50/50 border border-emerald-100 rounded-xl px-4 py-3.5 text-base text-emerald-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-inner"
                  placeholder="e.g. மலர் பானைகள்"
                />
                {(isTranslatingNewCat || isTranslatingEditCat) && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <svg className="animate-spin h-5 w-5 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-6 mt-2 border-t border-slate-100 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  document.getElementById("add-category-modal")?.classList.add("hidden");
                  setEditingCategory(null);
                  setNewCategoryName("");
                  setEditCategoryName("");
                }}
                className="flex-[1] py-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 text-sm font-black tracking-tight transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-[2] py-3.5 rounded-xl bg-slate-900 hover:bg-black text-white text-sm font-black tracking-tight shadow-lg shadow-slate-900/20 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
              >
                {editingCategory ? "Save Changes" : "Create Category"}
              </button>
            </div>
          </form>
        </div>
      </div>
`;

content = content.replace(
  /\{\/\* PRODUCT CREATION\/EDIT MODAL \*\/\}/g,
  `${categoryModal}\n\n      {/* PRODUCT CREATION/EDIT MODAL */}`
);

fs.writeFileSync(filePath, content);
console.log("Category modal restored!");

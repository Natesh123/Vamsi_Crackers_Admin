const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add state variables
content = content.replace(
  /const \[orderToDelete, setOrderToDelete\] = useState<number \| null>\(null\);/,
  `const [orderToDelete, setOrderToDelete] = useState<number | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<{id: number, name: string} | null>(null);
  const [productToDelete, setProductToDelete] = useState<{id: number, name: string} | null>(null);`
);

// 2. Replace handleDeleteCategory with confirmDeleteCategory
const oldHandleDeleteCategory = `  const handleDeleteCategory = async (id: number, name: string) => {
    if (!confirm(\`Are you sure you want to delete category "\${name}"?\\nWARNING: All products in this category will also be deleted!\`)) {
      return;
    }`;

const newHandleDeleteCategory = `  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    const { id, name } = categoryToDelete;`;

content = content.replace(oldHandleDeleteCategory, newHandleDeleteCategory);

// Fix setCategories and toast success in confirmDeleteCategory to also clear state
content = content.replace(
  /showToast\("Category and its products deleted!", "success"\);/,
  `showToast("Category and its products deleted!", "success");
      setCategoryToDelete(null);`
);

// 3. Replace handleDeleteProduct with confirmDeleteProduct
const oldHandleDeleteProduct = `  const handleDeleteProduct = async (id: number, name: string) => {
    if (!confirm(\`Are you sure you want to delete product "\${name}"?\`)) return;`;

const newHandleDeleteProduct = `  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    const { id, name } = productToDelete;`;

content = content.replace(oldHandleDeleteProduct, newHandleDeleteProduct);

// Fix toast success in confirmDeleteProduct to also clear state
content = content.replace(
  /showToast\("Product deleted successfully!", "success"\);/,
  `showToast("Product deleted successfully!", "success");
      setProductToDelete(null);`
);

// 4. Update the onClick handlers
content = content.replace(
  /onClick=\{\(\) => handleDeleteCategory\(cat\.id, cat\.name\)\}/g,
  `onClick={() => setCategoryToDelete({id: cat.id, name: cat.name})}`
);

content = content.replace(
  /onClick=\{\(\) => handleDeleteProduct\(product\.id, product\.name\)\}/g,
  `onClick={() => setProductToDelete({id: product.id, name: product.name})}`
);


// 5. Add Modals
const modals = `
      {/* CATEGORY DELETE CONFIRMATION MODAL */}
      {categoryToDelete !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-[#0a0514]/90 backdrop-blur-xl animate-fadeIn" onClick={() => setCategoryToDelete(null)}></div>
          <div className="relative w-full max-w-sm bg-white rounded-3xl border border-slate-200 shadow-2xl shadow-red-500/20 overflow-hidden animate-slideUp">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-32 bg-red-500/20 blur-[60px] pointer-events-none"></div>
            
            <div className="p-8 text-center relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto mb-6 border border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8 text-red-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">Delete Category?</h3>
              <p className="text-slate-500 text-base mb-8 leading-relaxed">
                Are you sure you want to delete <strong className="text-slate-900">"{categoryToDelete.name}"</strong>? All products inside this category will also be removed. This cannot be undone.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setCategoryToDelete(null)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-900 font-bold text-sm tracking-tight hover:bg-white transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteCategory}
                  className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-slate-900 font-bold text-sm tracking-tight shadow-lg shadow-red-500/20 transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCT DELETE CONFIRMATION MODAL */}
      {productToDelete !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-[#0a0514]/90 backdrop-blur-xl animate-fadeIn" onClick={() => setProductToDelete(null)}></div>
          <div className="relative w-full max-w-sm bg-white rounded-3xl border border-slate-200 shadow-2xl shadow-red-500/20 overflow-hidden animate-slideUp">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-32 bg-red-500/20 blur-[60px] pointer-events-none"></div>
            
            <div className="p-8 text-center relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto mb-6 border border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8 text-red-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">Delete Product?</h3>
              <p className="text-slate-500 text-base mb-8 leading-relaxed">
                Are you sure you want to permanently delete <strong className="text-slate-900">"{productToDelete.name}"</strong>? This action cannot be undone.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setProductToDelete(null)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-900 font-bold text-sm tracking-tight hover:bg-white transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteProduct}
                  className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-slate-900 font-bold text-sm tracking-tight shadow-lg shadow-red-500/20 transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
`;

content = content.replace(
  /\{\/\* DELETE CONFIRMATION MODAL \*\/\}/g,
  `${modals}\n      {/* DELETE CONFIRMATION MODAL */}`
);

fs.writeFileSync(filePath, content);
console.log("Delete Modals Installed Successfully!");

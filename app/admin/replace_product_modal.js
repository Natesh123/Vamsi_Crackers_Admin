const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// The exact string starting the modal content
const startMarker = `{/* PRODUCT CREATION/EDIT MODAL */}\n      {isProductModalOpen && (\n        <div className="fixed inset-0 z-50 bg-[#07010e]/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">`;
const endMarker = `        </div>\n      )}`;

const productModalStartIndex = content.indexOf(`{/* PRODUCT CREATION/EDIT MODAL */}`);
if (productModalStartIndex === -1) {
  console.error("Could not find start marker");
  process.exit(1);
}

const restOfContent = content.substring(productModalStartIndex);
// Find the closing )} for the modal. 
// We know it's before "DELETE CONFIRMATION MODAL" or "TAB: ORDERS"
const tabOrdersIndex = restOfContent.indexOf(`{/* TAB: ORDERS */}`);
const sliceToSearch = restOfContent.substring(0, tabOrdersIndex);
const productModalEndIndex = sliceToSearch.lastIndexOf(`      )}`);

if (productModalEndIndex === -1) {
  console.error("Could not find end marker");
  process.exit(1);
}

const originalModalCode = sliceToSearch.substring(0, productModalEndIndex + 8); // includes "      )}\n"

const newModalCode = `{/* PRODUCT CREATION/EDIT MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#07010e]/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl animate-slideDown m-auto relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-[80px] opacity-10 animate-pulse pointer-events-none"></div>
            
            {/* Modal Header */}
            <div className="bg-white px-8 py-6 border-b border-slate-200 flex justify-between items-center relative z-10">
              <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                {editingProduct ? "✏️ Edit Product Details" : "➕ Add Product to Catalog"}
              </h3>
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleProductSubmit} className="p-8 space-y-8 bg-white relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-bold tracking-widest uppercase text-slate-400 mb-2">
                    Product Name (English)
                  </label>
                  <input
                    type="text"
                    required
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    onBlur={() => appendTamilTranslation(productName, productTamilTranslation, setProductName)}
                    placeholder="e.g. 1000 Wala Giant"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-base text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-inner"
                  />
                  {productTamilTranslation && (
                    <p className="mt-2 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 inline-block rounded-md animate-pulse">
                      ✨ Tamil Preview: {productTamilTranslation} (Auto-appended on save)
                    </p>
                  )}
                  {isTranslatingProduct && (
                    <div className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-400">
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Translating...
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold tracking-widest uppercase text-slate-400 mb-2">
                    Category Link
                  </label>
                  {categories.length === 0 ? (
                    <div className="text-red-500 bg-red-50 p-3 rounded-xl text-sm font-bold border border-red-100">
                      ⚠️ Please create a category first!
                    </div>
                  ) : (
                    <div className="relative">
                      <select
                        value={productCategoryId}
                        onChange={(e) => setProductCategoryId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-base text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-inner appearance-none cursor-pointer"
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                        ▼
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4 col-span-1 md:col-span-2 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <div>
                    <label className="block text-sm font-bold tracking-widest uppercase text-slate-400 mb-2">
                      Original Price (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={productOriginalPrice}
                      onChange={(e) => handleOriginalPriceChange(e.target.value)}
                      placeholder="250"
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-base text-slate-900 font-black focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold tracking-widest uppercase text-slate-400 mb-2 flex items-center justify-between">
                      Discount (%) <span className="text-xs text-red-400 normal-case bg-red-50 px-1.5 py-0.5 rounded">*Global</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      required
                      disabled
                      value={productDiscount}
                      onChange={(e) => handleDiscountChange(e.target.value)}
                      title="Discount is managed globally via the Global Discount tool"
                      className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3.5 text-base text-slate-500 font-black outline-none cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold tracking-widest uppercase text-slate-400 mb-2">
                      Offer Price (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={productPrice}
                      onChange={(e) => handleOfferPriceChange(e.target.value)}
                      placeholder="120"
                      className="w-full bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3.5 text-base text-emerald-700 font-black focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-inner"
                    />
                  </div>
                </div>
              </div>

              {/* Image Selection Section */}
              <div className="space-y-4">
                <label className="block text-sm font-bold tracking-widest uppercase text-slate-400 mb-2">
                  Product Image Media
                </label>
                
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {/* Left: Upload & Preview */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 bg-slate-50 rounded-2xl p-4 border border-slate-200 shadow-inner h-[130px]">
                      <div className="relative w-24 h-24 shrink-0 rounded-xl bg-white border border-slate-200 p-2 flex items-center justify-center shadow-sm">
                        {productImage ? (
                          <img
                            src={productImage}
                            alt="Product Preview"
                            className="max-w-full max-h-full object-contain drop-shadow-md"
                          />
                        ) : (
                          <span className="text-slate-400 text-sm font-bold">No Image</span>
                        )}
                      </div>
                      <div className="flex-grow space-y-2 overflow-hidden h-full flex flex-col justify-center">
                        <p className="text-xs font-bold tracking-widest uppercase text-slate-400">Current File</p>
                        <p className="text-xs text-slate-900 font-medium truncate bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm" title={productImage || "None Selected"}>
                          {productImage || "None Selected"}
                        </p>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm transition-all hover:border-blue-300">
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        disabled={uploadingImage}
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-3.5 rounded-xl bg-slate-900 text-white font-bold text-base tracking-tight hover:bg-black hover:shadow-lg shadow-slate-900/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {uploadingImage ? (
                          <>
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                            Upload Custom Image
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Right: Presets */}
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
                    <span className="text-xs font-bold tracking-widest uppercase text-slate-400 mb-3 block">Or Choose Preset Icon</span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 h-full pb-6 content-start">
                      {presetImages.map((img) => (
                        <button
                          key={img.label}
                          type="button"
                          onClick={() => setProductImage(img.path)}
                          className={\`py-2.5 px-2 rounded-xl border text-xs font-bold tracking-tight transition-all text-center flex flex-col items-center justify-center gap-1 \${
                            productImage === img.path
                              ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-500/50"
                              : "border-slate-200 bg-white hover:border-blue-300 text-slate-600 hover:text-slate-900 shadow-sm"
                          }\`}
                        >
                          {img.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-8 py-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-base font-bold tracking-tight text-slate-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-10 py-3.5 rounded-xl bg-blue-600 text-white font-black text-base tracking-tight hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {editingProduct ? "Save Changes" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
`;

content = content.replace(originalModalCode, newModalCode);

fs.writeFileSync(filePath, content);
console.log("Product Modal replaced successfully");

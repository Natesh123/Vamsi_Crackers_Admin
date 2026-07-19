const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const newCategories = `              {/* TAB: CATEGORIES */}
              {activeTab === "categories" && (
                <div className="space-y-6 animate-slideDown">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-y-1/2 translate-x-1/4"></div>
                    <div className="relative z-10">
                      <h2 className="text-3xl font-black text-slate-900 tracking-tight">Category Structure</h2>
                      <p className="text-slate-500 text-base mt-2 font-medium">Organize and manage your product groupings</p>
                    </div>
                    <button
                      onClick={() => { setEditingCategory(null); setNewCategoryName(""); setNewCatTamilTranslation(""); document.getElementById("add-category-modal")?.classList.remove("hidden"); }}
                      className="mt-4 sm:mt-0 px-8 py-4 rounded-2xl bg-slate-900 text-white font-bold text-base hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/20 transition-all flex items-center gap-3 relative z-10"
                    >
                      <span className="text-emerald-400">➕</span> Add New Category
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.length === 0 ? (
                       <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white border border-dashed border-slate-300 rounded-3xl">
                          <span className="text-6xl mb-4 opacity-50">📁</span>
                          <h3 className="text-xl font-bold text-slate-700">No categories yet</h3>
                          <p className="text-slate-500 mt-2 text-base">Create your first category to start organizing products.</p>
                       </div>
                    ) : (
                      categories.map(cat => (
                        <div key={cat.id} className="bg-white border border-slate-100 rounded-3xl p-6 flex flex-col shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-emerald-100 transition-all duration-300 group">
                          <div className="flex justify-between items-start mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/20 text-white transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                              🏷️
                            </div>
                            <div className="flex gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
                               <button onClick={() => editCategory(cat)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Edit">✏️</button>
                               <button onClick={() => deleteCategory(cat.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete">🗑️</button>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-lg font-black text-slate-900 tracking-tight">{cat.name}</h4>
                            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                              <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Inventory</span>
                              <span className="px-3 py-1 bg-slate-100 text-slate-700 font-black text-sm rounded-full">
                                {products.filter(p => p.categoryId === cat.id).length} Items
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}`;

const newProducts = `              {/* TAB: PRODUCTS */}
              {activeTab === "products" && (
                <div className="space-y-6 animate-slideDown">
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-y-1/2 translate-x-1/4"></div>
                    <div className="relative z-10">
                      <h2 className="text-3xl font-black text-slate-900 tracking-tight">Master Catalog</h2>
                      <p className="text-slate-500 text-base mt-2 font-medium">Browse and manage {products.length} products</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto relative z-10">
                      <button
                        onClick={() => setShowGlobalDiscountModal(true)}
                        className="flex-1 lg:flex-none px-6 py-4 rounded-2xl bg-white border border-slate-200 text-slate-900 font-bold text-base hover:bg-slate-50 hover:-translate-y-1 transition-all shadow-sm flex items-center justify-center gap-2"
                      >
                        <span className="text-amber-500">🏷️</span> Global Discount
                      </button>
                      <button
                        onClick={() => { setEditingProduct(null); setProductName(""); setProductPrice(""); setProductOriginalPrice(""); setProductDiscount(""); setProductCategoryId(""); setProductImage(""); setProductTamilTranslation(""); setIsProductModalOpen(true); }}
                        className="flex-1 lg:flex-none px-8 py-4 rounded-2xl bg-slate-900 text-white font-bold text-base hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/20 transition-all flex items-center justify-center gap-3"
                      >
                        <span className="text-blue-400">➕</span> Add Product
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 mb-8 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex-1 relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                      <input type="text" placeholder="Search by product name..." value={productSearch} onChange={e => setProductSearch(e.target.value)} className="w-full bg-slate-50 border-none rounded-xl pl-12 pr-4 py-3.5 text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all" />
                    </div>
                    <div className="sm:w-64 relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">📁</span>
                      <select value={productFilter} onChange={e => setProductFilter(e.target.value)} className="w-full bg-slate-50 border-none rounded-xl pl-12 pr-4 py-3.5 text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all appearance-none">
                        <option value="All">All Categories</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()) && (productFilter === "All" || p.categoryId.toString() === productFilter)).map(product => (
                      <div key={product.id} className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-blue-100 transition-all duration-300 group flex flex-col">
                        <div className="relative h-56 bg-gradient-to-b from-slate-50 to-white w-full p-6 flex items-center justify-center border-b border-slate-50 group-hover:bg-blue-50/30 transition-colors">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="max-h-full object-contain group-hover:scale-110 drop-shadow-md transition-transform duration-500 ease-out" />
                          ) : (
                            <span className="text-6xl opacity-30 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all">📦</span>
                          )}
                          {product.originalPrice > product.price && (
                            <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg shadow-red-500/30 animate-pulse">
                              Sale
                            </div>
                          )}
                        </div>
                        <div className="p-6 flex flex-col flex-1 relative">
                           <div className="absolute top-0 right-6 -translate-y-1/2 bg-slate-900 text-white font-black text-base px-4 py-2 rounded-xl shadow-lg border border-slate-700">
                             ₹{product.price}
                           </div>
                           
                           <p className="text-sm font-bold text-blue-500 mb-2 uppercase tracking-wider">{categories.find(c => c.id === product.categoryId)?.name || "Uncategorized"}</p>
                           <h4 className="font-bold text-slate-900 text-lg line-clamp-2 leading-tight mb-4">{product.name}</h4>
                           
                           {product.originalPrice > product.price && (
                             <div className="flex items-center gap-2 mb-4 text-sm font-medium">
                               <span className="text-slate-400">Regular:</span>
                               <span className="text-slate-500 line-through">₹{product.originalPrice}</span>
                               <span className="text-emerald-500 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">Save ₹{(product.originalPrice - product.price).toFixed(0)}</span>
                             </div>
                           )}
                           
                           <div className="mt-auto flex gap-2 border-t border-slate-100 pt-5">
                             <button onClick={() => editProduct(product)} className="flex-1 py-2.5 bg-slate-50 text-slate-700 border border-slate-100 rounded-xl text-sm font-bold hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all">Edit Details</button>
                             <button onClick={() => deleteProduct(product.id)} className="w-12 bg-red-50 text-red-500 border border-red-100 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white hover:border-red-500 transition-all">🗑️</button>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}`;

const newOrders = `              {/* TAB: ORDERS */}
              {activeTab === "orders" && (
                <div className="space-y-6 animate-slideDown">
                  <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-y-1/2 translate-x-1/4"></div>
                    <div className="relative z-10">
                      <h2 className="text-3xl font-black text-slate-900 tracking-tight">Order Management</h2>
                      <p className="text-slate-500 text-base mt-2 font-medium">Review and process recent customer purchases</p>
                    </div>
                    <div className="relative z-10 bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-0.5">Total Volume</p>
                        <p className="text-xl font-black text-slate-900">{orders.length} Orders</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50/80 border-b border-slate-100">
                            <th className="px-6 py-5 text-sm font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Order ID</th>
                            <th className="px-6 py-5 text-sm font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Customer Info</th>
                            <th className="px-6 py-5 text-sm font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Date & Time</th>
                            <th className="px-6 py-5 text-sm font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Amount</th>
                            <th className="px-6 py-5 text-sm font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {orders.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="py-20 text-center">
                                <div className="flex flex-col items-center justify-center opacity-50">
                                  <span className="text-6xl mb-4">🛒</span>
                                  <p className="text-slate-500 font-bold">No orders found.</p>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            orders.map(order => (
                              <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-5">
                                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-black text-sm border border-slate-200 group-hover:border-slate-300 transition-colors">
                                    #{order.id}
                                  </div>
                                </td>
                                <td className="px-6 py-5">
                                  <div className="font-bold text-slate-900 text-base mb-1">{order.customerName || "Walk-in Customer"}</div>
                                  <div className="text-sm text-slate-500 flex items-center gap-2">
                                    {order.customerPhone && <span>📞 {order.customerPhone}</span>}
                                  </div>
                                </td>
                                <td className="px-6 py-5">
                                  <div className="text-base font-medium text-slate-700">{new Date(order.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                  <div className="text-sm text-slate-400 mt-1">{new Date(order.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</div>
                                </td>
                                <td className="px-6 py-5">
                                  <div className="font-black text-slate-900 text-lg">₹{order.totalAmount}</div>
                                  <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-100">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                    Completed
                                  </div>
                                </td>
                                <td className="px-6 py-5 text-right">
                                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => setViewingOrder(order)} className="px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-900 hover:text-white hover:border-slate-900 shadow-sm transition-all">
                                      View Details
                                    </button>
                                    <button onClick={() => setOrderToDelete(order.id)} className="w-10 h-10 bg-white text-red-500 border border-slate-200 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white hover:border-red-500 shadow-sm transition-all">
                                      🗑️
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}`;

const regexCategories = /\{\/\* TAB: CATEGORIES \*\/\}([\s\S]*?)\{\/\* TAB: PRODUCTS \*\/\}/g;
content = content.replace(regexCategories, `${newCategories}\n\n              {/* TAB: PRODUCTS */}`);

const regexProducts = /\{\/\* TAB: PRODUCTS \*\/\}([\s\S]*?)\{\/\* TAB: ORDERS \*\/\}/g;
content = content.replace(regexProducts, `${newProducts}\n\n              {/* TAB: ORDERS */}`);

const regexOrders = /\{\/\* TAB: ORDERS \*\/\}([\s\S]*?)\{\/\* TAB: CUSTOMERS \*\/\}/g;
content = content.replace(regexOrders, `${newOrders}\n\n              {/* TAB: CUSTOMERS */}`);

fs.writeFileSync(filePath, content);
console.log("Upgraded Tabs!");

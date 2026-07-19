const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const overviewContent = `
                  {/* Quick Activity & Overview Details */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                    {/* Category Share */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm transition-all">
                      <h3 className="text-base font-black text-slate-900 tracking-tight mb-6 border-b border-slate-200 pb-4">
                        Category Share
                      </h3>
                      {categories.length === 0 ? (
                        <p className="text-slate-500 italic text-base">No categories created yet.</p>
                      ) : (
                        <div className="space-y-4">
                          {categories.map((cat) => {
                            const count = products.filter((p) => p.categoryId === cat.id).length;
                            const percentage = totalProducts ? Math.round((count / totalProducts) * 100) : 0;
                            return (
                              <div key={cat.id} className="space-y-1.5">
                                <div className="flex justify-between text-base">
                                  <span className="font-semibold text-slate-700">{cat.name}</span>
                                  <span className="font-bold text-slate-900">{count} <span className="text-slate-400 font-normal">({percentage}%)</span></span>
                                </div>
                                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden shadow-inner">
                                  <div
                                    className="bg-slate-900 h-full rounded-full transition-all duration-500"
                                    style={{ width: \`\${percentage}%\` }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Quick Management */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm transition-all flex flex-col">
                      <h3 className="text-base font-black text-slate-900 tracking-tight mb-6 border-b border-slate-200 pb-4">
                        Quick Management
                      </h3>
                      <p className="text-slate-500 text-base mb-6 leading-relaxed">
                        Welcome to the Crackers City Admin dashboard. Use the controls below to quickly add products, upload high-definition images, or view metrics.
                      </p>
                      <div className="space-y-4 mb-8">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-start gap-4 shadow-sm">
                          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm text-xl flex-shrink-0">
                            💡
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 mb-1">Image Upload Tip</h4>
                            <p className="text-slate-500 text-sm">For best performance, upload webp or png files under 2MB size.</p>
                          </div>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-start gap-4 shadow-sm">
                          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm text-xl flex-shrink-0">
                            📦
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 mb-1">Categories Connection</h4>
                            <p className="text-slate-500 text-sm">Products are automatically grouped by category on the homepage store catalogue.</p>
                          </div>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm">
                          <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                            <span>📋</span> Price List PDF Manager
                          </h4>
                          <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                            {priceListUrl ? (
                              <a href={priceListUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-2">
                                📄 View Price List
                              </a>
                            ) : (
                              <span className="text-sm text-slate-400 italic">No price list available</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                          onClick={() => { setEditingProduct(null); setProductName(""); setProductPrice(""); setProductOriginalPrice(""); setProductDiscount(""); setProductCategoryId(""); setProductImage(""); setProductTamilTranslation(""); setIsProductModalOpen(true); }}
                          className="py-3 rounded-xl bg-slate-900 text-white font-bold text-base hover:-translate-y-0.5 hover:shadow-lg transition-all text-center shadow-md flex items-center justify-center gap-2"
                        >
                          <span className="opacity-80">➕</span> Add Product
                        </button>
                        <button
                          onClick={() => { setEditingCategory(null); setNewCategoryName(""); setNewCatTamilTranslation(""); document.getElementById("add-category-modal")?.classList.remove("hidden"); }}
                          className="py-3 rounded-xl bg-white border border-slate-200 text-slate-900 font-bold text-base hover:bg-slate-50 hover:-translate-y-0.5 hover:shadow-sm transition-all text-center shadow-sm flex items-center justify-center gap-2"
                        >
                          <span className="opacity-80">🏷️</span> Add Category
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: CATEGORIES */}
              {activeTab === "categories" && (
                <div className="space-y-6 animate-slideDown">
                  <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">Categories</h2>
                      <p className="text-slate-500 text-base mt-1">Manage your store's product categories</p>
                    </div>
                    <button
                      onClick={() => { setEditingCategory(null); setNewCategoryName(""); setNewCatTamilTranslation(""); document.getElementById("add-category-modal")?.classList.remove("hidden"); }}
                      className="px-6 py-3 rounded-xl bg-slate-900 text-white font-bold text-base hover:-translate-y-0.5 hover:shadow-lg transition-all shadow-md flex items-center gap-2"
                    >
                      <span className="opacity-80">➕</span> Add Category
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.length === 0 ? (
                       <div className="col-span-full py-12 text-center bg-white border border-slate-200 rounded-2xl shadow-sm">
                          <p className="text-slate-500 italic">No categories found.</p>
                       </div>
                    ) : (
                      categories.map(cat => (
                        <div key={cat.id} className="bg-white border border-slate-200 rounded-2xl p-6 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-2xl shadow-sm border border-slate-100">🏷️</div>
                            <div>
                              <h4 className="font-bold text-slate-900">{cat.name}</h4>
                              <p className="text-sm text-slate-500">{products.filter(p => p.categoryId === cat.id).length} Products</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                             <button onClick={() => editCategory(cat)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">✏️</button>
                             <button onClick={() => deleteCategory(cat.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">🗑️</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB: PRODUCTS */}
              {activeTab === "products" && (
                <div className="space-y-6 animate-slideDown">
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">Product Catalog</h2>
                      <p className="text-slate-500 text-base mt-1">Manage all {products.length} products</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                      <button
                        onClick={() => setShowGlobalDiscountModal(true)}
                        className="flex-1 lg:flex-none px-6 py-3 rounded-xl bg-slate-100 text-slate-900 font-bold text-base hover:bg-slate-200 hover:-translate-y-0.5 transition-all shadow-sm flex items-center justify-center gap-2"
                        title="Discount is managed globally via the Global Discount tool"
                      >
                        <span className="opacity-80">🏷️</span> Global Discount
                      </button>
                      <button
                        onClick={() => { setEditingProduct(null); setProductName(""); setProductPrice(""); setProductOriginalPrice(""); setProductDiscount(""); setProductCategoryId(""); setProductImage(""); setProductTamilTranslation(""); setIsProductModalOpen(true); }}
                        className="flex-1 lg:flex-none px-6 py-3 rounded-xl bg-slate-900 text-white font-bold text-base hover:-translate-y-0.5 hover:shadow-lg transition-all shadow-md flex items-center justify-center gap-2"
                      >
                        <span className="opacity-80">➕</span> Add Product
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-4 mb-6">
                    <input type="text" placeholder="Search products..." value={productSearch} onChange={e => setProductSearch(e.target.value)} className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-slate-900" />
                    <select value={productFilter} onChange={e => setProductFilter(e.target.value)} className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-slate-900 w-48">
                      <option value="All">All Categories</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()) && (productFilter === "All" || p.categoryId.toString() === productFilter)).map(product => (
                      <div key={product.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all group flex flex-col">
                        <div className="relative h-48 bg-slate-50 w-full p-4 flex items-center justify-center border-b border-slate-100">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="max-h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                          ) : (
                            <span className="text-4xl">📦</span>
                          )}
                        </div>
                        <div className="p-5 flex flex-col flex-1">
                           <h4 className="font-bold text-slate-900 line-clamp-2 leading-tight mb-2">{product.name}</h4>
                           <div className="flex items-end gap-2 mb-4">
                             <span className="text-lg font-black text-slate-900">₹{product.price}</span>
                             {product.originalPrice > product.price && <span className="text-sm text-slate-400 line-through mb-0.5">₹{product.originalPrice}</span>}
                           </div>
                           <div className="mt-auto flex gap-2 border-t border-slate-100 pt-4">
                             <button onClick={() => editProduct(product)} className="flex-1 py-2 bg-slate-50 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-100 transition-colors">Edit</button>
                             <button onClick={() => deleteProduct(product.id)} className="w-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center hover:bg-red-100 transition-colors">🗑️</button>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB: ORDERS */}
              {activeTab === "orders" && (
                <div className="space-y-6 animate-slideDown">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Customer Orders</h2>
                    <p className="text-slate-500 text-base mt-1">Review and manage recent purchases</p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="p-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Order ID</th>
                            <th className="p-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                            <th className="p-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Date</th>
                            <th className="p-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Total</th>
                            <th className="p-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-slate-500 italic">No orders found.</td></tr>
                          ) : (
                            orders.map(order => (
                              <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                <td className="p-4 font-bold text-slate-900">#{order.id}</td>
                                <td className="p-4 text-base text-slate-700">{order.customerName || "Walk-in"}</td>
                                <td className="p-4 text-base text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                                <td className="p-4 font-bold text-slate-900">₹{order.totalAmount}</td>
                                <td className="p-4 flex gap-2">
                                  <button onClick={() => setViewingOrder(order)} className="px-3 py-1 bg-slate-100 text-slate-700 rounded text-sm font-bold hover:bg-slate-200">View</button>
                                  <button onClick={() => setOrderToDelete(order.id)} className="px-3 py-1 bg-red-50 text-red-600 rounded text-sm font-bold hover:bg-red-100">Delete</button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: CUSTOMERS */}
              {activeTab === "customers" && (
                <div className="space-y-6 animate-slideDown">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Customers</h2>
                    <p className="text-slate-500 text-base mt-1">Directory of customers from orders</p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm p-8 text-center">
                      <div className="text-6xl mb-4 opacity-50">👥</div>
                      <h3 className="text-lg font-bold text-slate-900">Customer Directory</h3>
                      <p className="text-slate-500 text-base mt-2">The customer directory is automatically populated from order history.</p>
                  </div>
                </div>
              )}

              {/* TAB: REPORTS */}
              {activeTab === "reports" && (
                <div className="space-y-6 animate-slideDown">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Sales Reports</h2>
                    <p className="text-slate-500 text-base mt-1">Analytics and revenue tracking</p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm p-8 text-center">
                      <div className="text-6xl mb-4 opacity-50">📈</div>
                      <h3 className="text-lg font-bold text-slate-900">Analytics Dashboard</h3>
                      <p className="text-slate-500 text-base mt-2">Comprehensive reports and charts will be available in the next release.</p>
                  </div>
                </div>
              )}

              {/* TAB: BILLING */}
              {activeTab === "billing" && (
                <div className="flex flex-col lg:flex-row gap-6 animate-slideDown h-[calc(100vh-140px)]">
                  {/* Left: Product Selection */}
                  <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-3xl p-6 shadow-sm min-h-0 overflow-hidden">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-4 flex-shrink-0">POS Terminal</h2>
                    <div className="flex gap-3 mb-6 flex-shrink-0">
                      <input type="text" placeholder="Search product to bill..." value={billingSearch} onChange={e => setBillingSearch(e.target.value)} className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-slate-900" />
                      <select value={billingCategoryFilter} onChange={e => setBillingCategoryFilter(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-slate-900 w-40">
                        <option value="All">All Categories</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="flex-1 overflow-y-auto min-h-0 pr-2">
                       <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                          {products.filter(p => p.name.toLowerCase().includes(billingSearch.toLowerCase()) && (billingCategoryFilter === "All" || p.categoryId.toString() === billingCategoryFilter)).map(product => (
                            <div key={product.id} onClick={() => {
                               const existing = billingCart.find(i => i.id === product.id);
                               if(existing) setBillingCart(billingCart.map(i => i.id === product.id ? {...i, quantity: i.quantity + 1} : i));
                               else setBillingCart([...billingCart, {...product, quantity: 1}]);
                            }} className="bg-slate-50 border border-slate-200 rounded-xl p-3 cursor-pointer hover:border-slate-900 transition-colors flex flex-col items-center text-center">
                               {product.image ? <img src={product.image} alt={product.name} className="h-16 object-contain mb-2" /> : <div className="h-16 text-3xl flex items-center justify-center mb-2">📦</div>}
                               <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-tight mb-1">{product.name}</h4>
                               <span className="text-sm font-black text-slate-900 mt-auto">₹{product.price}</span>
                            </div>
                          ))}
                       </div>
                    </div>
                  </div>
                  
                  {/* Right: Cart & Billing */}
`;

const regex = /(<div className="relative z-10">[\s\S]*?<\/div>\s*<\/div>\s*\)\)\}\s*<\/div>)[\s\S]*?({\/\* Right: Cart & Billing \*\/})/;

content = content.replace(regex, `$1\n${overviewContent}\n$2`);

fs.writeFileSync(filePath, content);
console.log("Tabs restored!");

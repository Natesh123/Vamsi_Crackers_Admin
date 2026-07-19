const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const newOverview = `              {/* TAB: OVERVIEW */}
              {activeTab === "overview" && (
                <div className="space-y-8 animate-slideDown">
                  {/* Premium Welcome Banner */}
                  <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 lg:p-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-900/20 border border-indigo-500/20">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                    <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                    
                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-sm font-bold tracking-widest uppercase mb-4 backdrop-blur-md">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                          System Online
                        </div>
                        <h2 className="text-3xl lg:text-4xl font-black tracking-tight mb-2">
                          Welcome back, Admin
                        </h2>
                        <p className="text-indigo-200 text-base max-w-xl leading-relaxed">
                          Here's what's happening with your store today. You have {orders.length} active orders and {products.length} products in your catalog.
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
                        <div className="text-right">
                          <p className="text-sm text-indigo-200 font-medium uppercase tracking-widest mb-1">Today's Revenue</p>
                          <p className="text-2xl font-black text-emerald-400">₹{orders.reduce((a,c) => a + c.totalAmount, 0).toFixed(2)}</p>
                        </div>
                        <div className="w-px h-12 bg-white/10 mx-2"></div>
                        <div className="text-right">
                          <p className="text-sm text-indigo-200 font-medium uppercase tracking-widest mb-1">New Orders</p>
                          <p className="text-2xl font-black text-white">{orders.length}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dashboard Header Stat Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      {
                        label: "Total Products",
                        value: products.length,
                        icon: "📦",
                        color: "from-blue-500 to-indigo-600",
                        bg: "bg-blue-50"
                      },
                      {
                        label: "Total Categories",
                        value: categories.length,
                        icon: "🏷️",
                        color: "from-emerald-400 to-teal-500",
                        bg: "bg-emerald-50"
                      },
                      {
                        label: "Total Orders",
                        value: orders.length,
                        icon: "🛒",
                        color: "from-amber-400 to-orange-500",
                        bg: "bg-amber-50"
                      },
                      {
                        label: "Total Customers",
                        value: [...new Set(orders.map(o => o.customerPhone))].length,
                        icon: "👥",
                        color: "from-purple-500 to-pink-500",
                        bg: "bg-purple-50"
                      },
                    ].map((stat, i) => (
                      <div key={i} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:border-slate-200 transition-all duration-300 group relative overflow-hidden flex flex-col justify-between">
                        <div className={\`absolute top-0 right-0 w-32 h-32 rounded-bl-full mix-blend-multiply opacity-50 filter blur-2xl \${stat.bg}\`}></div>
                        
                        <div className="flex justify-between items-start mb-6 relative z-10">
                          <div className={\`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm bg-gradient-to-br \${stat.color} text-white transform group-hover:scale-110 transition-transform duration-300\`}>
                            {stat.icon}
                          </div>
                        </div>
                        
                        <div className="relative z-10">
                          <h3 className="text-4xl font-black text-slate-900 tracking-tighter mb-1">{stat.value}</h3>
                          <p className="text-slate-500 font-medium text-base tracking-tight">{stat.label}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Quick Activity & Overview Details */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                    {/* Category Share - Takes up 1 column */}
                    <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <h3 className="text-lg font-black text-slate-900 tracking-tight">Category Mix</h3>
                          <p className="text-sm text-slate-500 mt-1 font-medium">Distribution of products</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                          📊
                        </div>
                      </div>
                      
                      {categories.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50 py-10">
                          <span className="text-4xl mb-3">📁</span>
                          <p className="text-slate-500 text-base font-medium">No categories added</p>
                        </div>
                      ) : (
                        <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                          {categories.map((cat, idx) => {
                            const count = products.filter((p) => p.categoryId === cat.id).length;
                            const percentage = products.length ? Math.round((count / products.length) * 100) : 0;
                            const colors = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-pink-500'];
                            const barColor = colors[idx % colors.length];
                            
                            return (
                              <div key={cat.id} className="space-y-2 group">
                                <div className="flex justify-between items-center text-base">
                                  <span className="font-bold text-slate-700 group-hover:text-slate-900 transition-colors">{cat.name}</span>
                                  <span className="font-black text-slate-900">{count} <span className="text-slate-400 font-medium text-sm ml-1">({percentage}%)</span></span>
                                </div>
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                  <div
                                    className={\`\${barColor} h-full rounded-full transition-all duration-1000 ease-out\`}
                                    style={{ width: \`\${percentage}%\` }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Quick Management - Takes up 2 columns */}
                    <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <h3 className="text-lg font-black text-slate-900 tracking-tight">Quick Actions</h3>
                          <p className="text-sm text-slate-500 mt-1 font-medium">Frequently used tools</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                          ⚡
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        <button
                          onClick={() => { setEditingProduct(null); setProductName(""); setProductPrice(""); setProductOriginalPrice(""); setProductDiscount(""); setProductCategoryId(""); setProductImage(""); setProductTamilTranslation(""); setIsProductModalOpen(true); }}
                          className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 hover:-translate-y-1 transition-all group cursor-pointer"
                        >
                          <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">
                            📦
                          </div>
                          <h4 className="font-bold text-slate-900 text-base">Add New Product</h4>
                          <p className="text-sm text-slate-500 mt-1 text-center">Add to catalog instantly</p>
                        </button>
                        
                        <button
                          onClick={() => { setEditingCategory(null); setNewCategoryName(""); setNewCatTamilTranslation(""); document.getElementById("add-category-modal")?.classList.remove("hidden"); }}
                          className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 hover:-translate-y-1 transition-all group cursor-pointer"
                        >
                          <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">
                            🏷️
                          </div>
                          <h4 className="font-bold text-slate-900 text-base">Create Category</h4>
                          <p className="text-sm text-slate-500 mt-1 text-center">Organize your products</p>
                        </button>
                      </div>

                      <div className="mt-auto bg-slate-900 rounded-2xl p-6 flex items-center justify-between shadow-lg shadow-slate-900/10">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-2xl border border-white/10">
                            📄
                          </div>
                          <div>
                            <h4 className="font-bold text-white tracking-tight">Price List PDF</h4>
                            <p className="text-sm text-slate-400 mt-0.5">Manage your downloadable catalog</p>
                          </div>
                        </div>
                        {priceListUrl ? (
                          <a href={priceListUrl} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 bg-white text-slate-900 font-bold text-sm rounded-full hover:bg-slate-100 transition-colors shadow-sm">
                            View PDF
                          </a>
                        ) : (
                          <span className="px-4 py-2 bg-white/5 border border-white/10 text-slate-400 font-bold text-sm rounded-full">
                            Not Uploaded
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}`;

const regex = /\{\/\* TAB: OVERVIEW \*\/\}([\s\S]*?)(\{\/\* TAB: CATEGORIES \*\/\})/g;
content = content.replace(regex, `${newOverview}\n\n              $2`);

fs.writeFileSync(filePath, content);
console.log("Upgraded Overview Tab!");

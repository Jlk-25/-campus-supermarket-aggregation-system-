// app.js
// 全局数据变量
let supermarketsData = [];

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function () {
    // 从 localStorage 加载数据，若没有则使用初始数据
    const storedData = loadDataFromStorage();
    supermarketsData = storedData || initialSupermarketsData;

    // 首次运行时，若没有存储过数据，则保存一次初始数据
    if (!storedData) {
        saveDataToStorage(supermarketsData);
    }

    // 渲染超市卡片
    renderSupermarkets();
    // 绑定事件
    bindEvents();
    // 渲染商品清单（如果有必要）
    renderAllProductLists();
    // 初始化管理后台数据
    renderAdminTable();
});

/* ========== 渲染函数 ========== */
function renderSupermarkets() {
    const container = document.getElementById('supermarketCards');
    if (!container) return;

    container.innerHTML = supermarketsData.map(supermarket => {
        const totalProducts = supermarket.products.length;
        const lowStockCount = supermarket.products.filter(p => p.stock < 15).length;
        return `
            <div class="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6" id="card-${supermarket.id}">
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <span class="text-2xl">${getIcon(supermarket.icon)}</span>
                        </div>
                        <div>
                            <h3 class="font-semibold text-lg">${supermarket.name}</h3>
                            <span class="inline-block px-2 py-1 text-xs rounded-full ${supermarket.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}">${supermarket.statusText}</span>
                        </div>
                    </div>
                    <button class="text-blue-600 hover:text-blue-800 text-sm font-medium" data-action="toggle-list" data-id="${supermarket.id}">
                        查看商品列表 <span class="inline-block transition-transform" data-arrow>▼</span>
                    </button>
                </div>
                <p class="text-gray-600 text-sm mb-4">${supermarket.description}</p>
                <div class="flex justify-between text-sm">
                    <span>商品总数: ${totalProducts}</span>
                    ${lowStockCount > 0 ? `<span class="text-red-500">缺货预警: ${lowStockCount} 件</span>` : ''}
                </div>
                <div class="product-list hidden mt-4 space-y-2" id="list-${supermarket.id}">
                    ${supermarket.products.map(p => `
                        <div class="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                            <div>
                                <span class="font-medium">${p.name}</span>
                                <span class="text-xs text-gray-500 ml-2">${p.category}</span>
                            </div>
                            <div class="flex items-center gap-4">
                                <span>¥${p.price.toFixed(2)}</span>
                                <span class="${p.stock < 15 ? 'text-red-500 font-semibold' : 'text-gray-600'}">库存: ${p.stock}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('');
}

function getIcon(iconType) {
    const icons = {
        store: '🏪',
        pencil: '✏️',
        fruit: '🍎',
        snack: '🍿'
    };
    return icons[iconType] || '🏪';
}

function renderAllProductLists() {
    // 如有需要，可在此处统一展开/收起逻辑
}

/* ========== 事件绑定 ========== */
function bindEvents() {
    // 搜索相关
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }
    if (searchInput) {
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') performSearch();
            if (e.key === 'Escape') clearSearch();
        });
        // 快捷键 "/" 聚焦
        document.addEventListener('keydown', function(e) {
            if (e.key === '/' && document.activeElement !== searchInput) {
                e.preventDefault();
                searchInput.focus();
            }
        });
    }
    // 热门搜索标签
    document.querySelectorAll('[data-search-tag]').forEach(tag => {
        tag.addEventListener('click', function() {
            const keyword = this.getAttribute('data-search-tag');
            if (searchInput) {
                searchInput.value = keyword;
                performSearch();
            }
        });
    });

    // 商品列表展开/收起
    document.getElementById('supermarketCards')?.addEventListener('click', function(e) {
        const toggleBtn = e.target.closest('[data-action="toggle-list"]');
        if (toggleBtn) {
            const id = toggleBtn.getAttribute('data-id');
            const list = document.getElementById(`list-${id}`);
            const arrow = toggleBtn.querySelector('[data-arrow]');
            if (list) {
                list.classList.toggle('hidden');
                arrow.style.transform = list.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
            }
        }
    });

    // 管理后台打开/关闭
    const adminBtns = document.querySelectorAll('[data-action="open-admin"]');
    adminBtns.forEach(btn => btn.addEventListener('click', openAdminModal));
    const closeAdminBtn = document.getElementById('closeAdminModal');
    if (closeAdminBtn) closeAdminBtn.addEventListener('click', closeAdminModal);

    // 后台表单操作
    const adminForm = document.getElementById('adminForm');
    if (adminForm) {
        adminForm.addEventListener('submit', handleAdminFormSubmit);
    }
    const addProductBtn = document.getElementById('addProductBtn');
    if (addProductBtn) addProductBtn.addEventListener('click', showAddForm);

    // 表格操作委托
    const adminTableBody = document.getElementById('adminTableBody');
    if (adminTableBody) {
        adminTableBody.addEventListener('click', handleAdminTableActions);
    }

    // 调拨申请
    const transferBtn = document.getElementById('transferBtn');
    if (transferBtn) transferBtn.addEventListener('click', handleTransfer);
}

/* ========== 搜索功能 ========== */
function performSearch() {
    const keyword = document.getElementById('searchInput').value.trim().toLowerCase();
    if (!keyword) {
        showToast('请输入搜索关键词');
        return;
    }

    const results = [];
    supermarketsData.forEach(supermarket => {
        const matchedProducts = supermarket.products.filter(p =>
            p.name.toLowerCase().includes(keyword) ||
            p.category.toLowerCase().includes(keyword) ||
            supermarket.name.includes(keyword) // 超市名也匹配
        );
        if (matchedProducts.length > 0) {
            results.push({
                supermarket,
                products: matchedProducts
            });
        }
    });

    // 高亮匹配的超市卡片
    document.querySelectorAll('[id^="card-"]').forEach(card => {
        card.classList.remove('ring-4', 'ring-blue-200');
    });
    results.forEach(r => {
        const card = document.getElementById(`card-${r.supermarket.id}`);
        if (card) card.classList.add('ring-4', 'ring-blue-200');
    });

    // 显示搜索结果弹窗（或跳转到结果区域）
    showSearchResults(results, keyword);
}

function showSearchResults(results, keyword) {
    let modal = document.getElementById('searchResultsModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'searchResultsModal';
        modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
                <div class="flex justify-between items-center p-4 border-b">
                    <h3 class="text-xl font-semibold">搜索结果</h3>
                    <button id="closeSearchResults" class="text-gray-500 hover:text-gray-700 text-2xl leading-none">&times;</button>
                </div>
                <div class="p-4 overflow-y-auto" id="searchResultsContent"></div>
            </div>
        `;
        document.body.appendChild(modal);
        document.getElementById('closeSearchResults').addEventListener('click', () => modal.remove());
        // 点击外部关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }
    const content = modal.querySelector('#searchResultsContent');
    if (!results || results.length === 0) {
        content.innerHTML = '<p class="text-gray-500 text-center py-8">未找到相关商品</p>';
    } else {
        content.innerHTML = results.map(r => `
            <div class="mb-4">
                <h4 class="font-semibold text-blue-700 mb-2">${r.supermarket.name}</h4>
                ${r.products.map(p => `
                    <div class="flex justify-between items-center bg-gray-50 p-2 rounded mb-1">
                        <div>
                            <span class="font-medium">${p.name}</span>
                            <span class="text-xs text-gray-500 ml-2">${p.category}</span>
                        </div>
                        <div class="flex items-center gap-4">
                            <span>¥${p.price.toFixed(2)}</span>
                            <span class="${p.stock < 15 ? 'text-red-500' : ''}">库存 ${p.stock}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `).join('');
    }
    document.body.appendChild(modal); // 确保在DOM中
    modal.classList.remove('hidden');
}

function clearSearch() {
    document.getElementById('searchInput').value = '';
    document.querySelectorAll('[id^="card-"]').forEach(card => card.classList.remove('ring-4', 'ring-blue-200'));
    const modal = document.getElementById('searchResultsModal');
    if (modal) modal.remove();
}

/* ========== 管理后台 ========== */
let editingProductId = null;
let editingSupermarketId = null;

function openAdminModal() {
    const modal = document.getElementById('adminModal');
    if (modal) {
        modal.classList.remove('hidden');
        renderAdminTable();
        document.getElementById('adminForm').classList.add('hidden');
    }
}

function closeAdminModal() {
    const modal = document.getElementById('adminModal');
    if (modal) modal.classList.add('hidden');
}

function renderAdminTable() {
    const filter = document.getElementById('adminSupermarketFilter');
    const filterId = filter ? filter.value : 'all';
    const tbody = document.getElementById('adminTableBody');
    if (!tbody) return;

    let rows = '';
    supermarketsData.forEach(sm => {
        if (filterId !== 'all' && sm.id !== filterId) return;
        sm.products.forEach(p => {
            rows += `
                <tr class="border-b hover:bg-gray-50">
                    <td class="py-2 px-4">${p.name}</td>
                    <td class="py-2 px-4">${sm.name}</td>
                    <td class="py-2 px-4">${p.category}</td>
                    <td class="py-2 px-4">¥${p.price.toFixed(2)}</td>
                    <td class="py-2 px-4 ${p.stock < 15 ? 'text-red-500 font-semibold' : ''}">${p.stock}</td>
                    <td class="py-2 px-4">
                        <button class="text-blue-600 hover:underline mr-2" data-action="edit-product" data-supermarket-id="${sm.id}" data-product-id="${p.id}">编辑</button>
                        <button class="text-red-600 hover:underline" data-action="delete-product" data-supermarket-id="${sm.id}" data-product-id="${p.id}">删除</button>
                    </td>
                </tr>
            `;
        });
    });
    tbody.innerHTML = rows || '<tr><td colspan="6" class="text-center text-gray-500 py-4">暂无商品</td></tr>';
}

function showAddForm() {
    const form = document.getElementById('adminForm');
    form.classList.remove('hidden');
    form.reset();
    editingProductId = null;
    editingSupermarketId = null;
    document.getElementById('formTitle').textContent = '添加商品';
}

function handleAdminFormSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('productName').value.trim();
    const category = document.getElementById('productCategory').value.trim();
    const price = parseFloat(document.getElementById('productPrice').value);
    const stock = parseInt(document.getElementById('productStock').value, 10);
    const supermarketId = document.getElementById('productSupermarket').value;

    if (!name || !category || isNaN(price) || isNaN(stock) || !supermarketId) {
        showToast('请完整填写所有字段');
        return;
    }

    const supermarket = supermarketsData.find(sm => sm.id === supermarketId);
    if (!supermarket) return;

    if (editingProductId) {
        // 编辑模式
        const product = supermarket.products.find(p => p.id === editingProductId);
        if (product) {
            product.name = name;
            product.category = category;
            product.price = price;
            product.stock = stock;
            // 如果超市改变了，需要移动商品？
            // 简单处理：若超市改变，原超市删除，新超市添加
            if (editingSupermarketId !== supermarketId) {
                const oldSupermarket = supermarketsData.find(sm => sm.id === editingSupermarketId);
                if (oldSupermarket) {
                    oldSupermarket.products = oldSupermarket.products.filter(p => p.id !== editingProductId);
                }
                // 添加新商品（生成一个新id）
                const newId = 'p' + Date.now();
                supermarket.products.push({ id: newId, name, category, price, stock });
            }
        }
    } else {
        // 添加模式
        const newId = 'p' + Date.now();
        supermarket.products.push({ id: newId, name, category, price, stock });
    }

    // 保存数据到 localStorage
    saveDataToStorage(supermarketsData);

    // 重新渲染
    renderSupermarkets();
    renderAllProductLists();
    renderAdminTable();
    closeAdminModal();
    showToast('保存成功');
    editingProductId = null;
    editingSupermarketId = null;
}

function handleAdminTableActions(e) {
    const actionBtn = e.target.closest('[data-action]');
    if (!actionBtn) return;

    const action = actionBtn.getAttribute('data-action');
    const supermarketId = actionBtn.getAttribute('data-supermarket-id');
    const productId = actionBtn.getAttribute('data-product-id');
    const supermarket = supermarketsData.find(sm => sm.id === supermarketId);
    if (!supermarket) return;

    if (action === 'edit-product') {
        const product = supermarket.products.find(p => p.id === productId);
        if (product) {
            editingProductId = productId;
            editingSupermarketId = supermarketId;
            document.getElementById('formTitle').textContent = '编辑商品';
            document.getElementById('productName').value = product.name;
            document.getElementById('productCategory').value = product.category;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productStock').value = product.stock;
            document.getElementById('productSupermarket').value = supermarketId;
            document.getElementById('adminForm').classList.remove('hidden');
        }
    } else if (action === 'delete-product') {
        if (confirm('确定要删除该商品吗？')) {
            supermarket.products = supermarket.products.filter(p => p.id !== productId);
            saveDataToStorage(supermarketsData);
            renderSupermarkets();
            renderAllProductLists();
            renderAdminTable();
            showToast('删除成功');
        }
    }
}

function handleTransfer() {
    const fromId = document.getElementById('transferFrom').value;
    const toId = document.getElementById('transferTo').value;
    if (!fromId || !toId) {
        showToast('请选择调出和调入园区');
        return;
    }
    if (fromId === toId) {
        showToast('调出园区和调入园区不能相同');
        return;
    }
    // 这里可以添加具体的调拨逻辑（例如调整库存）或仅模拟提示
    showToast(`调拨申请已提交：${getSupermarketName(fromId)} → ${getSupermarketName(toId)}`);
    // 如果希望真正修改库存，可在此处实现，并调用 saveDataToStorage
}

function getSupermarketName(id) {
    const sm = supermarketsData.find(s => s.id === id);
    return sm ? sm.name : id;
}

/* ========== Toast 提示 ========== */
function showToast(message) {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'fixed bottom-6 right-6 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg transition-opacity duration-300 opacity-0 pointer-events-none';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.remove('opacity-0');
    setTimeout(() => {
        toast.classList.add('opacity-0');
    }, 2500);
}

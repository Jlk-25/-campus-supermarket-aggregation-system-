import { logout } from '../auth';
import {
  getAllProducts,
  updateStock,
  transferStock,
  getSupermarketStats,
  getLowStockProducts,
  getTotalProductCount,
  getTotalStockQuantity,
  supermarketNames,
} from '../data';

export function renderAdminDashboard(activeTab: string = 'dashboard') {
  const app = document.getElementById('app')!;
  const username = localStorage.getItem('username') || '管理员';

  app.innerHTML = `
    <div class="admin-layout">
      <aside class="sidebar">
        <h2>管理后台</h2>
        <nav>
          <a href="#/admin" class="sidebar-link ${activeTab === 'dashboard' ? 'active' : ''}" data-tab="dashboard">仪表盘</a>
          <a href="#/admin" class="sidebar-link ${activeTab === 'inventory' ? 'active' : ''}" data-tab="inventory">库存管理</a>
          <a href="#/admin" class="sidebar-link ${activeTab === 'transfer' ? 'active' : ''}" data-tab="transfer">调拨审批</a>
          <a href="#/admin" class="sidebar-link ${activeTab === 'reports' ? 'active' : ''}" data-tab="reports">报表统计</a>
        </nav>
        <button id="logout-btn" class="logout-btn">退出登录</button>
      </aside>
      <main class="admin-main">
        <h1>管理后台 - ${getTabTitle(activeTab)}</h1>
        <div id="tab-content">
          ${renderTabContent(activeTab)}
        </div>
      </main>
    </div>
  `;

  // 绑定侧边栏链接点击（切换标签页）
  document.querySelectorAll('.sidebar-link').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = (link as HTMLElement).dataset.tab || 'dashboard';
      renderAdminDashboard(tab);
    });
  });

  // 绑定退出登录
  document.getElementById('logout-btn')?.addEventListener('click', () => {
    logout();
    window.location.hash = '#/login';
  });

  // 根据当前标签页绑定相应事件
  if (activeTab === 'inventory') {
    bindInventoryEvents();
  } else if (activeTab === 'transfer') {
    bindTransferEvents();
  }
}

function getTabTitle(tab: string): string {
  switch (tab) {
    case 'dashboard': return '仪表盘';
    case 'inventory': return '库存管理';
    case 'transfer': return '调拨审批';
    case 'reports': return '报表统计';
    default: return '仪表盘';
  }
}

function renderTabContent(tab: string): string {
  switch (tab) {
    case 'dashboard': return renderDashboardTab();
    case 'inventory': return renderInventoryTab();
    case 'transfer': return renderTransferTab();
    case 'reports': return renderReportsTab();
    default: return renderDashboardTab();
  }
}

/* ---------- 仪表盘 ---------- */
function renderDashboardTab(): string {
  const totalProducts = getTotalProductCount();
  const totalStock = getTotalStockQuantity();
  const lowStockProducts = getLowStockProducts();
  const lowStockCount = lowStockProducts.length;
  const pendingTransfers = 0; // 模拟待处理调拨数

  return `
    <div class="stats-grid">
      <div class="stat-card">
        <span>总商品数</span>
        <strong>${totalProducts}</strong>
      </div>
      <div class="stat-card">
        <span>总库存量</span>
        <strong>${totalStock}</strong>
      </div>
      <div class="stat-card">
        <span>低库存预警</span>
        <strong>${lowStockCount}</strong>
      </div>
      <div class="stat-card">
        <span>待处理调拨</span>
        <strong>${pendingTransfers}</strong>
      </div>
    </div>
    <div class="low-stock-list">
      <h2>低库存商品（阈值 < 20）</h2>
      ${
        lowStockProducts.length > 0
          ? `
            <table>
              <thead>
                <tr>
                  <th>商品名称</th>
                  <th>所属超市</th>
                  <th>库存数量</th>
                </tr>
              </thead>
              <tbody>
                ${lowStockProducts.map(p => `
                  <tr>
                    <td>${p.name}</td>
                    <td>${p.supermarket}</td>
                    <td class="low-stock">${p.stock}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `
          : '<p>暂无低库存商品</p>'
      }
    </div>
  `;
}

/* ---------- 库存管理 ---------- */
function renderInventoryTab(): string {
  const products = getAllProducts();
  return `
    <div class="inventory-table">
      <h2>商品库存列表</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>商品名称</th>
            <th>类别</th>
            <th>所属超市</th>
            <th>当前库存</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          ${products.map(p => `
            <tr data-product-id="${p.id}">
              <td>${p.id}</td>
              <td>${p.name}</td>
              <td>${p.category}</td>
              <td>${p.supermarket}</td>
              <td>
                <input type="number" class="stock-input" value="${p.stock}" min="0" step="1" />
              </td>
              <td>
                <button class="save-stock-btn" data-id="${p.id}">保存</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <p class="stock-update-msg" id="stock-msg"></p>
    </div>
  `;
}

function bindInventoryEvents() {
  document.querySelectorAll('.save-stock-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = Number((btn as HTMLElement).dataset.id);
      const row = document.querySelector(`tr[data-product-id="${id}"]`);
      const input = row?.querySelector('.stock-input') as HTMLInputElement;
      if (input && !isNaN(Number(input.value))) {
        const newStock = parseInt(input.value, 10);
        updateStock(id, newStock);
        const msg = document.getElementById('stock-msg');
        if (msg) {
          msg.textContent = `商品 ID ${id} 库存已更新为 ${newStock}`;
          msg.style.color = '#16a34a';
        }
      }
    });
  });
}

/* ---------- 调拨审批 ---------- */
function renderTransferTab(): string {
  const products = getAllProducts();
  const supermarkets = supermarketNames;
  return `
    <div class="transfer-form-card">
      <h2>发起库存调拨</h2>
      <form id="transfer-form">
        <div class="form-row">
          <label for="transfer-product">选择商品</label>
          <select id="transfer-product" required>
            <option value="">-- 请选择商品 --</option>
            ${products.map(p => `<option value="${p.id}">${p.name}（${p.supermarket}，库存 ${p.stock}）</option>`).join('')}
          </select>
        </div>
        <div class="form-row">
          <label for="transfer-from">源超市</label>
          <select id="transfer-from" required>
            ${supermarkets.map(s => `<option value="${s}">${s}</option>`).join('')}
          </select>
        </div>
        <div class="form-row">
          <label for="transfer-to">目标超市</label>
          <select id="transfer-to" required>
            ${supermarkets.map(s => `<option value="${s}">${s}</option>`).join('')}
          </select>
        </div>
        <div class="form-row">
          <label for="transfer-quantity">调拨数量</label>
          <input type="number" id="transfer-quantity" min="1" step="1" required />
        </div>
        <button type="submit" class="btn-primary">提交调拨</button>
      </form>
      <p class="transfer-msg" id="transfer-msg"></p>
    </div>
  `;
}

function bindTransferEvents() {
  const form = document.getElementById('transfer-form') as HTMLFormElement;
  const msg = document.getElementById('transfer-msg') as HTMLParagraphElement;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const productSelect = document.getElementById('transfer-product') as HTMLSelectElement;
    const fromSelect = document.getElementById('transfer-from') as HTMLSelectElement;
    const toSelect = document.getElementById('transfer-to') as HTMLSelectElement;
    const quantityInput = document.getElementById('transfer-quantity') as HTMLInputElement;

    const productId = Number(productSelect.value);
    const from = fromSelect.value;
    const to = toSelect.value;
    const quantity = parseInt(quantityInput.value, 10);

    if (!productId || !from || !to || isNaN(quantity) || quantity <= 0) {
      msg.textContent = '请填写完整信息，数量必须大于0';
      msg.style.color = '#dc2626';
      return;
    }
    if (from === to) {
      msg.textContent = '源超市和目标超市不能相同';
      msg.style.color = '#dc2626';
      return;
    }

    const result = transferStock(productId, from, to, quantity);
    msg.textContent = result.message;
    msg.style.color = result.success ? '#16a34a' : '#dc2626';

    if (result.success) {
      // 调拨成功后刷新当前标签页（保持数据最新）
      setTimeout(() => renderAdminDashboard('transfer'), 1000);
    }
  });
}

/* ---------- 报表统计 ---------- */
function renderReportsTab(): string {
  const stats = getSupermarketStats();
  const totalStock = getTotalStockQuantity();
  const totalProducts = getTotalProductCount();
  return `
    <div class="reports-container">
      <div class="report-summary">
        <div class="stat-card"><span>全校总商品数</span><strong>${totalProducts}</strong></div>
        <div class="stat-card"><span>全校总库存</span><strong>${totalStock}</strong></div>
      </div>
      <div class="report-table">
        <h2>各超市统计报表</h2>
        <table>
          <thead>
            <tr>
              <th>超市名称</th>
              <th>商品种类数</th>
              <th>总库存量</th>
              <th>低库存商品数</th>
            </tr>
          </thead>
          <tbody>
            ${stats.map(s => `
              <tr>
                <td>${s.name}</td>
                <td>${s.totalProducts}</td>
                <td>${s.totalStock}</td>
                <td class="${s.lowStockCount > 0 ? 'low-stock' : 'normal-stock'}">${s.lowStockCount}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

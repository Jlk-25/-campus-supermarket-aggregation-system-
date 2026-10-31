import { logout, getRole } from '../auth';
import { getFilteredProducts, supermarketNames } from '../data';

export function renderUserHome() {
  const app = document.getElementById('app')!;
  const username = localStorage.getItem('username') || '用户';
  const role = getRole(); // 'user' 或 'admin'
  const isAdmin = role === 'admin';

  // 构建页面结构（商品列表容器暂时留空，稍后动态填充）
  app.innerHTML = `
    <div class="user-home">
      ${renderHeader(username, isAdmin)}
      <main>
        <!-- 英雄区域（含搜索框） -->
        <section class="hero-section" id="hero-section">
          <h1 class="hero-title">
            全校商品，<span class="highlight">一搜即得</span>
          </h1>
          <p class="hero-subtitle">
            整合沁园、润园、泽园、澄园所有超市实时库存，告别盲目奔波，让校园购物更高效。
          </p>
          <div class="search-box">
            <input
              type="text"
              id="search-input"
              placeholder="搜索商品名称，如：防晒霜、矿泉水..."
            />
            <button class="search-btn" id="search-btn">立即查询</button>
          </div>
          <div class="hot-tags">
            <span>热门搜索：</span>
            <span class="tag" data-tag="冰镇可乐">冰镇可乐</span>
            <span class="tag" data-tag="考研文具">考研文具</span>
            <span class="tag" data-tag="雨伞">雨伞</span>
          </div>
        </section>

        <!-- 超市卡片网格（可点击筛选） -->
        <section class="supermarket-grid">
          ${renderSupermarketCards()}
        </section>

        <!-- 商品列表区域 -->
        <section class="product-list-section" id="product-list-section">
          <div class="section-header">
            <div>
              <h2 class="section-title">商品列表</h2>
              <p class="section-subtitle">全校超市在售商品</p>
            </div>
            <div class="filter-info">
              <span>当前筛选：<strong id="filter-label">全部</strong></span>
            </div>
          </div>
          <div id="product-list" class="product-grid">
            <!-- 动态生成 -->
          </div>
        </section>

        <!-- 管理与统筹区域（仅管理员可见） -->
        ${isAdmin ? renderManagementSection() : ''}
      </main>
      ${renderFooter(isAdmin)}
    </div>
  `;

  // 获取关键 DOM 元素
  const searchInput = document.getElementById('search-input') as HTMLInputElement;
  const searchBtn = document.getElementById('search-btn')!;
  const productListContainer = document.getElementById('product-list')!;
  const filterLabel = document.getElementById('filter-label')!;

  // 内部状态
  let currentKeyword = '';
  let currentSupermarket = '全部';

  // 应用筛选并更新商品列表
  function applyFilters() {
    const filtered = getFilteredProducts(currentKeyword, currentSupermarket);
    productListContainer.innerHTML = renderProductCards(filtered);
    filterLabel.textContent = currentSupermarket === '全部' ? '全部' : currentSupermarket;
  }

  // 搜索处理函数
  function handleSearch(keyword: string) {
    currentKeyword = keyword;
    currentSupermarket = '全部'; // 搜索时重置超市筛选
    applyFilters();
    // 滚动到商品列表区域
    document.getElementById('product-list-section')?.scrollIntoView({ behavior: 'smooth' });
  }

  // 绑定搜索按钮点击
  searchBtn.addEventListener('click', () => {
    handleSearch(searchInput.value.trim());
  });

  // 绑定输入框回车搜索
  searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
      handleSearch(searchInput.value.trim());
    }
  });

  // 绑定热门标签点击
  document.querySelectorAll('.tag').forEach((tag) => {
    tag.addEventListener('click', () => {
      const tagText = (tag as HTMLElement).dataset.tag || '';
      searchInput.value = tagText;
      handleSearch(tagText);
    });
  });

  // 绑定超市卡片点击（筛选该超市商品）
  document.querySelectorAll('.market-card').forEach((card, index) => {
    card.addEventListener('click', () => {
      const marketName = supermarketNames[index];
      if (marketName) {
        currentSupermarket = marketName;
        currentKeyword = '';
        searchInput.value = '';
        applyFilters();
        document.getElementById('product-list-section')?.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // 绑定底部快速链接
  // 商品搜索 -> 聚焦搜索框
  const searchLink = document.getElementById('footer-search-link');
  searchLink?.addEventListener('click', (e) => {
    e.preventDefault();
    searchInput.focus();
    document.getElementById('hero-section')?.scrollIntoView({ behavior: 'smooth' });
  });

  // 园区分布 -> 滚动到商品列表
  const distributionLink = document.getElementById('footer-distribution-link');
  distributionLink?.addEventListener('click', (e) => {
    e.preventDefault();
    currentSupermarket = '全部';
    currentKeyword = '';
    searchInput.value = '';
    applyFilters();
    document.getElementById('product-list-section')?.scrollIntoView({ behavior: 'smooth' });
  });

  // 退出登录按钮
  document.getElementById('logout-btn')?.addEventListener('click', () => {
    logout();
    window.location.hash = '#/login';
  });

  // 初始加载商品列表
  applyFilters();
}

/* ---------- 辅助渲染函数 ---------- */

function renderHeader(username: string, isAdmin: boolean): string {
  return `
    <header class="header">
      <div class="header-inner">
        <div class="logo-area">
          <div class="logo-icon"></div>
          <span class="logo-text">校园超市汇总系统</span>
        </div>
        <nav class="nav-links">
          <a href="#/" class="nav-link active">首页</a>
          <a href="#product-list-section" class="nav-link" id="nav-product-link">商品查询</a>
          ${isAdmin ? '<a href="#/admin" class="nav-link">管理后台</a>' : ''}
        </nav>
        <div class="header-actions">
          <span class="username">你好，${username}</span>
          <button id="logout-btn" class="btn-text">退出</button>
          ${isAdmin ? '<a href="#/admin" class="btn-primary">管理后台</a>' : ''}
        </div>
      </div>
    </header>
  `;
}

function renderSupermarketCards(): string {
  const cards = supermarketNames.map((name, index) => {
    const status = index === 2 ? '补货中' : '营业中';
    const statusClass = index === 2 ? 'status-stock' : 'status-open';
    const itemCount = index === 0 ? '1,240' : index === 1 ? '2,150' : index === 2 ? '890' : '1,050';
    return `
      <div class="market-card" data-market="${name}">
        <div class="card-top">
          <div class="market-icon"></div>
          <span class="status-badge ${statusClass}">${status}</span>
        </div>
        <h3 class="market-name">${name}</h3>
        <p class="market-desc">${getMarketDescription(name)}</p>
        <div class="card-bottom">
          <span>在架商品</span>
          <span class="item-count">${itemCount} 件</span>
        </div>
      </div>
    `;
  }).join('');
  return cards;
}

function getMarketDescription(name: string): string {
  const desc: Record<string, string> = {
    '沁园超市': '位于沁园生活区，主营生活用品与各类零食。',
    '润园超市': '靠近润园生活区，文具与饮品种类最全。',
    '泽园超市': '靠近泽园宿舍，提供新鲜水果与零食。',
    '澄园超市': '澄园社区旁，主打零食饮料供给。',
  };
  return desc[name] || '校园超市';
}

function renderProductCards(products: ReturnType<typeof getFilteredProducts>): string {
  if (products.length === 0) {
    return '<p class="no-results">没有找到匹配的商品</p>';
  }
  return products.map(p => `
    <div class="product-card">
      <div class="product-category">${p.category}</div>
      <h4 class="product-name">${p.name}</h4>
      <p class="product-market">${p.supermarket}</p>
      <div class="product-stats">
        <span>库存：${p.stock} 件</span>
        <span class="product-price">￥${p.price.toFixed(2)}</span>
      </div>
    </div>
  `).join('');
}

function renderManagementSection(): string {
  return `
    <section class="management-section">
      <div class="section-header">
        <div>
          <h2 class="section-title">管理与统筹</h2>
          <p class="section-subtitle">为超市管理员与后勤人员提供的专业工具</p>
        </div>
        <a href="#/admin" class="admin-link">进入管理后台</a>
      </div>
      <div class="management-grid">
        <div class="stock-monitor-card">
          <h3>实时库存监控</h3>
          <p>全校 4 个园区超市库存数据每 5 分钟自动同步，支持低库存自动预警。</p>
          <div class="progress-item">
            <div class="progress-label">
              <span>农夫山泉 550ml</span>
              <span>库存紧张: 12</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill warning" style="width: 30%"></div>
            </div>
          </div>
          <div class="progress-item">
            <div class="progress-label">
              <span>乐事薯片 原味</span>
              <span>库存充足: 156</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill success" style="width: 80%"></div>
            </div>
          </div>
        </div>
        <div class="transfer-card">
          <h3>跨园区调拨</h3>
          <p>一键申请跨园区货物调配，优化资源配置，减少采购成本。现已支持澄园联动。</p>
          <div class="transfer-input">
            <span>泽园 -> 润园</span>
            <button class="transfer-btn">发起调拨</button>
          </div>
          <div class="metric-row">
            <div class="metric-box warning-bg">
              <span class="metric-value">15min</span>
              <span class="metric-label">决策响应提升</span>
            </div>
            <div class="metric-box success-bg">
              <span class="metric-value">100%</span>
              <span class="metric-label">全校园区覆盖</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderFooter(isAdmin: boolean): string {
  const adminLinks = isAdmin
    ? `
      <li><a href="#/admin">管理人员入口</a></li>
      <li><a href="#/admin">后勤管理</a></li>
    `
    : '';
  return `
    <footer class="footer">
      <div class="footer-inner">
        <div class="footer-info">
          <div class="logo-area">
            <div class="logo-icon"></div>
            <span class="logo-text">校园超市汇总系统</span>
          </div>
          <p>致力于打造透明、高效的校园商业环境，为师生提供最便捷的商品查询服务，为管理者提供最科学的决策支持。</p>
        </div>
        <div class="footer-links">
          <h4>快速链接</h4>
          <ul>
            <li><a href="#" id="footer-search-link">商品搜索</a></li>
            <li><a href="#" id="footer-distribution-link">园区分布</a></li>
            ${adminLinks}
          </ul>
        </div>
        <div class="footer-contact">
          <h4>联系我们</h4>
          <p>校园后勤保障部</p>
          <p>电话：010-88888888</p>
          <p>邮箱：support@campus.edu</p>
        </div>
      </div>
    </footer>
  `;
}
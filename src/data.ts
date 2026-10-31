// 商品数据类型
export interface Product {
  id: number;
  name: string;
  category: string;
  supermarket: string;
  stock: number;
  price: number;
}

// 超市列表
export const supermarketNames: string[] = [
  '沁园超市',
  '润园超市',
  '泽园超市',
  '澄园超市'
];

// 初始商品数据（模拟数据库）
const initialProducts: Product[] = [
  { id: 1, name: '农夫山泉 550ml', category: '饮料', supermarket: '沁园超市', stock: 12, price: 3 },
  { id: 2, name: '乐事薯片 原味', category: '零食', supermarket: '润园超市', stock: 156, price: 8.5 },
  { id: 3, name: '雨伞', category: '生活用品', supermarket: '泽园超市', stock: 5, price: 25 },
  { id: 4, name: '考研文具套装', category: '文具', supermarket: '澄园超市', stock: 48, price: 35 },
  { id: 5, name: '冰镇可乐 330ml', category: '饮料', supermarket: '沁园超市', stock: 80, price: 4 },
  { id: 6, name: '奥利奥饼干', category: '零食', supermarket: '沁园超市', stock: 60, price: 9 },
  { id: 7, name: '晨光中性笔', category: '文具', supermarket: '润园超市', stock: 200, price: 2 },
  { id: 8, name: '矿泉水 1.5L', category: '饮料', supermarket: '润园超市', stock: 90, price: 5 },
  { id: 9, name: '方便面 红烧牛肉', category: '食品', supermarket: '泽园超市', stock: 45, price: 6 },
  { id: 10, name: '抽纸 3包装', category: '生活用品', supermarket: '泽园超市', stock: 70, price: 12 },
  { id: 11, name: '苹果', category: '水果', supermarket: '泽园超市', stock: 30, price: 5 },
  { id: 12, name: '香蕉', category: '水果', supermarket: '澄园超市', stock: 25, price: 4.5 },
  { id: 13, name: '笔记本 A5', category: '文具', supermarket: '澄园超市', stock: 120, price: 6 },
  { id: 14, name: '洗衣液 500g', category: '生活用品', supermarket: '澄园超市', stock: 40, price: 15 },
  { id: 15, name: '巧克力', category: '零食', supermarket: '沁园超市', stock: 55, price: 12 },
  { id: 16, name: '酸奶 250ml', category: '饮料', supermarket: '润园超市', stock: 35, price: 6.5 },
  { id: 17, name: '薯片 黄瓜味', category: '零食', supermarket: '泽园超市', stock: 10, price: 8 },
  { id: 18, name: '洗发水 200ml', category: '生活用品', supermarket: '润园超市', stock: 28, price: 28 },
  { id: 19, name: '保温杯', category: '生活用品', supermarket: '沁园超市', stock: 15, price: 45 },
  { id: 20, name: '铅笔 2B', category: '文具', supermarket: '泽园超市', stock: 300, price: 1 },
];

// 模块级状态（模拟数据库）
let products: Product[] = [...initialProducts];

// 获取所有商品
export function getAllProducts(): Product[] {
  return products;
}

// 按超市筛选商品
export function getProductsBySupermarket(name: string): Product[] {
  return products.filter(p => p.supermarket === name);
}

// 按关键词搜索商品（名称或类别）
export function searchProducts(keyword: string): Product[] {
  if (!keyword.trim()) return products;
  const kw = keyword.trim().toLowerCase();
  return products.filter(
    p => p.name.toLowerCase().includes(kw) || p.category.toLowerCase().includes(kw)
  );
}

// 组合筛选：关键词 + 超市
export function getFilteredProducts(keyword: string, supermarket?: string): Product[] {
  let list = products;
  if (supermarket && supermarket !== '全部') {
    list = list.filter(p => p.supermarket === supermarket);
  }
  if (keyword.trim()) {
    const kw = keyword.trim().toLowerCase();
    list = list.filter(
      p => p.name.toLowerCase().includes(kw) || p.category.toLowerCase().includes(kw)
    );
  }
  return list;
}

// 更新商品库存
export function updateStock(productId: number, newStock: number): void {
  const product = products.find(p => p.id === productId);
  if (product) {
    product.stock = Math.max(0, Math.floor(newStock));
  }
}

// 调拨库存（从源超市转移到目标超市）
export function transferStock(
  productId: number,
  from: string,
  to: string,
  quantity: number
): { success: boolean; message: string } {
  const product = products.find(p => p.id === productId);
  if (!product) {
    return { success: false, message: '商品不存在' };
  }
  if (product.supermarket !== from) {
    return { success: false, message: '该商品不属于所选源超市' };
  }
  if (product.stock < quantity) {
    return { success: false, message: '源超市库存不足' };
  }
  if (quantity <= 0) {
    return { success: false, message: '调拨数量必须大于0' };
  }

  // 扣减源超市库存
  product.stock -= quantity;

  // 目标超市已有同名商品则增加库存，否则新建商品记录
  const existingInTarget = products.find(
    p => p.name === product.name && p.supermarket === to
  );
  if (existingInTarget) {
    existingInTarget.stock += quantity;
  } else {
    const newId = Math.max(...products.map(p => p.id)) + 1;
    products.push({
      id: newId,
      name: product.name,
      category: product.category,
      supermarket: to,
      stock: quantity,
      price: product.price,
    });
  }
  return { success: true, message: `调拨成功，已从${from}转移${quantity}件到${to}` };
}

// 获取超市统计信息
export interface SupermarketStats {
  name: string;
  totalProducts: number;
  totalStock: number;
  lowStockCount: number;
}

export function getSupermarketStats(): SupermarketStats[] {
  return supermarketNames.map(name => {
    const items = products.filter(p => p.supermarket === name);
    return {
      name,
      totalProducts: items.length,
      totalStock: items.reduce((sum, p) => sum + p.stock, 0),
      lowStockCount: items.filter(p => p.stock < 20).length,
    };
  });
}

// 获取低库存商品列表（默认阈值20）
export function getLowStockProducts(threshold: number = 20): Product[] {
  return products.filter(p => p.stock < threshold);
}

// 获取商品总数
export function getTotalProductCount(): number {
  return products.length;
}

// 获取总库存量
export function getTotalStockQuantity(): number {
  return products.reduce((sum, p) => sum + p.stock, 0);
}

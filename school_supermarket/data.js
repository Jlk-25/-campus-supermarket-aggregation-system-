// data.js
// 初始超市数据，可在此处修改默认商品
const initialSupermarketsData = [
    {
        id: 'qinyuan',
        name: '沁园超市',
        icon: 'store',
        status: 'open',
        statusText: '营业中',
        description: '位于沁园生活区，提供日用品、零食饮料、文具等。',
        products: [
            { id: 'q1', name: '农夫山泉 550ml', category: '饮料', price: 2.0, stock: 200 },
            { id: 'q2', name: '乐事薯片 原味', category: '零食', price: 6.5, stock: 20 },
            { id: 'q3', name: '晨光中性笔 黑色', category: '文具', price: 2.5, stock: 50 },
            { id: 'q4', name: '奥利奥饼干', category: '零食', price: 8.0, stock: 10 },
            { id: 'q5', name: '可口可乐 500ml', category: '饮料', price: 3.0, stock: 80 },
            { id: 'q6', name: '得力笔记本 A5', category: '文具', price: 5.0, stock: 30 }
        ]
    },
    {
        id: 'runyuan',
        name: '润园超市',
        icon: 'pencil',
        status: 'open',
        statusText: '营业中',
        description: '位于润园生活区，主营学习用品与基础生活用品。',
        products: [
            { id: 'r1', name: '怡宝矿泉水 555ml', category: '饮料', price: 2.0, stock: 150 },
            { id: 'r2', name: '士力架 花生夹心', category: '零食', price: 4.5, stock: 35 },
            { id: 'r3', name: '苏打饼干 香葱味', category: '零食', price: 9.9, stock: 15 },
            { id: 'r4', name: '齐心文件夹 A4', category: '文具', price: 6.0, stock: 40 },
            { id: 'r5', name: '红牛 维生素功能饮料', category: '饮料', price: 6.0, stock: 60 }
        ]
    },
    {
        id: 'zeyuan',
        name: '泽园超市',
        icon: 'fruit',
        status: 'restock',
        statusText: '补货中',
        description: '位于泽园生活区，以新鲜水果和小吃为特色。',
        products: [
            { id: 'z1', name: '香蕉 1kg', category: '水果', price: 5.0, stock: 25 },
            { id: 'z2', name: '苹果 1kg', category: '水果', price: 8.0, stock: 18 },
            { id: 'z3', name: '橙汁 500ml', category: '饮料', price: 6.5, stock: 12 },
            { id: 'z4', name: '牛肉干 五香味', category: '零食', price: 15.0, stock: 8 },
            { id: 'z5', name: '酸奶 原味', category: '饮料', price: 4.0, stock: 22 }
        ]
    },
    {
        id: 'chengyuan',
        name: '澄园超市',
        icon: 'snack',
        status: 'open',
        statusText: '营业中',
        description: '位于澄园生活区，零食种类丰富，适合夜间补给。',
        products: [
            { id: 'c1', name: '百事可乐 500ml', category: '饮料', price: 3.0, stock: 70 },
            { id: 'c2', name: '泡椒凤爪', category: '零食', price: 12.5, stock: 5 },
            { id: 'c3', name: '旺旺雪饼', category: '零食', price: 7.0, stock: 28 },
            { id: 'c4', name: '维达纸巾 3包装', category: '日用品', price: 10.0, stock: 45 },
            { id: 'c5', name: '统一方便面 红烧牛肉', category: '食品', price: 4.5, stock: 55 }
        ]
    }
];

// 导出到全局，供 app.js 使用
window.initialSupermarketsData = initialSupermarketsData;

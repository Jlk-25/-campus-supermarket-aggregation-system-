// storage.js
const STORAGE_KEY = 'campusSupermarketData';

/**
 * 从 localStorage 加载数据，如果没有则返回 null
 */
function loadDataFromStorage() {
    try {
        const json = localStorage.getItem(STORAGE_KEY);
        return json ? JSON.parse(json) : null;
    } catch (e) {
        console.error('读取本地存储失败:', e);
        return null;
    }
}

/**
 * 将数据保存到 localStorage
 * @param {Array} data - 超市数据数组
 */
function saveDataToStorage(data) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.error('保存到本地存储失败:', e);
    }
}

/**
 * 清除 localStorage 中的数据（可选）
 */
function clearStorage() {
    localStorage.removeItem(STORAGE_KEY);
}

// 全局暴露，供 app.js 调用
window.loadDataFromStorage = loadDataFromStorage;
window.saveDataToStorage = saveDataToStorage;
window.clearStorage = clearStorage;

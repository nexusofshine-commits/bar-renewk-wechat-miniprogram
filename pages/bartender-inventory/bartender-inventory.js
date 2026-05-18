Page({
  data: {
    inventory: [],
    filteredInventory: [],
    currentTab: 'all',
    materialsList: [
      { id: 'gin', name: '金酒' },
      { id: 'vodka', name: '伏特加' },
      { id: 'rum', name: '朗姆酒' },
      { id: 'whiskey', name: '威士忌' },
      { id: 'tequila', name: '龙舌兰' },
      { id: 'brandy', name: '白兰地' },
      { id: 'tonic', name: '汤力水' },
      { id: 'soda', name: '苏打水' },
      { id: 'lime', name: '青柠汁' },
      { id: 'lemon', name: '柠檬汁' },
      { id: 'grapefruit', name: '西柚汁' },
      { id: 'pineapple', name: '菠萝汁' },
      { id: 'orange', name: '橙汁' },
      { id: 'vermouth', name: '苦艾酒' },
      { id: 'campari', name: '金巴利' }
    ]
  },

  onLoad() {
    this.initInventory();
    this.loadInventory();
  },

  onShow() {
    this.loadInventory();
  },

  initInventory() {
    const inventory = wx.getStorageSync('inventory');
    if (!inventory) {
      const defaultInventory = [
        { id: 'gin', name: '金酒', currentStock: 1000, initialStock: 1000 },
        { id: 'vodka', name: '伏特加', currentStock: 1000, initialStock: 1000 },
        { id: 'rum', name: '朗姆酒', currentStock: 1000, initialStock: 1000 },
        { id: 'whiskey', name: '威士忌', currentStock: 1000, initialStock: 1000 },
        { id: 'tequila', name: '龙舌兰', currentStock: 800, initialStock: 800 },
        { id: 'brandy', name: '白兰地', currentStock: 600, initialStock: 600 },
        { id: 'tonic', name: '汤力水', currentStock: 2000, initialStock: 2000 },
        { id: 'soda', name: '苏打水', currentStock: 2000, initialStock: 2000 },
        { id: 'lime', name: '青柠汁', currentStock: 500, initialStock: 500 },
        { id: 'lemon', name: '柠檬汁', currentStock: 500, initialStock: 500 },
        { id: 'grapefruit', name: '西柚汁', currentStock: 400, initialStock: 400 },
        { id: 'pineapple', name: '菠萝汁', currentStock: 400, initialStock: 400 },
        { id: 'orange', name: '橙汁', currentStock: 400, initialStock: 400 },
        { id: 'vermouth', name: '苦艾酒', currentStock: 300, initialStock: 300 },
        { id: 'campari', name: '金巴利', currentStock: 300, initialStock: 300 }
      ];
      wx.setStorageSync('inventory', defaultInventory);
    }
  },

  loadInventory() {
    const inventory = wx.getStorageSync('inventory') || [];
    inventory.forEach(item => {
      const percent = (item.currentStock / item.initialStock) * 100;
      if (percent <= 20) {
        item.warningLevel = 'critical';
      } else if (percent <= 40) {
        item.warningLevel = 'warning';
      } else {
        item.warningLevel = 'normal';
      }
    });

    inventory.sort((a, b) => {
      const levelOrder = { critical: 0, warning: 1, normal: 2 };
      return levelOrder[a.warningLevel] - levelOrder[b.warningLevel];
    });

    this.setData({ inventory });
    this.filterInventory();
  },

  filterInventory() {
    const { inventory, currentTab } = this.data;
    
    let filtered = inventory;
    if (currentTab === 'warning') {
      filtered = inventory.filter(item => 
        item.warningLevel === 'critical' || item.warningLevel === 'warning'
      );
    } else if (currentTab === 'normal') {
      filtered = inventory.filter(item => item.warningLevel === 'normal');
    }

    this.setData({ filteredInventory: filtered });
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ currentTab: tab });
    this.filterInventory();
  },

  getUsagePercent(item) {
    return Math.round((item.currentStock / item.initialStock) * 100);
  },

  getWarningText(item) {
    if (item.warningLevel === 'critical') {
      return '紧急补货';
    } else if (item.warningLevel === 'warning') {
      return '库存不足';
    }
    return '正常';
  },

  addStock(e) {
    const id = e.currentTarget.dataset.id;
    const item = this.data.inventory.find(i => i.id === id);
    
    wx.showModal({
      title: `入库 - ${item.name}`,
      editable: true,
      placeholderText: '请输入入库数量(ml)',
      content: '',
      success: (res) => {
        if (res.confirm && res.content) {
          const amount = parseInt(res.content);
          if (!isNaN(amount) && amount > 0) {
            const inventory = this.data.inventory.map(i => {
              if (i.id === id) {
                return {
                  ...i,
                  currentStock: i.currentStock + amount,
                  initialStock: Math.max(i.initialStock, i.currentStock + amount)
                };
              }
              return i;
            });
            wx.setStorageSync('inventory', inventory);
            this.loadInventory();
            wx.showToast({
              title: '入库成功',
              icon: 'success'
            });
          }
        }
      }
    });
  },

  editStock(e) {
    const id = e.currentTarget.dataset.id;
    const item = this.data.inventory.find(i => i.id === id);
    
    wx.showModal({
      title: `调整库存 - ${item.name}`,
      editable: true,
      placeholderText: '请输入新的库存量(ml)',
      content: String(item.currentStock),
      success: (res) => {
        if (res.confirm && res.content) {
          const newStock = parseInt(res.content);
          if (!isNaN(newStock) && newStock >= 0) {
            const inventory = this.data.inventory.map(i => {
              if (i.id === id) {
                return {
                  ...i,
                  currentStock: newStock
                };
              }
              return i;
            });
            wx.setStorageSync('inventory', inventory);
            this.loadInventory();
            wx.showToast({
              title: '调整成功',
              icon: 'success'
            });
          }
        }
      }
    });
  },

  addMaterial() {
    const { materialsList } = this.data;
    const inventory = wx.getStorageSync('inventory') || [];
    const existingIds = inventory.map(i => i.id);
    const availableMaterials = materialsList.filter(m => !existingIds.includes(m.id));

    if (availableMaterials.length === 0) {
      wx.showToast({
        title: '所有材料已添加',
        icon: 'none'
      });
      return;
    }

    const materialNames = availableMaterials.map(m => m.name).join('\n');
    
    wx.showModal({
      title: '选择新增材料',
      content: `可添加的材料：\n${materialNames}\n\n请在下方输入材料ID（如：gin）`,
      editable: true,
      placeholderText: '输入材料ID',
      success: (res) => {
        if (res.confirm && res.content) {
          const materialId = res.content.trim();
          const material = availableMaterials.find(m => m.id === materialId);
          
          if (material) {
            const newMaterial = {
              id: material.id,
              name: material.name,
              currentStock: 1000,
              initialStock: 1000
            };
            
            inventory.push(newMaterial);
            wx.setStorageSync('inventory', inventory);
            this.loadInventory();
            wx.showToast({
              title: '添加成功',
              icon: 'success'
            });
          } else {
            wx.showToast({
              title: '材料不存在',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  goBack() {
    wx.navigateBack();
  }
});

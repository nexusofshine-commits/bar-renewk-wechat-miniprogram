Page({
  data: {
    todayOrders: 0,
    todayRevenue: 0,
    lowStockCount: 0
  },

  onLoad() {
    this.loadStats();
  },

  onShow() {
    this.loadStats();
  },

  loadStats() {
    const orders = wx.getStorageSync('orders') || [];
    const today = new Date().toDateString();
    
    const todayOrders = orders.filter(order => {
      const orderDate = new Date(order.orderTime).toDateString();
      return orderDate === today;
    });

    const todayRevenue = todayOrders.reduce((sum, order) => {
      return sum + (order.cocktail.price || 0);
    }, 0);

    const inventory = wx.getStorageSync('inventory') || [];
    const lowStockCount = inventory.filter(item => {
      const percentage = (item.currentStock / item.initialStock) * 100;
      return percentage <= 20 && item.currentStock > 0;
    }).length;

    this.setData({
      todayOrders: todayOrders.length,
      todayRevenue: todayRevenue,
      lowStockCount: lowStockCount
    });
  },

  goToRecipes() {
    wx.navigateTo({
      url: '/pages/bartender-recipes/bartender-recipes'
    });
  },

  goToInventory() {
    wx.navigateTo({
      url: '/pages/bartender-inventory/bartender-inventory'
    });
  },

  goToBilling() {
    wx.navigateTo({
      url: '/pages/bartender-billing/bartender-billing'
    });
  },

  exitBartender() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出调酒师后台吗？',
      success: (res) => {
        if (res.confirm) {
          wx.navigateBack();
        }
      }
    });
  }
});

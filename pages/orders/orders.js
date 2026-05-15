const barData = require('../../utils/data.js');

Page({
  data: {
    orders: [],
    myOrders: [],
    allOrders: [],
    currentTab: 'mine',
    editingOrderId: null,
    editingName: ''
  },

  onLoad() {
    this.loadOrders();
  },

  onShow() {
    this.loadOrders();
  },

  loadOrders() {
    try {
      const orders = wx.getStorageSync('orders') || [];
      const allOrders = orders.map(order => ({
        ...order,
        formattedTime: this.formatTime(order.orderTime)
      }));
      
      const myOrders = allOrders;

      this.setData({
        orders: orders,
        myOrders,
        allOrders
      });
    } catch (e) {
      console.error('Error loading orders:', e);
    }
  },

  formatTime(timeStr) {
    const date = new Date(timeStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${month}月${day}日 ${hours}:${minutes}`;
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({
      currentTab: tab
    });
  },

  startEdit(e) {
    const orderId = e.currentTarget.dataset.orderId;
    const order = this.data.allOrders.find(o => o.orderTime === orderId);
    
    if (order && order.isSpecial) {
      this.setData({
        editingOrderId: orderId,
        editingName: order.cocktail.name
      });
    }
  },

  saveEdit(e) {
    const newName = e.detail.value;
    const orders = wx.getStorageSync('orders') || [];
    
    const updatedOrders = orders.map(order => {
      if (order.orderTime === this.data.editingOrderId && order.isSpecial) {
        return {
          ...order,
          cocktail: {
            ...order.cocktail,
            name: newName
          }
        };
      }
      return order;
    });

    try {
      wx.setStorageSync('orders', updatedOrders);
      this.setData({
        editingOrderId: null,
        editingName: ''
      });
      this.loadOrders();
      wx.showToast({
        title: '修改成功',
        icon: 'success'
      });
    } catch (e) {
      console.error('Error saving edit:', e);
    }
  },

  cancelEdit() {
    this.setData({
      editingOrderId: null,
      editingName: ''
    });
  },

  getOrdersToShow() {
    if (this.data.currentTab === 'mine') {
      return this.data.myOrders;
    }
    return this.data.allOrders;
  },

  getOrderPrice(order) {
    if (order.cocktail.price) {
      return `¥${order.cocktail.price}`;
    } else if (order.cocktail.price_range) {
      const midPrice = Math.round((order.cocktail.price_range[0] + order.cocktail.price_range[1]) / 2);
      return `¥${midPrice}`;
    }
    return '';
  }
});

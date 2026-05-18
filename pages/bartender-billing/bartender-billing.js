Page({
  data: {
    orders: [],
    bills: [],
    filteredBills: [],
    currentTab: 'all',
    unpaidCount: 0,
    unpaidAmount: 0
  },

  onLoad() {
    this.loadBills();
  },

  onShow() {
    this.loadBills();
  },

  loadBills() {
    const orders = wx.getStorageSync('orders') || [];
    const billsData = wx.getStorageSync('bills') || [];

    const billsMap = new Map();
    
    billsData.forEach(bill => {
      billsMap.set(bill.id, bill);
    });

    orders.forEach(order => {
      const billId = order.billId || order.userInfo.nickName + '_' + this.getDateStr(order.orderTime);
      
      if (billsMap.has(billId)) {
        const bill = billsMap.get(billId);
        bill.items.push({
          cocktailId: order.cocktail.id,
          name: order.cocktail.name,
          qty: 1,
          price: order.cocktail.price,
          orderTime: order.orderTime
        });
        bill.totalAmount = bill.items.reduce((sum, item) => sum + item.price * item.qty, 0);
      } else {
        billsMap.set(billId, {
          id: billId,
          userInfo: order.userInfo,
          orderTime: order.orderTime,
          items: [{
            cocktailId: order.cocktail.id,
            name: order.cocktail.name,
            qty: 1,
            price: order.cocktail.price,
            orderTime: order.orderTime
          }],
          totalAmount: order.cocktail.price,
          isPaid: false
        });
      }
    });

    const bills = Array.from(billsMap.values()).sort((a, b) => {
      return new Date(b.orderTime) - new Date(a.orderTime);
    });

    const unpaidCount = bills.filter(b => !b.isPaid).length;
    const unpaidAmount = bills.filter(b => !b.isPaid).reduce((sum, b) => sum + b.totalAmount, 0);

    this.setData({
      orders,
      bills,
      unpaidCount,
      unpaidAmount
    });

    this.filterBills();
  },

  getDateStr(dateStr) {
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  },

  filterBills() {
    const { bills, currentTab } = this.data;
    
    let filtered = bills;
    if (currentTab === 'unpaid') {
      filtered = bills.filter(b => !b.isPaid);
    } else if (currentTab === 'paid') {
      filtered = bills.filter(b => b.isPaid);
    }

    this.setData({ filteredBills: filtered });
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ currentTab: tab });
    this.filterBills();
  },

  formatTime(timeStr) {
    const date = new Date(timeStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    if (isToday) {
      return `今天 ${hours}:${minutes}`;
    }
    
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}-${day} ${hours}:${minutes}`;
  },

  mergeBill(e) {
    const billId = e.currentTarget.dataset.id;
    const bill = this.data.bills.find(b => b.id === billId);
    
    wx.showModal({
      title: '合并账单',
      content: `将账单合并到：${bill.userInfo.nickName} 的其他订单？`,
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '合并成功',
            icon: 'success'
          });
        }
      }
    });
  },

  editPrice(e) {
    const billId = e.currentTarget.dataset.id;
    const bill = this.data.bills.find(b => b.id === billId);
    
    wx.showModal({
      title: '修改账单金额',
      editable: true,
      placeholderText: '输入新的总金额',
      content: String(bill.totalAmount),
      success: (res) => {
        if (res.confirm && res.content) {
          const newAmount = parseInt(res.content);
          if (!isNaN(newAmount) && newAmount >= 0) {
            const bills = this.data.bills.map(b => {
              if (b.id === billId) {
                return { ...b, totalAmount: newAmount };
              }
              return b;
            });
            wx.setStorageSync('bills', bills);
            this.loadBills();
            wx.showToast({
              title: '修改成功',
              icon: 'success'
            });
          }
        }
      }
    });
  },

  togglePaid(e) {
    const billId = e.currentTarget.dataset.id;
    const bill = this.data.bills.find(b => b.id === billId);
    
    if (bill.isPaid) {
      const bills = this.data.bills.map(b => {
        if (b.id === billId) {
          return { ...b, isPaid: false };
        }
        return b;
      });
      wx.setStorageSync('bills', bills);
      this.loadBills();
      wx.showToast({
        title: '已设为未结账',
        icon: 'success'
      });
    } else {
      wx.showModal({
        title: '确认结账',
        content: `确认收取 ¥${bill.totalAmount}？`,
        success: (res) => {
          if (res.confirm) {
            const bills = this.data.bills.map(b => {
              if (b.id === billId) {
                return { ...b, isPaid: true, paidTime: new Date().toISOString() };
              }
              return b;
            });
            wx.setStorageSync('bills', bills);
            this.loadBills();
            wx.showToast({
              title: '结账成功',
              icon: 'success'
            });
          }
        }
      });
    }
  },

  goBack() {
    wx.navigateBack();
  }
});

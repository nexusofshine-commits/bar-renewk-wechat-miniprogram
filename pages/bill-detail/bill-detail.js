Page({
  data: {
    bill: null
  },

  onLoad(options) {
    const billId = options.billId;
    if (billId) {
      this.loadBillDetail(billId);
    }
  },

  loadBillDetail(billId) {
    try {
      const historyBills = wx.getStorageSync('historyBills') || [];
      const bill = historyBills.find(b => b.id == billId);
      if (bill) {
        this.setData({
          bill
        });
      }
    } catch (e) {
      console.error('Error loading bill detail:', e);
    }
  },

  formatDate(timeStr) {
    const date = new Date(timeStr);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  formatTime(timeStr) {
    const date = new Date(timeStr);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  },

  getPrice(cocktail) {
    if (cocktail.price) {
      return cocktail.price;
    } else if (cocktail.price_range) {
      return Math.round((cocktail.price_range[0] + cocktail.price_range[1]) / 2);
    }
    return 0;
  }
});

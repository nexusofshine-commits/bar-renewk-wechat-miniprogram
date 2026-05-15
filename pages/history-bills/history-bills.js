Page({
  data: {
    bills: []
  },

  onLoad() {
    this.loadHistoryBills();
  },

  onShow() {
    this.loadHistoryBills();
  },

  loadHistoryBills() {
    try {
      const historyBills = wx.getStorageSync('historyBills') || [];
      this.setData({
        bills: historyBills
      });
    } catch (e) {
      console.error('Error loading history bills:', e);
    }
  },

  formatDate(timeStr) {
    const date = new Date(timeStr);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  viewBillDetail(e) {
    const billId = e.currentTarget.dataset.billId;
    wx.navigateTo({
      url: `/pages/bill-detail/bill-detail?billId=${billId}`
    });
  }
});

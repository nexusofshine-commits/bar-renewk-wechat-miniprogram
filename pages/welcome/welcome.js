const barData = require('../../utils/data.js');

Page({
  data: {
    venueName: '',
    showNewCustomerOffer: true,
    offerOptions: [],
    clickCount: 0,
    lastClickTime: 0,
    showHint: false
  },

  onLoad() {
    this.setData({
      venueName: barData.venue.name,
      offerOptions: barData.venue.new_customer_offer.options
    });
  },

  onShow() {
  },

  handleStart() {
    const now = Date.now();
    const { lastClickTime, clickCount } = this.data;

    if (now - lastClickTime < 500) {
      const newCount = clickCount + 1;
      this.setData({
        clickCount: newCount,
        lastClickTime: now
      });

      if (newCount >= 5) {
        this.setData({ clickCount: 0, showHint: false });
        wx.navigateTo({
          url: '/pages/bartender/bartender'
        });
        return;
      }

      if (newCount === 3) {
        this.setData({ showHint: true });
      }
    } else {
      this.setData({
        clickCount: 1,
        lastClickTime: now,
        showHint: false
      });
    }

    wx.navigateTo({
      url: '/pages/steps/steps'
    });
  }
});

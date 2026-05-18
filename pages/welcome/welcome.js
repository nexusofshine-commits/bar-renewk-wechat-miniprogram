const barData = require('../../utils/data.js');

let clickCount = 0;
let clickTimer = null;

Page({
  data: {
    venueName: '',
    showNewCustomerOffer: true,
    offerOptions: []
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
    wx.navigateTo({
      url: '/pages/steps/steps'
    });
  },

  onIconTap() {
    clickCount++;

    if (clickTimer) {
      clearTimeout(clickTimer);
    }

    if (clickCount >= 5) {
      clickCount = 0;
      if (clickTimer) {
        clearTimeout(clickTimer);
        clickTimer = null;
      }
      wx.navigateTo({
        url: '/pages/bartender/bartender'
      });
      return;
    }

    wx.showToast({
      title: `还需点击 ${5 - clickCount} 次进入后台`,
      icon: 'none',
      duration: 1000
    });

    clickTimer = setTimeout(() => {
      clickCount = 0;
    }, 2000);
  }
});

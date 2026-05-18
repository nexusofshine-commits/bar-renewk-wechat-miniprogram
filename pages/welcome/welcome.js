const barData = require('../../utils/data.js');

let clickCount = 0;
let clickTimer = null;

Page({
  data: {
    venueName: '',
    showNewCustomerOffer: true,
    offerOptions: [],
    showHint: false
  },

  onLoad() {
    this.setData({
      venueName: barData.venue.name,
      offerOptions: barData.venue.new_customer_offer.options
    });
    clickCount = 0;
  },

  onShow() {
  },

  handleStart(e) {
    const now = Date.now();
    const targetText = e.currentTarget.dataset.text || '';
    
    if (targetText !== 'Bar Kenny') {
      clickCount = 0;
      if (clickTimer) {
        clearTimeout(clickTimer);
        clickTimer = null;
      }
      
      wx.navigateTo({
        url: '/pages/steps/steps'
      });
      return;
    }

    clickCount++;

    if (clickTimer) {
      clearTimeout(clickTimer);
    }

    if (clickCount >= 5) {
      clickCount = 0;
      wx.navigateTo({
        url: '/pages/bartender/bartender'
      });
      return;
    }

    if (clickCount >= 3) {
      this.setData({ showHint: true });
    }

    clickTimer = setTimeout(() => {
      clickCount = 0;
      this.setData({ showHint: false });
    }, 2000);

    wx.navigateTo({
      url: '/pages/steps/steps'
    });
  },

  onTitleTap() {
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

    if (clickCount >= 3) {
      wx.showToast({
        title: `还需点击 ${5 - clickCount} 次进入后台`,
        icon: 'none',
        duration: 1000
      });
    }

    clickTimer = setTimeout(() => {
      clickCount = 0;
    }, 2000);
  }
});

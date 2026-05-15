const barData = require('../../utils/data.js');

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
  }
});

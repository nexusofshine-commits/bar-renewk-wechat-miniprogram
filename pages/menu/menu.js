const barData = require('../../utils/data.js');

Page({
  data: {
    cocktails: [],
    searchKeyword: '',
    currentTab: 'all',
    tabs: [
      { id: 'all', label: '全部' },
      { id: 'strength_low', label: '低度' },
      { id: 'strength_mid', label: '中度' },
      { id: 'strength_high', label: '高度' }
    ],
    filteredCocktails: []
  },

  onLoad() {
    this.setData({
      cocktails: barData.cocktails
    });
    this.filterCocktails();
  },

  onSearch(e) {
    const keyword = e.detail.value.toLowerCase();
    this.setData({
      searchKeyword: keyword
    });
    this.filterCocktails();
  },

  switchTab(e) {
    const tabId = e.currentTarget.dataset.tabId;
    this.setData({
      currentTab: tabId
    });
    this.filterCocktails();
  },

  filterCocktails() {
    let filtered = this.data.cocktails;
    
    if (this.data.currentTab !== 'all') {
      filtered = filtered.filter(cocktail => cocktail.strength === this.data.currentTab);
    }
    
    if (this.data.searchKeyword) {
      const keyword = this.data.searchKeyword.toLowerCase();
      filtered = filtered.filter(cocktail => {
        return cocktail.name.toLowerCase().includes(keyword) ||
               cocktail.name_en.toLowerCase().includes(keyword) ||
               cocktail.description.toLowerCase().includes(keyword);
      });
    }
    
    this.setData({
      filteredCocktails: filtered
    });
  },

  goToResult(e) {
    const cocktailId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/result/result?cocktailId=${cocktailId}`
    });
  },

  orderSpecial() {
    wx.showModal({
      title: '特调下单',
      editable: true,
      placeholderText: '请输入特调名称（如：我的特调）',
      success: (res) => {
        if (res.confirm && res.content) {
          this.saveSpecialOrder(res.content);
        }
      }
    });
  },

  saveSpecialOrder(name) {
    wx.getUserProfile({
      desc: '用于保存您的下单记录',
      success: (res) => {
        const order = {
          cocktail: {
            id: 'special',
            name: name,
            name_en: 'Special',
            price: 58,
            description: '特调鸡尾酒'
          },
          isSpecial: true,
          userInfo: {
            nickName: res.userInfo.nickName,
            avatarUrl: res.userInfo.avatarUrl
          },
          orderTime: new Date().toISOString()
        };

        try {
          const orders = wx.getStorageSync('orders') || [];
          orders.push(order);
          wx.setStorageSync('orders', orders);

          wx.showModal({
            title: '下单成功',
            content: `已为您下单特调：${name}，价格 ¥58，请稍等片刻`,
            showCancel: false
          });
        } catch (e) {
          console.error('Error saving order:', e);
          wx.showToast({
            title: '下单失败',
            icon: 'none'
          });
        }
      },
      fail: () => {
        wx.showToast({
          title: '需要授权才能下单',
          icon: 'none'
        });
      }
    });
  },

  goBack() {
    wx.navigateBack();
  }
});

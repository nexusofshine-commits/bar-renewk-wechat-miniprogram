const barData = require('../../utils/data.js');
const { rerollSameBase } = require('../../utils/matcher.js');

Page({
  data: {
    selections: {},
    matchedCocktails: [],
    primaryCocktails: [],
    alternativeCocktails: [],
    currentPrimaryIndex: 0,
    currentAlternativeIndex: 0,
    currentTab: 'primary',
    currentCocktail: {},
    cocktailPrice: '',
    userInfo: null,
    hasOrdered: false
  },

  onLoad(options) {
    if (options.cocktailId) {
      this.loadSingleCocktail(options.cocktailId);
    } else {
      this.loadMatchedCocktails();
    }
  },

  onShow() {
    const hasOrdered = wx.getStorageSync('hasOrdered') || false;
    this.setData({ hasOrdered });
  },

  loadSingleCocktail(cocktailId) {
    const cocktail = barData.cocktails.find(c => c.id === cocktailId);
    if (cocktail) {
      const price = this.formatPrice(cocktail);
      this.setData({
        currentCocktail: cocktail,
        cocktailPrice: price,
        currentTab: 'primary'
      });
    }
  },

  loadMatchedCocktails() {
    try {
      const selections = wx.getStorageSync('selections');
      const matchedCocktails = wx.getStorageSync('matchedCocktails') || [];

      const primaryCocktails = matchedCocktails.slice(0, 3);
      const alternativeCocktails = matchedCocktails.slice(3);

      this.setData({
        selections,
        matchedCocktails,
        primaryCocktails,
        alternativeCocktails,
        currentPrimaryIndex: 0,
        currentAlternativeIndex: 0
      });

      this.updateCurrentCocktail();
    } catch (e) {
      console.error('Error loading data from storage:', e);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  },

  updateCurrentCocktail() {
    let currentCocktail;
    
    if (this.data.currentTab === 'primary') {
      currentCocktail = this.data.primaryCocktails[this.data.currentPrimaryIndex];
    } else {
      currentCocktail = this.data.alternativeCocktails[this.data.currentAlternativeIndex];
    }

    if (!currentCocktail) {
      currentCocktail = this.data.primaryCocktails[0];
    }

    const cocktailPrice = this.formatPrice(currentCocktail);

    this.setData({
      currentCocktail,
      cocktailPrice
    });
  },

  formatPrice(cocktail) {
    if (cocktail.price) {
      return `¥${cocktail.price}`;
    } else if (cocktail.price_range) {
      return `¥${cocktail.price_range[0]}-${cocktail.price_range[1]}`;
    }
    return '';
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    const newIndex = tab === 'primary' ? this.data.currentPrimaryIndex : this.data.currentAlternativeIndex;
    
    this.setData({
      currentTab: tab,
      currentPrimaryIndex: tab === 'primary' ? newIndex : 0,
      currentAlternativeIndex: tab === 'alternative' ? newIndex : 0
    });
    
    this.updateCurrentCocktail();
  },

  selectPrimary(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      currentPrimaryIndex: index,
      currentTab: 'primary'
    });
    this.updateCurrentCocktail();
  },

  selectAlternative(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      currentAlternativeIndex: index,
      currentTab: 'alternative'
    });
    this.updateCurrentCocktail();
  },

  handleOrder() {
    if (this.data.hasOrdered) {
      wx.showToast({
        title: '您已下单过',
        icon: 'none'
      });
      return;
    }

    wx.getUserProfile({
      desc: '用于保存您的下单记录',
      success: (res) => {
        const userInfo = res.userInfo;
        this.setData({ userInfo });
        
        this.saveOrder(userInfo);
      },
      fail: () => {
        wx.showToast({
          title: '需要授权才能下单',
          icon: 'none'
        });
      }
    });
  },

  saveOrder(userInfo) {
    const order = {
      cocktail: this.data.currentCocktail,
      selections: this.data.selections,
      userInfo: {
        nickName: userInfo.nickName,
        avatarUrl: userInfo.avatarUrl
      },
      orderTime: new Date().toISOString()
    };

    try {
      const orders = wx.getStorageSync('orders') || [];
      orders.push(order);
      wx.setStorageSync('orders', orders);
      wx.setStorageSync('hasOrdered', true);
      
      this.setData({ hasOrdered: true });

      wx.showModal({
        title: '下单成功',
        content: `已为您下单：${this.data.currentCocktail.name}，请稍等片刻`,
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

  reroll() {
    const cocktails = this.data.currentTab === 'primary' 
      ? this.data.primaryCocktails 
      : this.data.alternativeCocktails;
    
    const currentIndex = this.data.currentTab === 'primary' 
      ? this.data.currentPrimaryIndex 
      : this.data.currentAlternativeIndex;

    const newIndex = rerollSameBase(
      cocktails,
      this.data.selections.base,
      currentIndex
    );

    if (newIndex !== currentIndex) {
      if (this.data.currentTab === 'primary') {
        this.setData({ currentPrimaryIndex: newIndex });
      } else {
        this.setData({ currentAlternativeIndex: newIndex });
      }
      this.updateCurrentCocktail();
    }
  },

  startOver() {
    wx.reLaunch({
      url: '/pages/welcome/welcome'
    });
  },

  goToMenu() {
    wx.navigateTo({
      url: '/pages/menu/menu'
    });
  }
});

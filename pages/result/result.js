const barData = require('../../utils/data.js');
const { rerollSameBase } = require('../../utils/matcher.js');

Page({
  data: {
    selections: {},
    matchedCocktails: [],
    primaryCocktails: [],
    alternativeCocktails: [],
    currentIndex: 0,
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
        cocktailPrice: price
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
        currentIndex: 0
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
    const currentCocktail = this.data.primaryCocktails[this.data.currentIndex];
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
      const midPrice = Math.round((cocktail.price_range[0] + cocktail.price_range[1]) / 2);
      return `¥${midPrice}`;
    }
    return '';
  },

  selectPrimary(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      currentIndex: index
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
      wx.setStorageSync('userInfo', userInfo);
      const orders = wx.getStorageSync('orders') || [];
      orders.push(order);
      wx.setStorageSync('orders', orders);
      wx.setStorageSync('hasOrdered', true);
      
      this.setData({ hasOrdered: true });

      wx.redirectTo({
        url: '/pages/order-success/order-success'
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
    const alternatives = this.data.alternativeCocktails;
    if (alternatives.length === 0) {
      wx.showToast({
        title: '没有更多选择了',
        icon: 'none'
      });
      return;
    }

    const randomIndex = Math.floor(Math.random() * alternatives.length);
    const newCocktail = alternatives[randomIndex];
    
    const newPrimaryCocktails = [...this.data.primaryCocktails];
    newPrimaryCocktails[this.data.currentIndex] = newCocktail;

    const newAlternativeCocktails = [...alternatives];
    newAlternativeCocktails.splice(randomIndex, 1);
    newAlternativeCocktails.push(this.data.primaryCocktails[this.data.currentIndex]);

    this.setData({
      primaryCocktails: newPrimaryCocktails,
      alternativeCocktails: newAlternativeCocktails
    });

    this.updateCurrentCocktail();
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

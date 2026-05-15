Page({
  data: {
    userOrders: [],
    allOrders: [],
    userRankings: [],
    totalAlcohol: 0
  },

  onLoad() {
    this.calculateRankings();
  },

  calculateRankings() {
    try {
      const orders = wx.getStorageSync('orders') || [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayOrders = orders.filter(order => {
        const orderDate = new Date(order.orderTime);
        return orderDate >= today;
      });

      const userMap = {};
      let userAlcohol = 0;

      todayOrders.forEach(order => {
        const userId = order.userInfo.nickName;
        
        if (!userMap[userId]) {
          userMap[userId] = {
            userInfo: order.userInfo,
            count: 0,
            alcohol: 0
          };
        }
        
        userMap[userId].count++;
        
        const alcohol = this.getAlcoholIntake(order.cocktail);
        userMap[userId].alcohol += alcohol;

        const currentUser = wx.getStorageSync('userInfo');
        if (currentUser && order.userInfo.nickName === currentUser.nickName) {
          userAlcohol += alcohol;
        }
      });

      const userRankings = Object.values(userMap)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      this.setData({
        allOrders: todayOrders,
        userRankings,
        totalAlcohol: userAlcohol
      });
    } catch (e) {
      console.error('Error calculating rankings:', e);
    }
  },

  getAlcoholIntake(cocktail) {
    const strength = cocktail.strength;
    let alcoholPercent = 0;

    if (strength === 'strength_low') {
      alcoholPercent = 8;
    } else if (strength === 'strength_mid') {
      alcoholPercent = 18;
    } else if (strength === 'strength_high') {
      alcoholPercent = 30;
    }

    const volume = 150;
    return (alcoholPercent / 100) * volume * 0.789;
  },

  formatAlcohol(grams) {
    return grams.toFixed(1);
  },

  goToHome() {
    wx.switchTab({
      url: '/pages/welcome/welcome'
    });
  },

  goToOrders() {
    wx.switchTab({
      url: '/pages/orders/orders'
    });
  }
});

const barData = require('../../utils/data.js');

Page({
  data: {
    cocktails: [],
    searchKeyword: '',
    filteredCocktails: []
  },

  onLoad() {
    this.setData({
      cocktails: barData.cocktails,
      filteredCocktails: barData.cocktails
    });
  },

  onSearch(e) {
    const keyword = e.detail.value.toLowerCase();
    const filtered = this.data.cocktails.filter(cocktail => {
      return cocktail.name.toLowerCase().includes(keyword) ||
             cocktail.name_en.toLowerCase().includes(keyword) ||
             cocktail.description.toLowerCase().includes(keyword);
    });
    this.setData({
      searchKeyword: keyword,
      filteredCocktails: filtered
    });
  },

  goToResult(e) {
    const cocktailId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/result/result?cocktailId=${cocktailId}`
    });
  },

  goBack() {
    wx.navigateBack();
  }
});

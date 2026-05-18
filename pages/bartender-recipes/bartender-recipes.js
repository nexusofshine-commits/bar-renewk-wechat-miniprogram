const barData = require('../../utils/data.js');

Page({
  data: {
    cocktails: [],
    filteredCocktails: [],
    currentTab: 'all',
    materialNames: {
      gin: '金酒',
      vodka: '伏特加',
      rum: '朗姆酒',
      whiskey: '威士忌',
      tequila: '龙舌兰',
      brandy: '白兰地',
      tonic: '汤力水',
      soda: '苏打水',
      lime: '青柠',
      lemon: '柠檬',
      grapefruit: '西柚',
      pineapple: '菠萝',
      orange: '橙子',
      mint: '薄荷',
      sugar: '糖浆',
      vermouth: '苦艾酒',
      campari: '金巴利',
      coconut: '椰子',
      triple_sec: '橙皮酒',
      cointreau: '君度'
    }
  },

  onLoad() {
    this.loadCocktails();
  },

  onShow() {
    this.loadCocktails();
  },

  loadCocktails() {
    const recipeData = wx.getStorageSync('recipeData') || {};
    
    const cocktails = barData.cocktails.map(cocktail => {
      const savedData = recipeData[cocktail.id] || {};
      return {
        ...cocktail,
        isActive: savedData.isActive !== undefined ? savedData.isActive : true,
        price: savedData.price || cocktail.price,
        materials: savedData.materials || this.getDefaultMaterials(cocktail),
        sales: savedData.sales || 0
      };
    });

    this.setData({ cocktails });
    this.filterCocktails();
  },

  getDefaultMaterials(cocktail) {
    const materialsMap = {
      gin_tonic: [{name: 'gin', amount: 45}, {name: 'tonic', amount: 150}],
      canton_gt: [{name: 'gin', amount: 45}, {name: 'tonic', amount: 150}],
      thai_gt: [{name: 'gin', amount: 45}, {name: 'tonic', amount: 150}],
      highball: [{name: 'whiskey', amount: 45}, {name: 'soda', amount: 150}],
      paloma: [{name: 'tequila', amount: 45}, {name: 'grapefruit', amount: 150}],
      gin_fizz: [{name: 'gin', amount: 45}, {name: 'lime', amount: 20}],
      sidecar: [{name: 'brandy', amount: 45}, {name: 'orange', amount: 20}],
      whiskey_sour: [{name: 'whiskey', amount: 45}, {name: 'lemon', amount: 20}],
      dry_martini: [{name: 'gin', amount: 60}, {name: 'vermouth', amount: 10}],
      manhattan: [{name: 'whiskey', amount: 60}, {name: 'vermouth', amount: 10}],
      paper_plane: [{name: 'bourbon', amount: 30}, {name: 'aperol', amount: 30}]
    };

    return materialsMap[cocktail.id] || [{name: 'gin', amount: 45}];
  },

  filterCocktails() {
    const { cocktails, currentTab } = this.data;
    
    let filtered = cocktails;
    if (currentTab === 'active') {
      filtered = cocktails.filter(c => c.isActive);
    } else if (currentTab === 'inactive') {
      filtered = cocktails.filter(c => !c.isActive);
    }

    this.setData({ filteredCocktails: filtered });
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ currentTab: tab });
    this.filterCocktails();
  },

  getMaterialsText(cocktail) {
    const { materialNames } = this.data;
    return cocktail.materials.map(m => {
      const name = materialNames[m.name] || m.name;
      return `${name} ${m.amount}ml`;
    }).join('、');
  },

  toggleStatus(e) {
    const id = e.currentTarget.dataset.id;
    const cocktails = this.data.cocktails.map(c => {
      if (c.id === id) {
        return {...c, isActive: !c.isActive};
      }
      return c;
    });

    this.saveRecipeData(cocktails);
    wx.showToast({
      title: cocktails.find(c => c.id === id).isActive ? '已上架' : '已下架',
      icon: 'success'
    });
  },

  editPrice(e) {
    const id = e.currentTarget.dataset.id;
    const cocktail = this.data.cocktails.find(c => c.id === id);
    
    wx.showModal({
      title: '修改价格',
      editable: true,
      placeholderText: '请输入新价格',
      content: String(cocktail.price),
      success: (res) => {
        if (res.confirm && res.content) {
          const newPrice = parseInt(res.content);
          if (!isNaN(newPrice) && newPrice > 0) {
            const cocktails = this.data.cocktails.map(c => {
              if (c.id === id) {
                return {...c, price: newPrice};
              }
              return c;
            });
            this.saveRecipeData(cocktails);
            wx.showToast({
              title: '价格已更新',
              icon: 'success'
            });
          } else {
            wx.showToast({
              title: '请输入有效价格',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  editRecipe(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/bartender-recipe-detail/bartender-recipe-detail?id=${id}`
    });
  },

  saveRecipeData(cocktails) {
    const recipeData = {};
    cocktails.forEach(c => {
      recipeData[c.id] = {
        isActive: c.isActive,
        price: c.price,
        materials: c.materials,
        sales: c.sales
      };
    });
    wx.setStorageSync('recipeData', recipeData);
    this.setData({ cocktails });
    this.filterCocktails();
  },

  goBack() {
    wx.navigateBack();
  }
});

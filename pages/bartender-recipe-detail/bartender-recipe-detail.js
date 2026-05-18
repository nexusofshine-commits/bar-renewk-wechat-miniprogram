const barData = require('../../utils/data.js');

Page({
  data: {
    cocktailId: '',
    cocktail: {},
    materialNames: {
      gin: '金酒',
      vodka: '伏特加',
      rum: '朗姆酒',
      whiskey: '威士忌',
      tequila: '龙舌兰',
      brandy: '白兰地',
      tonic: '汤力水',
      soda: '苏打水',
      lime: '青柠汁',
      lemon: '柠檬汁',
      grapefruit: '西柚汁',
      pineapple: '菠萝汁',
      orange: '橙汁',
      mint: '薄荷',
      sugar: '糖浆',
      vermouth: '苦艾酒',
      campari: '金巴利',
      coconut: '椰子',
      triple_sec: '橙皮酒',
      cointreau: '君度'
    }
  },

  onLoad(options) {
    const { id } = options;
    this.setData({ cocktailId: id });
    this.loadCocktail();
  },

  loadCocktail() {
    const recipeData = wx.getStorageSync('recipeData') || {};
    const cocktail = barData.cocktails.find(c => c.id === this.data.cocktailId);
    
    if (cocktail) {
      const savedData = recipeData[cocktail.id] || {};
      this.setData({
        cocktail: {
          ...cocktail,
          isActive: savedData.isActive !== undefined ? savedData.isActive : true,
          price: savedData.price || cocktail.price,
          materials: savedData.materials || this.getDefaultMaterials(cocktail),
          sales: savedData.sales || 0
        }
      });
    }
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

  getMaterialName(id) {
    return this.data.materialNames[id] || id;
  },

  toggleStatus(e) {
    const isActive = e.detail.value;
    const cocktail = {...this.data.cocktail, isActive};
    this.saveCocktail(cocktail);
    wx.showToast({
      title: isActive ? '已上架' : '已下架',
      icon: 'success'
    });
  },

  updateMaterialAmount(e) {
    const index = e.currentTarget.dataset.index;
    const amount = parseInt(e.detail.value) || 0;
    
    const materials = [...this.data.cocktail.materials];
    materials[index].amount = amount;
    
    const cocktail = {...this.data.cocktail, materials};
    this.saveCocktail(cocktail);
  },

  deleteMaterial(e) {
    const index = e.currentTarget.dataset.index;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个材料吗？',
      success: (res) => {
        if (res.confirm) {
          const materials = [...this.data.cocktail.materials];
          materials.splice(index, 1);
          
          const cocktail = {...this.data.cocktail, materials};
          this.saveCocktail(cocktail);
          wx.showToast({
            title: '已删除',
            icon: 'success'
          });
        }
      }
    });
  },

  addMaterial() {
    const { materialNames } = this.data;
    const currentMaterials = this.data.cocktail.materials.map(m => m.name);
    const availableMaterials = Object.keys(materialNames).filter(id => !currentMaterials.includes(id));
    
    if (availableMaterials.length === 0) {
      wx.showToast({
        title: '所有材料已添加',
        icon: 'none'
      });
      return;
    }

    wx.showModal({
      title: '添加材料',
      editable: true,
      placeholderText: '输入材料ID和用量，用逗号分隔\n如: gin,45',
      content: '',
      success: (res) => {
        if (res.confirm && res.content) {
          const parts = res.content.split(',');
          if (parts.length === 2) {
            const [id, amount] = parts;
            const materialId = id.trim();
            const materialAmount = parseInt(parts[1].trim()) || 45;
            
            if (materialNames[materialId]) {
              const materials = [...this.data.cocktail.materials];
              materials.push({ name: materialId, amount: materialAmount });
              
              const cocktail = {...this.data.cocktail, materials};
              this.saveCocktail(cocktail);
              wx.showToast({
                title: '材料已添加',
                icon: 'success'
              });
            } else {
              wx.showToast({
                title: '材料不存在',
                icon: 'none'
              });
            }
          } else {
            wx.showToast({
              title: '格式错误',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  editPrice() {
    const cocktail = this.data.cocktail;
    
    wx.showModal({
      title: '修改价格',
      editable: true,
      placeholderText: '输入新价格',
      content: String(cocktail.price),
      success: (res) => {
        if (res.confirm && res.content) {
          const newPrice = parseInt(res.content);
          if (!isNaN(newPrice) && newPrice > 0) {
            const updatedCocktail = {...cocktail, price: newPrice};
            this.saveCocktail(updatedCocktail);
            wx.showToast({
              title: '价格已更新',
              icon: 'success'
            });
          }
        }
      }
    });
  },

  resetSales() {
    wx.showModal({
      title: '确认重置',
      content: '确定要重置销量吗？',
      success: (res) => {
        if (res.confirm) {
          const cocktail = {...this.data.cocktail, sales: 0};
          this.saveCocktail(cocktail);
          wx.showToast({
            title: '销量已重置',
            icon: 'success'
          });
        }
      }
    });
  },

  saveCocktail(cocktail) {
    const recipeData = wx.getStorageSync('recipeData') || {};
    recipeData[cocktail.id] = {
      isActive: cocktail.isActive,
      price: cocktail.price,
      materials: cocktail.materials,
      sales: cocktail.sales
    };
    wx.setStorageSync('recipeData', recipeData);
    this.setData({ cocktail });
  },

  goBack() {
    wx.navigateBack();
  }
});

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
    },
    showMaterialPicker: false,
    availableInventory: [],
    selectedMaterialIndex: -1,
    newMaterialAmount: '',
    newTag: '',
    calculatedABV: 0
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
          sales: savedData.sales || 0,
          tags: savedData.tags || []
        }
      });
      
      this.loadAvailableInventory();
      this.calculateABV();
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

  loadAvailableInventory() {
    const inventory = wx.getStorageSync('inventory') || [];
    const currentMaterials = this.data.cocktail.materials.map(m => m.name);
    const availableInventory = inventory.filter(item => !currentMaterials.includes(item.id));
    this.setData({ availableInventory });
  },

  calculateABV() {
    const { cocktail } = this.data;
    const inventory = wx.getStorageSync('inventory') || [];
    
    let totalAlcohol = 0;
    let totalVolume = 0;

    cocktail.materials.forEach(material => {
      const inventoryItem = inventory.find(i => i.id === material.name);
      const abv = inventoryItem && inventoryItem.abv ? inventoryItem.abv : 0;
      const amount = material.amount || 0;
      
      totalAlcohol += (abv / 100) * amount;
      totalVolume += amount;
    });

    const calculatedABV = totalVolume > 0 ? Math.round((totalAlcohol / totalVolume) * 100 * 10) / 10 : 0;
    this.setData({ calculatedABV });
  },

  getMaterialName(id) {
    return this.data.materialNames[id] || id;
  },

  getMaterialABV(id) {
    const inventory = wx.getStorageSync('inventory') || [];
    const item = inventory.find(i => i.id === id);
    return item && item.abv ? item.abv : 0;
  },

  getMaterialUnit(id) {
    const inventory = wx.getStorageSync('inventory') || [];
    const item = inventory.find(i => i.id === id);
    return item && item.unitType === 'piece' ? '件' : 'ml';
  },

  getSelectedMaterialUnit() {
    const { selectedMaterialIndex, availableInventory } = this.data;
    if (selectedMaterialIndex === -1) return 'ml';
    const item = availableInventory[selectedMaterialIndex];
    return item && item.unitType === 'piece' ? '件' : 'ml';
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
    const amount = parseFloat(e.detail.value) || 0;
    
    const materials = [...this.data.cocktail.materials];
    materials[index].amount = amount;
    
    const cocktail = {...this.data.cocktail, materials};
    this.saveCocktail(cocktail);
    this.calculateABV();
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
          this.loadAvailableInventory();
          this.calculateABV();
          wx.showToast({
            title: '已删除',
            icon: 'success'
          });
        }
      }
    });
  },

  toggleMaterialPicker() {
    this.setData({
      showMaterialPicker: !this.data.showMaterialPicker,
      selectedMaterialIndex: -1,
      newMaterialAmount: ''
    });
  },

  selectMaterial(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      selectedMaterialIndex: index,
      newMaterialAmount: ''
    });
  },

  onAmountInput(e) {
    this.setData({ newMaterialAmount: e.detail.value });
  },

  confirmAddMaterial() {
    const { selectedMaterialIndex, newMaterialAmount, availableInventory, cocktail } = this.data;
    
    if (selectedMaterialIndex === -1) {
      wx.showToast({
        title: '请先选择材料',
        icon: 'none'
      });
      return;
    }

    const amount = parseFloat(newMaterialAmount);
    if (isNaN(amount) || amount <= 0) {
      wx.showToast({
        title: '请输入有效用量',
        icon: 'none'
      });
      return;
    }

    const selectedMaterial = availableInventory[selectedMaterialIndex];
    const materials = [...cocktail.materials];
    materials.push({ name: selectedMaterial.id, amount: amount });

    const updatedCocktail = { ...cocktail, materials };
    this.saveCocktail(updatedCocktail);
    
    this.setData({
      showMaterialPicker: false,
      selectedMaterialIndex: -1,
      newMaterialAmount: ''
    });

    this.loadAvailableInventory();
    this.calculateABV();

    wx.showToast({
      title: '材料已添加',
      icon: 'success'
    });
  },

  onTagInput(e) {
    this.setData({ newTag: e.detail.value });
  },

  addTag() {
    const { newTag, cocktail } = this.data;
    
    if (!newTag.trim()) {
      wx.showToast({
        title: '请输入标签',
        icon: 'none'
      });
      return;
    }

    const tags = [...(cocktail.tags || [])];
    if (tags.includes(newTag.trim())) {
      wx.showToast({
        title: '标签已存在',
        icon: 'none'
      });
      return;
    }

    tags.push(newTag.trim());
    const updatedCocktail = { ...cocktail, tags };
    this.saveCocktail(updatedCocktail);
    this.setData({ newTag: '' });

    wx.showToast({
      title: '标签已添加',
      icon: 'success'
    });
  },

  deleteTag(e) {
    const index = e.currentTarget.dataset.index;
    const tags = [...this.data.cocktail.tags];
    tags.splice(index, 1);
    const cocktail = { ...this.data.cocktail, tags };
    this.saveCocktail(cocktail);
    wx.showToast({
      title: '标签已删除',
      icon: 'success'
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
      sales: cocktail.sales,
      tags: cocktail.tags || []
    };
    wx.setStorageSync('recipeData', recipeData);
    this.setData({ cocktail });
  },

  goBack() {
    wx.navigateBack();
  }
});

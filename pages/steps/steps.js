const barData = require('../../utils/data.js');
const { findMatches } = require('../../utils/matcher.js');

Page({
  data: {
    currentStep: 1,
    selections: {
      base: null,
      flavors: [],
      strength: null
    }
  },

  onLoad() {
    this.setData({
      selectionFlow: barData.selection_flow.steps
    });
  },

  selectBase(e) {
    const optionId = e.currentTarget.dataset.optionId;
    this.setData({
      'selections.base': optionId,
      currentStep: 2
    });
  },

  toggleFlavor(e) {
    const optionId = e.currentTarget.dataset.optionId;
    const currentFlavors = [...this.data.selections.flavors];
    const index = currentFlavors.indexOf(optionId);

    if (index > -1) {
      currentFlavors.splice(index, 1);
    } else {
      currentFlavors.push(optionId);
    }

    this.setData({
      'selections.flavors': currentFlavors
    });
  },

  confirmFlavor() {
    this.setData({
      currentStep: 3
    });
  },

  selectStrength(e) {
    const optionId = e.currentTarget.dataset.optionId;
    this.setData({
      'selections.strength': optionId
    });

    setTimeout(() => {
      this.showResults();
    }, 300);
  },

  showResults() {
    const matchedCocktails = findMatches(
      this.data.selections,
      barData.cocktails
    );

    try {
      wx.setStorageSync('selections', this.data.selections);
      wx.setStorageSync('matchedCocktails', matchedCocktails);
    } catch (e) {
      console.error('Error saving data to storage:', e);
    }

    wx.navigateTo({
      url: '/pages/result/result'
    });
  },

  goBack() {
    if (this.data.currentStep > 1) {
      this.setData({
        currentStep: this.data.currentStep - 1
      });
    } else {
      wx.navigateBack();
    }
  }
});

const barData = require('../../utils/data.js');
const { findMatches } = require('../../utils/matcher.js');

Page({
  data: {
    currentStep: 1,
    selections: {
      base: null,
      flavor: null,
      strength: null
    },
    flavorOptions: []
  },

  onLoad() {
    const flavors = barData.selection_flow.steps[1].options;
    flavors.unshift({
      id: 'no_idea',
      label: '没有想法',
      icon: '🎲',
      description: '让我来推荐'
    });
    
    this.setData({
      selectionFlow: barData.selection_flow.steps,
      flavorOptions: flavors
    });
  },

  selectBase(e) {
    const optionId = e.currentTarget.dataset.optionId;
    this.setData({
      'selections.base': optionId,
      currentStep: 2
    });
  },

  selectFlavor(e) {
    const optionId = e.currentTarget.dataset.optionId;
    this.setData({
      'selections.flavor': optionId,
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
    const selections = {
      base: this.data.selections.base,
      flavors: this.data.selections.flavor === 'no_idea' ? [] : [this.data.selections.flavor],
      strength: this.data.selections.strength
    };

    const matchedCocktails = findMatches(
      selections,
      barData.cocktails
    );

    try {
      wx.setStorageSync('selections', selections);
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

const barData = require('../../utils/data.js');
const { findMatches } = require('../../utils/matcher.js');

Page({
  data: {
    currentStep: 1,
    stepsData: [],
    currentStepData: {},
    selections: {
      base: null,
      flavors: [],
      strength: null
    },
    flavorOptions: []
  },

  onLoad() {
    this.setData({
      stepsData: barData.selection_flow.steps,
      currentStepData: barData.selection_flow.steps[0],
      flavorOptions: barData.selection_flow.steps[1].options
    });
  },

  onShow() {
  },

  updateCurrentStepData() {
    const stepIndex = this.data.currentStep - 1;
    if (stepIndex >= 0 && stepIndex < this.data.stepsData.length) {
      this.setData({
        currentStepData: this.data.stepsData[stepIndex]
      });
    }
  },

  selectBase(e) {
    const optionId = e.currentTarget.dataset.optionId;
    this.setData({
      'selections.base': optionId
    });

    setTimeout(() => {
      if (this.data.currentStep === 1) {
        this.goNext();
      }
    }, 500);
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

  selectStrength(e) {
    const optionId = e.currentTarget.dataset.optionId;
    this.setData({
      'selections.strength': optionId
    });

    setTimeout(() => {
      if (this.data.currentStep === 3) {
        this.showResults();
      }
    }, 500);
  },

  goPrev() {
    if (this.data.currentStep > 1) {
      this.setData({
        currentStep: this.data.currentStep - 1
      });
      this.updateCurrentStepData();
    }
  },

  goNext() {
    if (this.data.currentStep < 3) {
      this.setData({
        currentStep: this.data.currentStep + 1
      });
      this.updateCurrentStepData();
    }
  },

  showResults() {
    const matchedCocktails = findMatches(
      this.data.selections,
      barData.cocktails
    );

    try {
      wx.setStorageSync('selections', this.data.selections);
      wx.setStorageSync('matchedCocktails', matchedCocktails);
      wx.setStorageSync('currentResultIndex', 0);
    } catch (e) {
      console.error('Error saving data to storage:', e);
    }

    wx.navigateTo({
      url: '/pages/result/result'
    });
  }
});

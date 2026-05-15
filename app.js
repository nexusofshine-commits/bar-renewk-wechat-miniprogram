App({
  globalData: {
    venue: null,
    selections: {
      base: null,
      flavors: [],
      strength: null
    },
    matchedCocktails: [],
    currentResultIndex: 0
  },

  onLaunch() {
    console.log('Bar RenewK 小程序启动')
  },

  onShow() {
    console.log('小程序显示')
  },

  onHide() {
    console.log('小程序隐藏')
  }
})

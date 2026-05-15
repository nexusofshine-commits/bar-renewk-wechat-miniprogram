const barData = require('../../utils/data.js');
const { rerollSameBase } = require('../../utils/matcher.js');

Page({
  data: {
    selections: {},
    matchedCocktails: [],
    currentResultIndex: 0,
    currentCocktail: {},
    alternatives: [],
    showAlternatives: false,
    showReroll: true,
    cocktailPrice: ''
  },

  onLoad() {
    try {
      const selections = wx.getStorageSync('selections');
      const matchedCocktails = wx.getStorageSync('matchedCocktails');
      const currentResultIndex = wx.getStorageSync('currentResultIndex') || 0;

      this.setData({
        selections,
        matchedCocktails,
        currentResultIndex
      });

      this.updateDisplay();
    } catch (e) {
      console.error('Error loading data from storage:', e);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  },

  onShow() {
    this.drawRadarChart();
  },

  onReady() {
    this.drawRadarChart();
  },

  updateDisplay() {
    const currentCocktail = this.data.matchedCocktails[this.data.currentResultIndex];
    const showTop = 3;
    const alternatives = this.data.matchedCocktails
      .slice(1, showTop + 1)
      .map((cocktail, index) => ({
        index: index + 1,
        cocktail
      }));

    let cocktailPrice = '';
    if (currentCocktail.price) {
      cocktailPrice = `¥${currentCocktail.price}`;
    } else if (currentCocktail.price_range) {
      cocktailPrice = `¥${currentCocktail.price_range[0]} - ¥${currentCocktail.price_range[1]}`;
    }

    this.setData({
      currentCocktail,
      alternatives,
      showAlternatives: alternatives.length > 0,
      cocktailPrice
    });

    this.drawRadarChart();
  },

  drawRadarChart() {
    const currentCocktail = this.data.currentCocktail;
    if (!currentCocktail || !currentCocktail.radar) {
      return;
    }

    const query = wx.createSelectorQuery();
    query.select('#radarCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0]) {
          return;
        }

        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');

        const dpr = wx.getSystemInfoSync().pixelRatio;
        canvas.width = res[0].width * dpr;
        canvas.height = res[0].height * dpr;
        ctx.scale(dpr, dpr);

        const centerX = res[0].width / 2;
        const centerY = res[0].height / 2;
        const radius = Math.min(centerX, centerY) - 30;

        const radarData = currentCocktail.radar;
        const axes = [
          { key: 'sour', label: '酸' },
          { key: 'sweet', label: '甜' },
          { key: 'bitter', label: '苦' },
          { key: 'strong', label: '烈' },
          { key: 'fruity', label: '果味' }
        ];

        this.drawBackground(ctx, centerX, centerY, radius);
        this.drawAxes(ctx, centerX, centerY, radius, axes);
        this.drawData(ctx, centerX, centerY, radius, axes, radarData);
      });
  },

  drawBackground(ctx, centerX, centerY, radius) {
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.2)';
    ctx.lineWidth = 1;

    for (let i = 1; i <= 5; i++) {
      const currentRadius = (radius * i) / 5;
      ctx.beginPath();
      for (let j = 0; j < 5; j++) {
        const angle = (j * 2 * Math.PI) / 5 - Math.PI / 2;
        const x = centerX + currentRadius * Math.cos(angle);
        const y = centerY + currentRadius * Math.sin(angle);
        if (j === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.stroke();
    }
  },

  drawAxes(ctx, centerX, centerY, radius, axes) {
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.3)';
    ctx.lineWidth = 1;

    axes.forEach((axis, index) => {
      const angle = (index * 2 * Math.PI) / axes.length - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.stroke();

      const labelX = centerX + (radius + 15) * Math.cos(angle);
      const labelY = centerY + (radius + 15) * Math.sin(angle);

      ctx.fillStyle = '#808080';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(axis.label, labelX, labelY);
    });
  },

  drawData(ctx, centerX, centerY, radius, axes, radarData) {
    ctx.fillStyle = 'rgba(212, 175, 55, 0.3)';
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 2;

    ctx.beginPath();

    axes.forEach((axis, index) => {
      const value = radarData[axis.key] || 0;
      const angle = (index * 2 * Math.PI) / axes.length - Math.PI / 2;
      const x = centerX + (value / 5) * radius * Math.cos(angle);
      const y = centerY + (value / 5) * radius * Math.sin(angle);

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  },

  selectAlternative(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      currentResultIndex: index
    });
    this.updateDisplay();
  },

  reroll() {
    const newIndex = rerollSameBase(
      this.data.matchedCocktails,
      this.data.selections.base,
      this.data.currentResultIndex
    );

    if (newIndex !== this.data.currentResultIndex) {
      this.setData({
        currentResultIndex: newIndex
      });
      this.updateDisplay();
    }
  },

  startOver() {
    wx.reLaunch({
      url: '/pages/welcome/welcome'
    });
  }
});

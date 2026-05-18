Page({
  data: {
    inventory: [],
    filteredInventory: [],
    currentTab: 'all',
    showModal: false,
    modalType: 'add',
    editingId: '',
    formData: {
      brand: '',
      name: '',
      abv: '',
      unitType: 'ml',
      quantity: '',
      unitPrice: ''
    }
  },

  onLoad() {
    this.loadInventory();
  },

  onShow() {
    this.loadInventory();
  },

  loadInventory() {
    const inventory = wx.getStorageSync('inventory') || [];
    inventory.forEach(item => {
      const percent = (item.currentStock / item.initialStock) * 100;
      if (percent <= 20) {
        item.warningLevel = 'critical';
      } else if (percent <= 40) {
        item.warningLevel = 'warning';
      } else {
        item.warningLevel = 'normal';
      }
    });

    inventory.sort((a, b) => {
      const levelOrder = { critical: 0, warning: 1, normal: 2 };
      return levelOrder[a.warningLevel] - levelOrder[b.warningLevel];
    });

    this.setData({ inventory });
    this.filterInventory();
  },

  filterInventory() {
    const { inventory, currentTab } = this.data;
    
    let filtered = inventory;
    if (currentTab === 'warning') {
      filtered = inventory.filter(item => 
        item.warningLevel === 'critical' || item.warningLevel === 'warning'
      );
    } else if (currentTab === 'normal') {
      filtered = inventory.filter(item => item.warningLevel === 'normal');
    }

    this.setData({ filteredInventory: filtered });
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ currentTab: tab });
    this.filterInventory();
  },

  getUsagePercent(item) {
    return Math.round((item.currentStock / item.initialStock) * 100);
  },

  getWarningText(item) {
    if (item.warningLevel === 'critical') {
      return '紧急补货';
    } else if (item.warningLevel === 'warning') {
      return '库存不足';
    }
    return '正常';
  },

  showAddMaterial() {
    this.setData({
      showModal: true,
      modalType: 'add',
      editingId: '',
      formData: {
        brand: '',
        name: '',
        abv: '',
        unitType: 'ml',
        quantity: '',
        unitPrice: ''
      }
    });
  },

  hideModal() {
    this.setData({ showModal: false });
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({
      [`formData.${field}`]: e.detail.value
    });
  },

  selectUnitType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      'formData.unitType': type
    });
  },

  editMaterial(e) {
    const id = e.currentTarget.dataset.id;
    const item = this.data.inventory.find(i => i.id === id);
    
    if (item) {
      this.setData({
        showModal: true,
        modalType: 'edit',
        editingId: id,
        formData: {
          brand: item.brand || '',
          name: item.name,
          abv: item.abv || '',
          unitType: item.unitType || 'ml',
          quantity: item.currentStock,
          unitPrice: item.unitPrice || ''
        }
      });
    }
  },

  confirmAddMaterial() {
    const { formData, modalType, editingId } = this.data;
    
    if (!formData.name.trim()) {
      wx.showToast({
        title: '请输入材料名称',
        icon: 'none'
      });
      return;
    }

    const quantity = parseFloat(formData.quantity);
    const unitPrice = parseFloat(formData.unitPrice);
    const abv = parseFloat(formData.abv) || 0;

    if (isNaN(quantity) || quantity < 0) {
      wx.showToast({
        title: '请输入有效的数量',
        icon: 'none'
      });
      return;
    }

    if (isNaN(unitPrice) || unitPrice < 0) {
      wx.showToast({
        title: '请输入有效的单价',
        icon: 'none'
      });
      return;
    }

    const id = modalType === 'edit' ? editingId : this.generateId(formData.name);
    const inventory = [...this.data.inventory];

    if (modalType === 'edit') {
      const index = inventory.findIndex(i => i.id === editingId);
      if (index !== -1) {
        inventory[index] = {
          ...inventory[index],
          brand: formData.brand.trim(),
          name: formData.name.trim(),
          abv: abv,
          unitType: formData.unitType,
          currentStock: quantity,
          initialStock: Math.max(inventory[index].initialStock, quantity),
          unitPrice: unitPrice
        };
      }
    } else {
      const newMaterial = {
        id: id,
        brand: formData.brand.trim(),
        name: formData.name.trim(),
        abv: abv,
        unitType: formData.unitType,
        currentStock: quantity,
        initialStock: quantity,
        unitPrice: unitPrice
      };
      inventory.push(newMaterial);
    }

    wx.setStorageSync('inventory', inventory);
    this.setData({ showModal: false });
    this.loadInventory();

    wx.showToast({
      title: modalType === 'edit' ? '编辑成功' : '添加成功',
      icon: 'success'
    });
  },

  generateId(name) {
    return name.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now();
  },

  addStock(e) {
    const id = e.currentTarget.dataset.id;
    const item = this.data.inventory.find(i => i.id === id);
    
    wx.showModal({
      title: '入库 - ' + item.name,
      editable: true,
      placeholderText: '输入入库数量',
      content: '',
      success: (res) => {
        if (res.confirm && res.content) {
          const amount = parseFloat(res.content);
          if (!isNaN(amount) && amount > 0) {
            const inventory = this.data.inventory.map(i => {
              if (i.id === id) {
                return {
                  ...i,
                  currentStock: i.currentStock + amount,
                  initialStock: Math.max(i.initialStock, i.currentStock + amount)
                };
              }
              return i;
            });
            wx.setStorageSync('inventory', inventory);
            this.loadInventory();
            wx.showToast({
              title: '入库成功',
              icon: 'success'
            });
          } else {
            wx.showToast({
              title: '请输入有效数量',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  deleteMaterial(e) {
    const id = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个材料吗？',
      success: (res) => {
        if (res.confirm) {
          const inventory = this.data.inventory.filter(i => i.id !== id);
          wx.setStorageSync('inventory', inventory);
          this.loadInventory();
          wx.showToast({
            title: '已删除',
            icon: 'success'
          });
        }
      }
    });
  },

  goBack() {
    wx.navigateBack();
  }
});

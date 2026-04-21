// components/KingKongArea/KingKongArea.js
const config = require('../../config');

Component({
  properties: {
    items: {
      type: Array,
      value: []
    },
    columns: {
      type: Number,
      value: 4
    },
    showName: {
      type: Boolean,
      value: true
    }
  },

  data: {
    defaultItems: []
  },

  lifetimes: {
    attached() {
      // 如果没有传入items，使用默认配置
      if (!this.properties.items || this.properties.items.length === 0) {
        this.setData({
          defaultItems: config.homeServices || []
        });
      }
    }
  },

  methods: {
    onTap(e) {
      const index = e.currentTarget.dataset.index;
      const item = this.properties.items[index] || this.data.defaultItems[index];
      this.triggerEvent('tap', { item, index });
    }
  }
});

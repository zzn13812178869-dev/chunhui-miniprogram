Component({
  properties: {
    type: {
      type: String,
      value: 'list' // 'card' | 'list' | 'detail'
    },
    rows: {
      type: Number,
      value: 3
    },
    animated: {
      type: Boolean,
      value: true
    }
  },

  data: {
    rowArray: []
  },

  observers: {
    'rows': function(rows) {
      const arr = [];
      for (let i = 0; i < (rows || 3); i++) arr.push(i);
      this.setData({ rowArray: arr });
    }
  }
});

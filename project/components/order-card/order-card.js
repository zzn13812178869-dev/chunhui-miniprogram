Component({
  properties: {
    orderId: {
      type: String,
      value: ''
    },
    status: {
      type: String,
      value: 'pending'
    },
    statusText: {
      type: String,
      value: '待付款'
    },
    productName: {
      type: String,
      value: ''
    },
    productImage: {
      type: String,
      value: ''
    },
    price: {
      type: Number,
      value: 0
    },
    quantity: {
      type: Number,
      value: 1
    },
    createTime: {
      type: String,
      value: ''
    },
    totalAmount: {
      type: Number,
      value: 0
    }
  },

  data: {
    statusMap: {
      pending: { text: '待付款', class: 'status-pending' },
      paid: { text: '待发货', class: 'status-paid' },
      shipped: { text: '待收货', class: 'status-shipped' },
      completed: { text: '已完成', class: 'status-completed' },
      cancelled: { text: '已取消', class: 'status-cancelled' }
    }
  },

  methods: {
    onTapCard() {
      this.triggerEvent('tap', { orderId: this.properties.orderId });
    },

    onTapAction(e) {
      const { action } = e.currentTarget.dataset;
      this.triggerEvent('action', { orderId: this.properties.orderId, action });
    },

    onTapImage() {
      this.triggerEvent('previewImage', { url: this.properties.productImage });
    }
  }
});

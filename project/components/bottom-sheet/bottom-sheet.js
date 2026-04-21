Component({
  properties: {
    visible: {
      type: Boolean,
      value: false,
      observer(newVal) {
        if (newVal) {
          this.setData({ _visible: true, _animated: false });
          setTimeout(() => this.setData({ _animated: true }), 50);
        } else {
          this.setData({ _animated: false });
          setTimeout(() => this.setData({ _visible: false }), 300);
        }
      }
    },
    title: { type: String, value: '' },
    actions: { type: Array, value: [] },
    showCancel: { type: Boolean, value: true },
    cancelText: { type: String, value: '取消' }
  },

  data: {
    _visible: false,
    _animated: false
  },

  methods: {
    onSelect(e) {
      const { index } = e.currentTarget.dataset;
      const action = this.data.actions[index];
      this.triggerEvent('select', { value: action.value, index, action });
      this.onClose();
    },

    onCancel() {
      this.triggerEvent('cancel');
      this.onClose();
    },

    onClose() {
      this.triggerEvent('close');
    },

    onMaskTap() {
      this.onClose();
    },

    onMaskTouchMove() {
      // prevent scroll through mask
    }
  }
});

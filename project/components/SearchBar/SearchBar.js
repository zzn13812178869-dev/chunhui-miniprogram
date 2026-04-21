// components/SearchBar/SearchBar.js
Component({
  properties: {
    placeholder: {
      type: String,
      value: '搜索服务、师傅...'
    },
    value: {
      type: String,
      value: ''
    },
    showSearchBtn: {
      type: Boolean,
      value: false
    },
    bgColor: {
      type: String,
      value: '#F5F5F5'
    },
    radius: {
      type: Number,
      value: 32
    },
    disabled: {
      type: Boolean,
      value: false
    }
  },

  methods: {
    onInput(e) {
      const value = e.detail.value;
      this.triggerEvent('input', { value });
    },

    onConfirm(e) {
      const value = e.detail.value;
      this.triggerEvent('search', { value });
    },

    onClear() {
      this.setData({ value: '' });
      this.triggerEvent('clear');
    },

    onFocus() {
      this.triggerEvent('focus');
    },

    onBlur() {
      this.triggerEvent('blur');
    },

    onTap() {
      if (this.properties.disabled) {
        this.triggerEvent('tap');
      }
    }
  }
});
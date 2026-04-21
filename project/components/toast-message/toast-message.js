// components/toast-message/toast-message.js
Component({
  properties: {
    visible: { type: Boolean, value: false },
    type: { type: String, value: 'info' },
    message: { type: String, value: '' },
    duration: { type: Number, value: 2000 }
  },

  observers: {
    'visible': function(v) {
      if (v && this.properties.duration > 0) {
        setTimeout(() => this.triggerEvent('close'), this.properties.duration);
      }
    }
  },

  methods: {
    iconMap() {
      return { success: '✓', error: '✕', info: 'ℹ', loading: '...' };
    }
  }
});
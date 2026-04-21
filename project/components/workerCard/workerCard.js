const util = require('../../utils/util');

Component({
  properties: {
    worker: {
      type: Object,
      value: {}
    },
    showAction: {
      type: Boolean,
      value: true
    }
  },
  data: {
    defaultAvatar: '/images/icons/default-avatar.png'
  },
  methods: {
    onTap() {
      this.triggerEvent('tap', { id: this.data.worker.id });
    },
    onBook(e) {
      e.stopPropagation();
      this.triggerEvent('book', { id: this.data.worker.id });
    }
  }
});

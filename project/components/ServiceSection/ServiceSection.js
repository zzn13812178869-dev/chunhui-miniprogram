// components/ServiceSection/ServiceSection.js
Component({
  properties: {
    title: {
      type: String,
      value: ''
    },
    icon: {
      type: String,
      value: ''
    },
    services: {
      type: Array,
      value: []
    },
    backgroundColor: {
      type: String,
      value: '#F5F7F4'
    }
  },

  methods: {
    onServiceTap(e) {
      const index = e.currentTarget.dataset.index;
      const service = this.properties.services[index];
      this.triggerEvent('serviceTap', { service, index });
    },

    onMoreTap() {
      this.triggerEvent('moreTap');
    }
  }
});
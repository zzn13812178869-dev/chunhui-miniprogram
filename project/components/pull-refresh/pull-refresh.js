Component({
  properties: {
    refreshing: {
      type: Boolean,
      value: false,
      observer(newVal) {
        if (!newVal) {
          this.setData({ 
            pullState: 'idle',
            pullDistance: 0,
            progress: 0
          });
        }
      }
    },
    threshold: {
      type: Number,
      value: 80
    },
    maxDistance: {
      type: Number,
      value: 150
    },
    enablePullDown: {
      type: Boolean,
      value: true
    },
    backgroundColor: {
      type: String,
      value: '#f5f5f5'
    }
  },

  data: {
    pullState: 'idle',
    pullDistance: 0,
    progress: 0
  },

  methods: {
    onTouchStart(e) {
      if (!this.properties.enablePullDown || this.properties.refreshing) return;
      
      this.startY = e.touches[0].clientY;
      this.isPulling = true;
    },

    onTouchMove(e) {
      if (!this.isPulling || !this.properties.enablePullDown || this.properties.refreshing) return;
      
      const scrollTop = this.getScrollTop();
      if (scrollTop > 0) return;
      
      const currentY = e.touches[0].clientY;
      const deltaY = currentY - this.startY;
      
      if (deltaY > 0) {
        const { threshold, maxDistance } = this.properties;
        const resistance = 0.6;
        const distance = Math.min(deltaY * resistance, maxDistance);
        const progress = Math.min(distance / threshold, 1);
        const state = distance >= threshold ? 'ready' : 'pulling';
        
        this.setData({
          pullDistance: distance,
          progress,
          pullState: state
        });
      }
    },

    onTouchEnd() {
      if (!this.isPulling || !this.properties.enablePullDown) return;
      
      this.isPulling = false;
      const { pullState, pullDistance } = this.data;
      const { threshold } = this.properties;
      
      if (pullState === 'ready' && pullDistance >= threshold) {
        this.setData({
          pullState: 'loading',
          pullDistance: threshold * 0.8
        });
        this.triggerEvent('refresh');
      } else {
        this.setData({
          pullState: 'idle',
          pullDistance: 0,
          progress: 0
        });
      }
    },

    onScroll(e) {
      this.scrollTop = e.detail.scrollTop;
      this.triggerEvent('scroll', e.detail);
    },

    getScrollTop() {
      return this.scrollTop || 0;
    },

    onScrollToLower(e) {
      this.triggerEvent('scrolltolower', e.detail);
    },

    onScrollToUpper(e) {
      this.triggerEvent('scrolltoupper', e.detail);
    }
  }
});

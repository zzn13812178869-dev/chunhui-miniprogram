Component({
  properties: {
    score: {
      type: Number,
      value: 0,
      observer(newVal) {
        this.setData({ displayScore: newVal });
      }
    },
    max: {
      type: Number,
      value: 5
    },
    size: {
      type: String,
      value: 'normal'
    },
    readonly: {
      type: Boolean,
      value: false
    },
    allowHalf: {
      type: Boolean,
      value: true
    },
    showScore: {
      type: Boolean,
      value: true
    }
  },

  data: {
    displayScore: 0,
    stars: [],
    sizeMap: {
      small: { width: 24, gap: 4 },
      normal: { width: 36, gap: 6 },
      large: { width: 48, gap: 8 }
    }
  },

  lifetimes: {
    attached() {
      this.setData({ displayScore: this.properties.score });
      this.renderStars();
    }
  },

  methods: {
    renderStars() {
      const { displayScore, max, sizeMap } = this.data;
      const config = sizeMap[this.properties.size] || sizeMap.normal;
      const stars = [];
      
      for (let i = 0; i < max; i++) {
        const value = i + 1;
        let type = 'empty';
        if (displayScore >= value) {
          type = 'full';
        } else if (this.properties.allowHalf && displayScore >= value - 0.5) {
          type = 'half';
        }
        stars.push({
          index: i,
          value,
          type,
          width: config.width,
          style: `width: ${config.width}rpx; height: ${config.width}rpx;`
        });
      }
      
      const containerWidth = max * config.width + (max - 1) * config.gap;
      this.setData({ 
        stars,
        containerStyle: `width: ${containerWidth}rpx; gap: ${config.gap}rpx;`
      });
    },

    onTapStar(e) {
      if (this.properties.readonly) return;
      
      const { index, value } = e.currentTarget.dataset;
      const touchX = e.detail.x;
      const { sizeMap } = this.data;
      const config = sizeMap[this.properties.size] || sizeMap.normal;
      const starLeft = index * (config.width + config.gap);
      const relativeX = touchX - starLeft;
      
      let newScore = value;
      if (this.properties.allowHalf && relativeX < config.width / 2) {
        newScore = value - 0.5;
      }
      
      this.setData({ displayScore: newScore });
      this.renderStars();
      this.triggerEvent('change', { score: newScore });
    },

    onTouchMove(e) {
      if (this.properties.readonly) return;
      
      const query = this.createSelectorQuery().in(this);
      query.select('.star-rating').boundingClientRect();
      query.exec((res) => {
        if (!res[0]) return;
        const { left, width } = res[0];
        const touchX = e.touches[0].clientX - left;
        const { max, sizeMap } = this.data;
        const config = sizeMap[this.properties.size] || sizeMap.normal;
        const starTotal = config.width + config.gap;
        
        let index = Math.floor(touchX / starTotal);
        index = Math.max(0, Math.min(index, max - 1));
        const remainder = touchX % starTotal;
        let score = index + 1;
        if (this.properties.allowHalf && remainder < config.width / 2) {
          score -= 0.5;
        }
        score = Math.max(0.5, Math.min(score, max));
        
        this.setData({ displayScore: score });
        this.renderStars();
      });
    },

    onTouchEnd() {
      if (this.properties.readonly) return;
      this.triggerEvent('change', { score: this.data.displayScore });
    }
  }
});

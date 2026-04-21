// components/BannerSwiper/BannerSwiper.js
Component({
  properties: {
    banners: {
      type: Array,
      value: []
    },
    autoplay: {
      type: Boolean,
      value: true
    },
    interval: {
      type: Number,
      value: 5000
    },
    duration: {
      type: Number,
      value: 500
    },
    height: {
      type: Number,
      value: 360
    },
    borderRadius: {
      type: Number,
      value: 16
    },
    indicatorDots: {
      type: Boolean,
      value: true
    },
    indicatorColor: {
      type: String,
      value: 'rgba(255,255,255,0.5)'
    },
    indicatorActiveColor: {
      type: String,
      value: '#FFFFFF'
    }
  },

  data: {
    currentIndex: 0
  },

  methods: {
    // Banner切换
    onChange(e) {
      this.setData({
        currentIndex: e.detail.current
      });
      this.triggerEvent('change', { current: e.detail.current });
    },

    // 点击Banner
    onTap(e) {
      const index = e.currentTarget.dataset.index;
      const banner = this.properties.banners[index];
      this.triggerEvent('tap', { banner, index });
    },

    // 图片加载失败
    onImageError(e) {
      const index = e.currentTarget.dataset.index;
      console.warn(`Banner图片加载失败: index=${index}`);
      this.triggerEvent('imageError', { index });
    }
  }
});

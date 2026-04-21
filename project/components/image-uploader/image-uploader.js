Component({
  properties: {
    maxCount: {
      type: Number,
      value: 9
    },
    images: {
      type: Array,
      value: []
    },
    maxSize: {
      type: Number,
      value: 5
    },
    showUploadProgress: {
      type: Boolean,
      value: true
    },
    readonly: {
      type: Boolean,
      value: false
    },
    sourceType: {
      type: Array,
      value: ['album', 'camera']
    },
    compressed: {
      type: Boolean,
      value: true
    }
  },

  data: {
    uploadProgress: {},
    previewImages: []
  },

  observers: {
    'images': function(images) {
      const previewImages = (images || []).map(img => typeof img === 'string' ? img : img.url || img.path);
      this.setData({ previewImages });
    }
  },

  methods: {
    onChooseImage() {
      if (this.properties.readonly) return;
      
      const { maxCount, images, sourceType, compressed } = this.properties;
      const remainCount = maxCount - images.length;
      if (remainCount <= 0) {
        wx.showToast({ title: `最多上传${maxCount}张图片`, icon: 'none' });
        return;
      }

      wx.chooseMedia({
        count: remainCount,
        mediaType: ['image'],
        sourceType,
        sizeType: compressed ? ['compressed'] : ['original'],
        success: (res) => {
          const newImages = res.tempFiles.map(file => ({
            path: file.tempFilePath,
            size: file.size,
            type: file.fileType
          }));
          
          const validImages = newImages.filter(img => {
            const sizeInMB = img.size / 1024 / 1024;
            if (sizeInMB > this.properties.maxSize) {
              wx.showToast({ title: `图片超过${this.properties.maxSize}MB`, icon: 'none' });
              return false;
            }
            return true;
          });

          const updated = [...images, ...validImages];
          this.triggerEvent('change', { images: updated });
        }
      });
    },

    onPreviewImage(e) {
      const { index } = e.currentTarget.dataset;
      const { previewImages } = this.data;
      wx.previewImage({
        current: previewImages[index],
        urls: previewImages
      });
    },

    onDeleteImage(e) {
      if (this.properties.readonly) return;
      
      const { index } = e.currentTarget.dataset;
      const { images } = this.properties;
      
      wx.showModal({
        title: '提示',
        content: '确定删除这张图片吗？',
        confirmColor: '#ff3b30',
        success: (res) => {
          if (res.confirm) {
            const updated = images.filter((_, i) => i !== index);
            this.triggerEvent('change', { images: updated });
            this.triggerEvent('delete', { index, image: images[index] });
          }
        }
      });
    },

    onTapUpload() {
      this.onChooseImage();
    },

    simulateUpload(index) {
      const { uploadProgress } = this.data;
      uploadProgress[index] = 0;
      this.setData({ uploadProgress });
      
      const interval = setInterval(() => {
        uploadProgress[index] = Math.min((uploadProgress[index] || 0) + 10, 100);
        this.setData({ uploadProgress });
        if (uploadProgress[index] >= 100) {
          clearInterval(interval);
        }
      }, 200);
    }
  }
});

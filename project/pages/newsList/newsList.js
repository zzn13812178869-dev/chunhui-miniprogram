const app = getApp();

Page({
  data: {
    categoryList: [
      { id: 'all', name: '全部' },
      { id: 'local', name: '同城' },
      { id: 'policy', name: '政策' },
      { id: 'life', name: '生活' },
      { id: 'business', name: '商业' }
    ],
    currentCategory: 'all',
    newsList: [],
    page: 1,
    pageSize: 10,
    total: 0,
    loading: false,
    refreshing: false,
    loadMoreStatus: 'more',
    hasMore: true
  },

  onLoad() {
    this.loadNewsList(true);
  },

  onPullDownRefresh() {
    this.setData({ refreshing: true });
    this.loadNewsList(true);
  },

  onReachBottom() {
    if (this.data.loading || !this.data.hasMore) return;
    this.loadNewsList(false);
  },

  onCategoryTap(e) {
    const id = e.currentTarget.dataset.id;
    if (id === this.data.currentCategory) return;
    this.setData({
      currentCategory: id,
      newsList: [],
      page: 1,
      hasMore: true,
      loadMoreStatus: 'more'
    });
    this.loadNewsList(true);
  },

  loadNewsList(isRefresh) {
    const { currentCategory, page, pageSize, loading } = this.data;
    if (loading) return;

    const currentPage = isRefresh ? 1 : page;
    this.setData({ loading: true });
    if (!isRefresh) {
      this.setData({ loadMoreStatus: 'loading' });
    }

    wx.cloud.callFunction({
      name: 'getNewsList',
      data: {
        category: currentCategory === 'all' ? '' : currentCategory,
        page: currentPage,
        pageSize
      },
      success: (res) => {
        this.setData({ loading: false, refreshing: false });
        wx.stopPullDownRefresh();

        if (res.result && res.result.code === 0) {
          const { list = [], total = 0 } = res.result.data || {};
          const newsList = isRefresh ? list : [...this.data.newsList, ...list];
          const hasMore = newsList.length < total;
          this.setData({
            newsList,
            page: currentPage + 1,
            total,
            hasMore,
            loadMoreStatus: hasMore ? 'more' : 'nomore'
          });
        } else {
          this.setData({ loadMoreStatus: 'more' });
          wx.showToast({ title: res.result?.msg || '加载失败', icon: 'none' });
        }
      },
      fail: (err) => {
        this.setData({ loading: false, refreshing: false, loadMoreStatus: 'more' });
        wx.stopPullDownRefresh();
        console.error('加载资讯失败:', err);
        wx.showToast({ title: '网络异常', icon: 'none' });
      }
    });
  },

  onNewsTap(e) {
    const newsId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/newsDetail/newsDetail?newsId=${newsId}`
    });
  }
});

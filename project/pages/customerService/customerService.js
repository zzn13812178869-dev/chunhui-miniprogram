// pages/customerService/customerService.js
const config = require('../../config');

Page({
  data: {
    servicePhone: config.servicePhone,
    faqList: [
      {
        question: '如何预约服务？',
        answer: '在首页或全部服务页选择需要的服务类型，浏览工人列表，点击"立即预约"按钮，填写预约信息即可下单。'
      },
      {
        question: '如何成为工人/师傅？',
        answer: '在"我的"页面长按头像切换身份，选择"工人/师傅"角色，填写职业信息并提交审核，通过后即可接单。'
      },
      {
        question: '订单可以取消吗？',
        answer: '订单在"待接单"状态下可以取消，已接单后需联系客服处理。'
      },
      {
        question: '如何提现收益？',
        answer: '工人/合作商在"我的"页面点击"申请提现"，选择提现方式和金额，提交后等待管理员审核。'
      },
      {
        question: '服务价格怎么算？',
        answer: '不同服务类型价格不同，具体可在工人详情页查看报价，或下单时确认最终价格。'
      }
    ],
    expandedIndex: -1
  },

  onLoad() {},

  onFaqTap(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      expandedIndex: this.data.expandedIndex === index ? -1 : index
    });
  },

  onCallPhone() {
    wx.makePhoneCall({ phoneNumber: this.data.servicePhone });
  },

  onCopyWx() {
    wx.setClipboardData({
      data: config.serviceWxId,
      success: () => wx.showToast({ title: '已复制客服微信', icon: 'success' })
    });
  }
});

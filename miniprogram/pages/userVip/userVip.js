const app = getApp()
const moment = require('../../utils/moment')

Page({

  data: {

  },


  onLoad: function (options) {
    const userinfo = app.globalData.userInfo
    const { userLevel, vipExpireDate} = userinfo
    let vipLever = ""
    let isVip = true
    let  dateText = 'vip到期时间：'+moment(vipExpireDate).format('YYYY-MM-DD')
    if (userLevel === 2) {
      vipLever = '批发商'
    } else if (userLevel === 3) {
      vipLever = '零售商'
    }
    if (vipExpireDate < new Date()||userLevel===4) {
      isVip = false
      vipLever = '个人'
      dateText = '请联系管理员开通权限'
    }
   
    if (userLevel === 1) {
      vipLever = '管理员'
      isVip = true
      dateText = 'vip到期时间：永久'
    }
   

    this.setData({
      ...userinfo,vipLever,isVip,dateText
    })
  },
  preview(){
    wx.previewImage({
      urls: ['cloud://test-4g4qvj3hf2e69c63.7465-test-4g4qvj3hf2e69c63-1305399772/hygl.png'],
    })
  },


  onShow: function () {

  },


})
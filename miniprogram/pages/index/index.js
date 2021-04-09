//index.js
const app = getApp()
const moment = require('../../utils/moment')
Page({
  data: {
    imgList:[
      {url:'../../images/banner.jpg'},
      {url:'../../images/banner02.jpg'},
      {url:'https://7465-test-4g4qvj3hf2e69c63-1305399772.tcb.qcloud.la/product-image1617194517242.jpg'}
    ],
    needsList:[],
    stockList:[],
    quotedPriceList:[]

  },

  onLoad: function() {
    this.login()
  },
  onShow:function(){
    this.getDataList()
  },
  onPullDownRefresh:function(){
    this.getDataList()
    setTimeout(()=>{
      wx.stopPullDownRefresh()
      wx.showToast({
        title: '刷新成功',
        icon:"success"
      })
    },1000)
  },
  getDataList(){
    const db = wx.cloud.database()
    db.collection('needs').orderBy('topExpireDate', 'desc').orderBy('createDate', 'desc').limit(3).get({
      success:res=>{
        let dataList = res.data
        dataList.forEach(item => {
          item.createDate = moment(item.createDate).format('YYYY-MM-DD HH:mm:ss')
        })
        this.setData({needsList:dataList})
      }
    })
    db.collection('stock').orderBy('topExpireDate', 'desc').orderBy('createDate', 'desc').limit(3).get({
      success:res=>{
        let dataList = res.data
        dataList.forEach(item => {
          item.createDate = moment(item.createDate).format('YYYY-MM-DD HH:mm:ss')
        })
        this.setData({stockList:dataList})
      }
    })
    db.collection('quotedPrice').orderBy('topExpireDate', 'desc').orderBy('createDate', 'desc').limit(3).get({
      success:res=>{
        let dataList = res.data
        dataList.forEach(item => {
          item.createDate = moment(item.createDate).format('YYYY.MM.DD')
        })
        this.setData({quotedPriceList:dataList})
      }
    })

  },
  navSwiperDetail(){

  },
  navToNeedsDetail(e){
    const id = e.currentTarget.dataset.id
    const url = '/pages/needsDetail/needsDetail?id='+id
    wx.navigateTo({
      url,
    })
  },
  navToStockDetail(e){
    const id = e.currentTarget.dataset.id
    const url = '/pages/stockDetail/stockDetail?id='+id
    wx.navigateTo({
      url,
    })
  },
  navToQuotedPriceDetail(e){
    const id = e.currentTarget.dataset.id
    const url = '/pages/quotedPriceDetail/quotedPriceDetail?id='+id
    wx.navigateTo({
      url,
    })
  },
  navToNeedsList(){
    const url = '/pages/needs/needs'
    wx.navigateTo({
      url,
    })
  },
  navToStockList(){
    const url = '/pages/stock/stock'
    wx.switchTab({
      url: url,
    })
  },
  navToQuotedPrice(){
    const url = '/pages/quotedPrice/quotedPrice'
    wx.switchTab({
      url: url,
    })
  },
  //登录
  login(){
    return new Promise((resolve,reject)=>{
      wx.showLoading({
        title: '加载中',
        mask:true
      })
      wx.cloud.callFunction({
        name: 'login',
        data: {},
        success: res => {
  
          const openid =  res.result.openid
          app.globalData.openid = openid
        
          const db = wx.cloud.database()
          db.collection('user').where({
            _openid: openid,
          }).get({
            success:res=>{
              wx.hideLoading()
              if(res.data.length>0){
                app.globalData.isLogin = true
              }
              resolve()
            }
          })
        },
        fail: err => {
          reject()
          wx.hideLoading()
          console.error('[云函数] [login] 调用失败', err)
         
        }
      })
    })
    
  },
})

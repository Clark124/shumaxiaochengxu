//index.js
const app = getApp()
const moment = require('../../utils/moment')
Page({
  data: {
    imgList:[
      {url:'https://7465-test-4g4qvj3hf2e69c63-1305399772.tcb.qcloud.la/product-image1617173853321.jpeg'},
      {url:'https://7465-test-4g4qvj3hf2e69c63-1305399772.tcb.qcloud.la/product-image1617173860825.jpeg'},
      {url:'https://7465-test-4g4qvj3hf2e69c63-1305399772.tcb.qcloud.la/product-image1617194517242.jpg'}
    ],
    needsList:[],
    stockList:[],
    quotedPriceList:[]

  },

  onLoad: function() {
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
    db.collection('needs').orderBy('createDate', 'desc').limit(3).get({
      success:res=>{
        let dataList = res.data
        dataList.forEach(item => {
          item.createDate = moment(item.createDate).format('YYYY-MM-DD HH:mm:ss')
        })
        this.setData({needsList:dataList})
      }
    })
    db.collection('stock').orderBy('createDate', 'desc').limit(3).get({
      success:res=>{
        let dataList = res.data
        dataList.forEach(item => {
          item.createDate = moment(item.createDate).format('YYYY-MM-DD HH:mm:ss')
        })
        this.setData({stockList:dataList})
      }
    })
    db.collection('quotedPrice').orderBy('createDate', 'desc').limit(3).get({
      success:res=>{
        let dataList = res.data
        dataList.forEach(item => {
          item.createDate = moment(item.createDate).format('YYYY-MM-DD HH:mm:ss')
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
  }
})

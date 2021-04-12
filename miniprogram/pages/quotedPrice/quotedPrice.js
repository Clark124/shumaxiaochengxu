const moment = require('../../utils/moment')
const COLLECTION = 'quotedPrice'
const app = getApp()
Page({
  data: {
    search:"",
    scrollTop: 0,
    openid: "",
    typeList: [],
    typeIndex: 0,
    stockList: [],
    triggered: true,
    page: 1,
    pageSize: 10,
    isDataArrive: true,
    isDataOver: false
  },


  onLoad: function (options) {
    if(app.globalData.typeIndex){
      this.setData({typeIndex:Number(app.globalData.typeIndex)})
      app.globalData.typeIndex = ""
    }
  },
  onShow: function () {
    this.setData({ page: 1, isDataArrive: true, isDataOver: false })
    const db = wx.cloud.database()
    db.collection('quotedPriceType').get({
      success: (res) => {
        this.setData({
          typeList: res.data
        })
        this.getStockList()
      } 
    })
  },

  //获取我的库存列表
  getStockList(callback) {
    const db = wx.cloud.database()
    const _ = db.command
    const { page, pageSize, typeList, typeIndex } = this.data
    db.collection(COLLECTION).orderBy('topExpireDate', 'desc').orderBy('createDate', 'desc').skip((page - 1) * pageSize).limit(pageSize).where({
      typeId: typeList[typeIndex]._id,
      expireDate: _.gte(new Date())
    }).get({
      success: (res) => {
        let dataList = res.data
        dataList.forEach(item => {
          item.createDate = moment(item.createDate).format('YYYY-MM-DD')
          item.isTop = item.topExpireDate>new Date()
        })
        this.setData({ stockList: dataList, page: 2, isDataOver: false, isDataArrive: true })
        if (res.data.length < 10) {
          this.setData({ isDataOver: true })
        }
        if (callback) {
          callback()
        }
      }
    })
  },
  //切换tab
  onChangeTab(e) {
    this.setData({ typeIndex: e.currentTarget.dataset.index, page: 1, isDataArrive: true, isDataOver: false, scrollTop: 0 })
    this.getStockList()
  },

  //下拉刷新
  onRefresh() {
    if (this._freshing) return
    this._freshing = true
    this.setData({ isDataArrive: true, isDataOver: false, page: 1 })
    this.getStockList(() => {
      this.setData({ triggered: false })
      this._freshing = false
      wx.showToast({
        title: '刷新成功',
        icon: "success"
      })
    })
  },
  //加载更多
  loadMore(e) {
    const { isDataArrive, isDataOver, stockList, openid, page, pageSize, typeList, typeIndex } = this.data
    if (page === 1 || !isDataArrive || isDataOver) {
      return
    }
    this.setData({ isDataArrive: false })
    const db = wx.cloud.database()
    const _ = db.command
    db.collection(COLLECTION).orderBy('topExpireDate', 'desc').orderBy('createDate', 'desc').skip((page - 1) * pageSize).limit(pageSize).where({
      typeId: typeList[typeIndex]._id,
      expireDate: _.gte(new Date())
    }).get({
      success: (res) => {
        let dataList = res.data
        dataList.forEach(item => {
          item.isTop = item.topExpireDate>new Date()
          item.createDate = moment(item.createDate).format('YYYY-MM-DD')
        })
        this.setData({ stockList: [...stockList, ...dataList], page: page + 1, isDataArrive: true })
        if (res.data.length < 10) {
          this.setData({ isDataOver: true })
        }
      }
    })
  },

  navToDetail(e){
    const id = e.currentTarget.dataset.id
    const url = '/pages/quotedPriceDetail/quotedPriceDetail?id='+id
    wx.navigateTo({
      url,
    })
  },

  //搜索框输入
  onChangeInput(e){
    this.setData({search:e.detail.value})
  },
  onConfirmSearch(){
    const {search,typeList,typeIndex} = this.data
    if(!search.trim()){
      wx.showToast({
        title: '请输入搜索内容',
        icon:"none"
      })
      return
    }
    console.log(search)
    const url = `/pages/search/search?key=${search}&collection=${COLLECTION}&typeId=${typeList[typeIndex]._id}`
    wx.navigateTo({
      url,
    })
  },
})
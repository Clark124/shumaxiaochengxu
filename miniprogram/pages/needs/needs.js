
const app = getApp()
const moment = require('../../utils/moment')
const COLLECTION = 'needs'

Page({
  data: {
    search:"",
    scrollTop: 0, 
    openid: "",
    typeList: [{name:'所有分类'}],
    typeIndex: 0,
    needsList: [],
    triggered: true,
    page: 1,
    pageSize: 10,
    isDataArrive: true,
    isDataOver: false
  },


  onLoad: function (options) {
    // if(app.globalData.typeIndex){
    //   this.setData({typeIndex:Number(app.globalData.typeIndex)+1})
    //   app.globalData.typeIndex = ""
    // }
    const db = wx.cloud.database()
    db.collection('needsType').orderBy('index', 'asc').get({
      success: (res) => {
        this.setData({
          typeList: [...this.data.typeList,...res.data]
        })
        
      }
    })
  },
  onShow: function () {
    this.setData({ page: 1, isDataArrive: true, isDataOver: false ,scrollTop:0})
    this.getNeedsList()
  },

  //获取我的库存列表
  getNeedsList(callback) {
    const db = wx.cloud.database()
    const _ = db.command
    const { page, pageSize, typeList, typeIndex } = this.data
    db.collection('needs').orderBy('topExpireDate', 'desc').orderBy('createDate', 'desc').skip((page - 1) * pageSize).limit(pageSize).where({
      typeId: typeList[typeIndex]._id,
      expireDate: _.gte(new Date()),
      isOffShelf:false
    }).get({
      success: (res) => {
        let dataList = res.data
        dataList.forEach(item => {
          item.createDate = moment(item.createDate).format('YYYY-MM-DD HH:mm:ss')
          item.isTop = item.topExpireDate>new Date()
        })
        this.setData({ needsList: dataList, page: 2, isDataOver: false, isDataArrive: true })
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
    this.getNeedsList()
  },

  //下拉刷新
  onRefresh() {
    if (this._freshing) return
    this._freshing = true
    this.setData({ isDataArrive: true, isDataOver: false, page: 1 })
    this.getNeedsList(() => {
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
    const { isDataArrive, isDataOver, needsList, openid, page, pageSize, typeList, typeIndex } = this.data
    if (page === 1 || !isDataArrive || isDataOver) {
      return
    }
    this.setData({ isDataArrive: false })
    const db = wx.cloud.database()
    const _ = db.command
    db.collection('needs').orderBy('topExpireDate', 'desc').orderBy('createDate', 'desc').skip((page - 1) * pageSize).limit(pageSize).where({
      typeId: typeList[typeIndex]._id,
      expireDate: _.gte(new Date()),
      isOffShelf:false
    }).get({
      success: (res) => {
        let dataList = res.data
        dataList.forEach(item => {
          item.createDate = moment(item.createDate).format('YYYY-MM-DD HH:mm:ss')
          item.isTop = item.topExpireDate>new Date()
        })
        this.setData({ needsList: [...needsList, ...dataList], page: page + 1, isDataArrive: true })
        if (res.data.length < 10) {
          this.setData({ isDataOver: true })
        }
      }
    })
  },

  navToDetail(e){
    const id = e.currentTarget.dataset.id
    const url = '/pages/needsDetail/needsDetail?id='+id
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

    const url = `/pages/search/search?key=${search}&collection=${COLLECTION}&typeId=${typeList[typeIndex]._id}`
    wx.navigateTo({
      url,
    })
  },

  
})
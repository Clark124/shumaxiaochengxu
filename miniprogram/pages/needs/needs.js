
const app = getApp()
const moment = require('../../utils/moment')
const COLLECTION = 'needs'

Page({
  data: {
    scrollTop: 0,
    openid: "",
    typeList: [],
    typeIndex: 0,
    needsList: [],
    triggered: true,
    page: 1,
    pageSize: 10,
    isDataArrive: true,
    isDataOver: false
  },


  onLoad: function (options) {
    // const openid = app.globalData.openid
    // this.setData({ openid })
  },
  onShow: function () {
    this.setData({ page: 1, isDataArrive: true, isDataOver: false ,scrollTop:0})
    const db = wx.cloud.database()
    db.collection('needsType').get({
      success: (res) => {
        this.setData({
          typeList: res.data
        })
        console.log(this.data.typeList)
        this.getNeedsList()
      }
    })
  },

  //获取我的库存列表
  getNeedsList(callback) {
    const db = wx.cloud.database()
    const { page, pageSize, typeList, typeIndex } = this.data
    db.collection('needs').orderBy('createDate', 'desc').skip((page - 1) * pageSize).limit(pageSize).where({
      typeId: typeList[typeIndex]._id
    }).get({
      success: (res) => {
        let dataList = res.data
        dataList.forEach(item => {
          item.createDate = moment(item.createDate).format('YYYY-MM-DD HH:mm:ss')
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
    db.collection('needs').orderBy('createDate', 'desc').skip((page - 1) * pageSize).limit(pageSize).where({
      typeId: typeList[typeIndex]._id
    }).get({
      success: (res) => {
        let dataList = res.data
        dataList.forEach(item => {
          item.createDate = moment(item.createDate).format('YYYY-MM-DD HH:mm:ss')
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
})
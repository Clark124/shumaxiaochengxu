const app = getApp()
const moment = require('../../utils/moment')
const COLLECTION = 'quotedPrice'

Page({
  data: {
    scrollTop: 0,
    startX: 0, //开始坐标
    startY: 0,
    openid: "",
    typeList: [{name:'所有分类'}],
    typeIndex: 0,
    stockList: [],
    triggered: true,
    page: 1,
    pageSize: 10,
    isDataArrive: true,
    isDataOver: false
  },


  onLoad: function (options) {
    const openid = app.globalData.openid
    this.setData({
      openid
    })
    const db = wx.cloud.database()
    db.collection('quotedPriceType').orderBy('index', 'asc').get({
      success: (res) => {
        this.setData({
          typeList: [...this.data.typeList,...res.data]
        })
      }
    })
  },
  onShow: function () {
    this.setData({
      page: 1,
      isDataArrive: true,
      isDataOver: false
    })
    this.getStockList()
  },

  //获取我的库存列表
  getStockList(callback) {
    const db = wx.cloud.database()
    const {
      openid,
      page,
      pageSize,
      typeList,
      typeIndex
    } = this.data
    db.collection('quotedPrice').orderBy('updateDate', 'desc').skip((page - 1) * pageSize).limit(pageSize).where({
      typeId: typeList[typeIndex]._id
    }).get({
      success: (res) => {
        let dataList = res.data
        dataList.forEach(item => {
          item.isTouchMove = false
          item.updateDate = moment(item.updateDate).format('YYYY-MM-DD')
          item.isExpire = new Date() > item.expireDate
          item.isTop = item.topExpireDate > new Date()
        })
        this.setData({
          stockList: dataList,
          page: 2,
          isDataOver: false,
          isDataArrive: true
        })
        if (res.data.length < 10) {
          this.setData({
            isDataOver: true
          })
        }
        if (callback) {
          callback()
        }
      }
    })
  },
  //切换tab
  onChangeTab(e) {
    this.setData({
      typeIndex: e.currentTarget.dataset.index,
      page: 1,
      isDataArrive: true,
      isDataOver: false,
      scrollTop: 0
    })
    this.getStockList()
  },

  //下拉刷新
  onRefresh() {
    if (this._freshing) return
    this._freshing = true
    this.setData({
      isDataArrive: true,
      isDataOver: false,
      page: 1
    })
    this.getStockList(() => {
      this.setData({
        triggered: false
      })
      this._freshing = false
      wx.showToast({
        title: '刷新成功',
        icon: "success"
      })
    })
  },
  //加载更多
  loadMore(e) {
    const {
      isDataArrive,
      isDataOver,
      stockList,
      page,
      pageSize,
      typeList,
      typeIndex
    } = this.data
    if (page === 1 || !isDataArrive || isDataOver) {
      return
    }
    this.setData({
      isDataArrive: false
    })
    const db = wx.cloud.database()
    db.collection('quotedPrice').orderBy('updateDate', 'desc').skip((page - 1) * pageSize).limit(pageSize).where({
      typeId: typeList[typeIndex]._id
    }).get({
      success: (res) => {
        let dataList = res.data
        dataList.forEach(item => {
          item.isTouchMove = false
          item.updateDate = moment(item.updateDate).format('YYYY-MM-DD')
          item.isExpire = new Date() > item.expireDate
          item.isTop = item.topExpireDate > new Date()
        })
        this.setData({
          stockList: [...stockList, ...dataList],
          page: page + 1,
          isDataArrive: true
        })
        if (res.data.length < 10) {
          this.setData({
            isDataOver: true
          })
        }
      }
    })
  },
  //手指触摸动作开始 记录起点X坐标
  touchstart: function (e) {
    //开始触摸时 重置所有删除
    this.data.stockList.forEach(function (v, i) {
      if (v.isTouchMove) //只操作为true的
        v.isTouchMove = false;
    })
    this.setData({
      startX: e.changedTouches[0].clientX,
      startY: e.changedTouches[0].clientY,
      stockList: this.data.stockList
    })
  },

  //滑动事件处理
  touchmove: function (e) {
    var that = this,
      index = e.currentTarget.dataset.index, //当前索引
      startX = that.data.startX, //开始X坐标
      startY = that.data.startY, //开始Y坐标
      touchMoveX = e.changedTouches[0].clientX, //滑动变化坐标
      touchMoveY = e.changedTouches[0].clientY, //滑动变化坐标
      //获取滑动角度
      angle = that.angle({
        X: startX,
        Y: startY
      }, {
        X: touchMoveX,
        Y: touchMoveY
      });
    that.data.stockList.forEach(function (v, i) {
      v.isTouchMove = false
      //滑动超过30度角 return
      if (Math.abs(angle) > 30) return;
      if (i == index) {
        if (touchMoveX > startX) //右滑
          v.isTouchMove = false
        else //左滑
          v.isTouchMove = true
      }
    })
    //更新数据
    that.setData({
      stockList: that.data.stockList
    })
  },

  angle: function (start, end) {
    var _X = end.X - start.X,
      _Y = end.Y - start.Y
    //返回角度 /Math.atan()返回数字的反正切值
    return 360 * Math.atan(_Y / _X) / (2 * Math.PI);
  },

  //删除事件
  del: function (e) {
    const index = e.currentTarget.dataset.index
    wx.showModal({
      title: '提示',
      content: '确定要删除该条发布吗？',
      success: (res) => {
        if (res.confirm) {
          this.deleteData(index)
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

  //删除发布
  deleteData(index) {
    let {
      stockList,
    } = this.data
  
    wx.showLoading({
      title: '加载中...',
    })
    wx.cloud.callFunction({
      name: 'managePublic',
      data: {
        type: "remove", //指定操作是insert  
        collection: COLLECTION, //指定操作的数据表
        id: stockList[index]._id,
      },
      success: (res) => {
        this.setData({
          page: 1,
          isDataArrive: true,
          isDataOver: false,
          scrollTop: 0
        })
        wx.hideLoading()
        this.getStockList(() => {
          wx.showToast({
            title: '删除成功',
            icon: "success"
          })
        })
      },
      fail: err => {
        wx.hideLoading()
        console.error('[云函数] [insertDB] 增加失败', err)
      }
    })
  
  },

  //确定是否下架
  onOffShelf(e) {
    const index = e.currentTarget.dataset.index
    wx.showModal({
      title: '提示',
      content: '确定要下架吗？',
      success: (res) => {
        if (res.confirm) {
          this.offSelf(index)
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  offSelf(index) {
    let {
      stockList,
    } = this.data
    wx.showLoading({
      title: '加载中...',
    })
    wx.cloud.callFunction({
      name: 'managePublic',
      data: {
        type: "update", //指定操作是insert  
        collection: COLLECTION, //指定操作的数据表
        id: stockList[index]._id,
        data:{
          isOffShelf: true
        }
      },
      success: (res) => {
        stockList[index].isOffShelf = true
        this.setData({
          stockList
        })
        wx.hideLoading()
        wx.showToast({
          title: '下架成功',
          icon: "success"
        })
      },
      fail: err => {
        wx.hideLoading()
        console.error('[云函数] [insertDB] 增加失败', err)
      }
    })
  },

  //上架
  onOnShelf(e) {
    const index = e.currentTarget.dataset.index
    wx.showModal({
      title: '提示',
      content: '确定要上架吗？',
      success: (res) => {
        if (res.confirm) {
          this.onSelf(index)
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  onSelf(index) {
    let { stockList,} = this.data
    wx.showLoading({
      title: '加载中...',
    })
    wx.cloud.callFunction({
      name: 'managePublic',
      data: {
        type: "update", //指定操作是insert  
        collection: COLLECTION, //指定操作的数据表
        id: stockList[index]._id,
        data:{
          isOffShelf: false
        }
      },
      success: (res) => {
        stockList[index].isOffShelf = false
        this.setData({
          stockList
        })
        wx.hideLoading()
        wx.showToast({
          title: '上架成功',
          icon: "success"
        })
      },
      fail: err => {
        wx.hideLoading()
        console.error('[云函数] [insertDB] 增加失败', err)
      }
    })
  },


  navToDetail(e) {
    const id = e.currentTarget.dataset.id
    const url = '/pages/quotedPriceDetail/quotedPriceDetail?id=' + id
    wx.navigateTo({
      url,
    })
  },
})
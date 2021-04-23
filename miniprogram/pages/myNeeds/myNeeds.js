
const app = getApp()
const moment = require('../../utils/moment')
const COLLECTION = 'needs'

Page({
  data: {
    scrollTop: 0,
    openid: "",
    startX: 0, //开始坐标
    startY: 0,
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
    const openid = app.globalData.openid
    this.setData({ openid })
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
    this.setData({ page: 1, isDataArrive: true, isDataOver: false })
    this.getNeedsList()
  },

  //获取我的库存列表
  getNeedsList(callback) {
    const db = wx.cloud.database()
    const { openid, page, pageSize, typeList, typeIndex } = this.data
    db.collection('needs').orderBy('updateDate', 'desc').skip((page - 1) * pageSize).limit(pageSize).where({
      _openid: openid,
      typeId: typeList[typeIndex]._id
    }).get({
      success: (res) => {
        let dataList = res.data
        dataList.forEach(item => {
          item.isTouchMove = false
          item.updateDate = moment(item.updateDate).format('YYYY-MM-DD HH:mm:ss')
          item.isExpire = new Date()>item.expireDate
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
    db.collection('needs').orderBy('updateDate', 'desc').skip((page - 1) * pageSize).limit(pageSize).where({
      _openid: openid,
      typeId: typeList[typeIndex]._id
    }).get({
      success: (res) => {
        let dataList = res.data
        dataList.forEach(item => {
          item.isTouchMove = false
          item.updateDate = moment(item.updateDate).format('YYYY-MM-DD HH:mm:ss')
          item.isExpire = new Date()>item.expireDate
          item.isTop = item.topExpireDate>new Date()
        })
        this.setData({ needsList: [...needsList, ...dataList], page: page + 1, isDataArrive: true })
        if (res.data.length < 10) {
          this.setData({ isDataOver: true })
        }
      }
    })
  },


  //手指触摸动作开始 记录起点X坐标
  touchstart: function (e) {
    //开始触摸时 重置所有删除
    this.data.needsList.forEach(function (v, i) {
      if (v.isTouchMove) //只操作为true的
        v.isTouchMove = false;
    })
    this.setData({
      startX: e.changedTouches[0].clientX,
      startY: e.changedTouches[0].clientY,
      needsList: this.data.needsList
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
    that.data.needsList.forEach(function (v, i) {
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
      needsList: that.data.needsList
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
    let { needsList, openid} = this.data
    wx.showLoading({
      title: '加载中...',
    })
    const db = wx.cloud.database()
    db.collection(COLLECTION).where({
      _id:needsList[index]._id,
      _openid:openid
    }).remove({
      success: (res) => {
        this.setData({
          page: 1,
          isDataArrive: true,
          isDataOver: false,
          scrollTop: 0
        })
        wx.hideLoading()
        this.getNeedsList(() => {
          wx.showToast({
            title: '删除成功',
            icon: "success"
          })
        })
      },
      fail:res=>{
        wx.hideLoading()
      }
    })
  },

   //确定是否下架
   onOffShelf(e){
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
  offSelf(index){
    let { needsList, openid } = this.data
    wx.showLoading({
      title: '加载中...',
    })
    const db = wx.cloud.database()
    db.collection(COLLECTION).where({
      _id: needsList[index]._id,
      _openid: openid
    }).update({
      data:{
        isOffShelf:true
      },
      success: (res) => {
        needsList[index].isOffShelf = true
        this.setData({needsList})
        wx.hideLoading()
        wx.showToast({
          title: '下架成功',
          icon:"success"
        })
      },
      fail:(res)=>{
        wx.hideLoading()
      }
    })
  },

  //上架
  onOnShelf(e){
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
  onSelf(index){
    let { needsList, openid } = this.data
    wx.showLoading({
      title: '加载中...',
    })
    const db = wx.cloud.database()
    db.collection(COLLECTION).where({
      _id: needsList[index]._id,
      _openid: openid
    }).update({
      data:{
        isOffShelf:false
      },
      success: (res) => {
        needsList[index].isOffShelf = false
        this.setData({needsList})
        wx.hideLoading()
        wx.showToast({
          title: '上架成功',
          icon:"success"
        })
      },
      fail:(res)=>{
        wx.hideLoading()
      }
    })
  },


  navToDetail(e){
    const id = e.currentTarget.dataset.id
    console.log(id)
    const url = '/pages/needsDetail/needsDetail?id='+id
    wx.navigateTo({
      url,
    })
  },
})
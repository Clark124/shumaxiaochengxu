// miniprogram/pages/manageUser/manageUser.js
const moment = require('../../utils/moment')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    search:"",
    userList:[],
    page: 1,
    pageSize: 10,
    isDataArrive: true,
    isDataOver: false,
  },

 
  onLoad: function (options) {

  },

  onShow: function () {
    this.setData({page:1,isDataArrive:true,isDataOver:false})
    this.getUserList()
  },


  //获取我的库存列表
  getUserList(callback) {
    const {
      search,
      page,
      pageSize,
    } = this.data
    const db = wx.cloud.database()
    const _ = db.command
    db.collection('user').orderBy('createDate', 'desc').skip((page - 1) * pageSize).limit(pageSize).where(
      _.or([{
        nickName: db.RegExp({
          regexp: '.*' + search,
          options: 'i',
        })
      }])
    ).get({
      success: (res) => {
        let dataList = res.data
        dataList.forEach(item=>{
          let vipLever = ""
          if(item.userLevel===2){
            vipLever = '批发商'
          }else if(item.userLevel===3){
            vipLever = '零售商'
          }
          if(item.vipExpireDate<new Date()){
            vipLever = '个人'
          } 
          if(item.userLevel===1){
            vipLever = '管理员'
          }
          item.vipLever = vipLever
          item.vipTime =  moment(item.vipExpireDate).format('YYYY-MM-DD')
        })
     
        this.setData({
          userList: dataList,
          page: 2,
          isDataOver: false,
          isDataArrive: true,
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

  navToDetail(e){
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/manageUserDetail/manageUserDetail?id='+id,
    })
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
    this.getUserList(() => {
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
      userList,
      search,
      page,
      pageSize,
    } = this.data
    if (page === 1 || !isDataArrive || isDataOver) {
      return
    }
    this.setData({
      isDataArrive: false
    })
    const db = wx.cloud.database()
    const _ = db.command
    db.collection('user').orderBy('createDate', 'desc').skip((page - 1) * pageSize).limit(pageSize).where(
      _.or([{
        nickName: db.RegExp({
          regexp: '.*' + search,
          options: 'i',
        })
      }])
    ).get({
      success: (res) => {
        let dataList = res.data
        dataList.forEach(item=>{
          let vipLever = ""
          if(item.userLevel===2){
            vipLever = '批发商'
          }else if(item.userLevel===3){
            vipLever = '零售商'
          }
          if(item.vipExpireDate<new Date()){
            vipLever = '个人'
          } 
          if(item.userLevel===1){
            vipLever = '管理员'
          }
          item.vipLever = vipLever
          item.vipTime =  moment(item.vipExpireDate).format('YYYY-MM-DD')
        })

        this.setData({
          stockList: [...userList, ...dataList],
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

  //搜索框输入
  onChangeInput(e){
    this.setData({search:e.detail.value})
    if(e.detail.value===""){
      this.onConfirmSearch()
    }
  },

  //搜索确定
  onConfirmSearch(){
    this.setData({page:1,isDataArrive:true,isDataOver:false})
    this.getUserList()
  }

})
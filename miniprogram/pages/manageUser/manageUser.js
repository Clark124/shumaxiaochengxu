// miniprogram/pages/manageUser/manageUser.js
const moment = require('../../utils/moment')
Page({

  /**
   * 页面的初始数据
   */
  data: {
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
    const db = wx.cloud.database()
    const {
      page,
      pageSize,
    } = this.data
    db.collection('user').orderBy('createDate', 'desc').skip((page - 1) * pageSize).limit(pageSize).get({
      success: (res) => {
        console.log(res.data)
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
    console.log(id)
    wx.navigateTo({
      url: '/pages/manageUserDetail/manageUserDetail?id='+id,
    })
  },




  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

})
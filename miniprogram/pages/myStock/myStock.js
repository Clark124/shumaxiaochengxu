// miniprogram/pages/myStock/myStock.js
const app = getApp()

Page({
  data: {
    openid:"",
    stockList:[],
    page:1,
    pageSize:10,
    isDataArrive:true,
    isDataOver:false
  },

  
  onLoad: function (options) {
   
    const openid = app.globalData.openid
    this.setData({openid})
    //需求类目
    this.getStockList()
   
  },

  //getStockList
  getStockList(){
    const db = wx.cloud.database()
    const {openid,page,pageSize} = this.data
    db.collection('stock').skip((page-1)*pageSize).limit(pageSize).where({
      _openid: openid,
    }).get({
      success: (res) => {
        console.log(res)
        this.setData({stockList:res.data})
      }
    })
  },


  onShow: function () {

  },

 
  onHide: function () {

  },


  onUnload: function () {

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
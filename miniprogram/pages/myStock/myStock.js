// miniprogram/pages/myStock/myStock.js
const app = getApp()

Page({
  data: {
    openid:"",
    stockList:[
      {imgList:['cloud://test-4g4qvj3hf2e69c63.7465-test-4g4qvj3hf2e69c63-1305399772/my-image1617022427701.jpg'],productName:"组装电脑",productPirce:1000,productCount:10},
      {imgList:['cloud://test-4g4qvj3hf2e69c63.7465-test-4g4qvj3hf2e69c63-1305399772/my-image1617022427701.jpg'],productName:"组装电脑",productPirce:1000,productCount:10},
      {imgList:['cloud://test-4g4qvj3hf2e69c63.7465-test-4g4qvj3hf2e69c63-1305399772/my-image1617022427701.jpg'],productName:"组装电脑",productPirce:1000,productCount:10},
      {imgList:['cloud://test-4g4qvj3hf2e69c63.7465-test-4g4qvj3hf2e69c63-1305399772/my-image1617022427701.jpg'],productName:"组装电脑",productPirce:1000,productCount:10},
      {imgList:['cloud://test-4g4qvj3hf2e69c63.7465-test-4g4qvj3hf2e69c63-1305399772/my-image1617022427701.jpg'],productName:"组装电脑",productPirce:1000,productCount:10},
      {imgList:['cloud://test-4g4qvj3hf2e69c63.7465-test-4g4qvj3hf2e69c63-1305399772/my-image1617022427701.jpg'],productName:"组装电脑",productPirce:1000,productCount:10},
      {imgList:['cloud://test-4g4qvj3hf2e69c63.7465-test-4g4qvj3hf2e69c63-1305399772/my-image1617022427701.jpg'],productName:"组装电脑",productPirce:1000,productCount:10},
    ],
    triggered:true,
    page:1,
    pageSize:10,
    isDataArrive:true,
    isDataOver:false
  },

  
  onLoad: function (options) {
   
    // const openid = app.globalData.openid
    // this.setData({openid})
    //需求类目
    // this.getStockList()
   
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
  onPulling(e) {
    // console.log('onPulling:', e)
  },

  onRefresh() {
    console.log(123)
    if (this._freshing) return
    this._freshing = true
    setTimeout(() => {
      this.setData({
        triggered: false,
      })
      this._freshing = false
    }, 3000)
  },

  onRestore(e) {
    console.log('onRestore:', e)
  },

  onAbort(e) {
    console.log('onAbort', e)
  },
  loadMore(e){
    console.log(321)
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
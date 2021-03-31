const COLLECTION = 'quotedPrice'
const moment = require('../../utils/moment')
const app = getApp()
Page({
  data: {
    openid:"",
  },

  onLoad: function (options) {
    const id = options.id
    const openid = app.globalData.openid
    this.setData({id,openid})
  },
  
  onShow: function () {
    
    const db = wx.cloud.database()
    db.collection(COLLECTION).doc(this.data.id).get({
      success:res=>{
        this.setData({...this.data,...res.data,
          createDate:moment(res.data.createDate).format('YYYY-MM-DD HH:mm:ss')
        })
      }
    })
  },

  //预览轮播图
  previewSwiper(e){
    let {imgList} = this.data
    imgList = imgList.filter((item)=>item.url).map(item=>item.url)
    wx.previewImage({
      current: e.currentTarget.dataset.url, // 当前显示图片的http链接
      urls: imgList // 需要预览的图片http链接列表
    })
  },


  toEdit(){
    const {id} = this.data
    const url = '/pages/edit/edit?id='+id+"&collection=quotedPrice"
    wx.navigateTo({
      url: url,
    })
  },

  //置顶
  toAddTop(){

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
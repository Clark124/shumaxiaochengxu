const COLLECTION = 'needs'
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
    wx.pageScrollTo({
      scrollTop:0
    })
    const db = wx.cloud.database()
    db.collection(COLLECTION).doc(this.data.id).get({
      success:res=>{
        this.setData({...this.data,...res.data,
          createDate:moment(res.data.createDate).format('YYYY-MM-DD HH:mm:ss')
        })
      }
    })
  },

  toEdit(){
    const {id} = this.data
    const url = '/pages/edit/edit?id='+id+"&collection=needs"
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
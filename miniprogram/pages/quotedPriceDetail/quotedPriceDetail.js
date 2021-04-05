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
    this.getData()
    
  },
  getData(){
    const db = wx.cloud.database()
    db.collection(COLLECTION).doc(this.data.id).get({
      success:res=>{
        const isTop = res.data.topExpireDate>new Date()
        this.setData({...this.data,...res.data,isTop,
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
  toAddTop() {
    wx.showModal({
      title: '提示',
      content: '5元置顶一天',
      success:res=> {
        if (res.confirm) {
          const {id} = this.data
          const db = wx.cloud.database()
          db.collection(COLLECTION).doc(id).update({
            data:{
                topExpireDate: new Date(moment().add(1,'days')),
                updateDate:new Date(),
                expireDate: new Date(moment().add(1, 'month')),   //1个月后过期
            },
            success:res=>{
              wx.showToast({
                title: '置顶成功',
              })
              this.getData()
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
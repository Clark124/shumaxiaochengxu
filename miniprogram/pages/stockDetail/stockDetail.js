const COLLECTION = 'stock'
const moment = require('../../utils/moment')
const app = getApp()
Page({
  data: {
    openid: "",
  },

  onLoad: function (options) {
    const id = options.id
    let openid = ""
    if(app.globalData.openid){
      openid = app.globalData.openid
    }
    this.setData({
      id,
      openid
    })
  },

  onShow: function () {
    this.getData()
   
  },

  getData(){
    const db = wx.cloud.database()
    db.collection(COLLECTION).doc(this.data.id).get({
      success: res => {
        const isTop = res.data.topExpireDate>new Date()
        this.setData({
          ...this.data,
          ...res.data,
          createDate: moment(res.data.createDate).format('YYYY-MM-DD HH:mm:ss'),
          isTop
        })
      }
    })
  },

  //预览轮播图
  previewSwiper(e) {
    let {
      imgList
    } = this.data
    imgList = imgList.filter((item) => item.url).map(item => item.url)
    wx.previewImage({
      current: e.currentTarget.dataset.url, // 当前显示图片的http链接
      urls: imgList // 需要预览的图片http链接列表
    })
  },

  previewDetail(e) {
    let {
      productDetailImg
    } = this.data
    productDetailImg = productDetailImg.filter((item) => item.url).map(item => item.url)
    wx.previewImage({
      current: e.currentTarget.dataset.url, // 当前显示图片的http链接
      urls: productDetailImg
    })
  },

  toEdit() {
    const {
      id
    } = this.data
    const url = '/pages/edit/edit?id=' + id + "&collection=stock"
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
          const data = {
            totalFee:"1",
            body:"5元置顶",
            spbillCreateIp:"127.0.0.1",
          }
          wx.showLoading({
            title: '加载中...',
            mask:true
          })
          wx.cloud.callFunction({
            name: 'payment',
            data: data,
            success: res => {
              const payment = res.result.payment
              wx.requestPayment({
                ...payment,
                success:res=> {
                  this.updateTopState()
                },
                fail:res=> {
                  console.error('pay fail', err)
                },
                complete:res=>{
                  wx.hideLoading()
                }
              })
            },
            fail: console.error,
          })
         
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

  //支付成功，置顶
  updateTopState(){
    const {id} = this.data
    const db = wx.cloud.database()
    db.collection(COLLECTION).where({
      _id:id,
      _openid:this.data.openid
    }).update({
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
  },

  //拨打电话
  onMakeCall(){
    wx.makePhoneCall({
      phoneNumber: this.data.phone,
    })
  },

  //分享
  onShareAppMessage: function () {
    const {productName,productPirce} = this.data
    return {
      title: `型号:${productName} 价格:${productPirce}`,
    }
  },
  //分享朋友圈
  onShareTimeline:function(){
    return {
      imageUrl:this.data.imgList[0].url
    }
  }
})
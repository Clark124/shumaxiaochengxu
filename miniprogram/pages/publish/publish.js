// miniprogram/pages/publish/publish.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    targetArray: ['发布','需求'],
    targetIndex: 0,
    typeArray:['电脑','手机','电脑配件'],
    typeIndex:0,
    productName:"", 
    productDiscribe:"",
    businessName:"",
    phone:null,
    imgList:[""]
  },

  onLoad: function (options) {

  },

  onChangeTarget: function(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      index: e.detail.value
    })
  },
  inputProductName(e){
    this.setData({productDiscribe:e.detail.value})
  },
  inputProductDiscribe(e){
    this.setData({productName:e.detail.value})
  },
  inputBusinessName(e){
    this.setData({businessName:e.detail.value})
  },
  inputPhone(e){
    this.setData({phone:e.detail.value})
  },
   // 上传图片
   doUpload: function () {
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        wx.showLoading({
          title: '上传中',
        })
        const filePath = res.tempFilePaths[0]
        // 上传图片
        const cloudPath = `my-image${filePath.match(/\.[^.]+?$/)[0]}`
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            console.log('[上传文件] 成功：', res)
            app.globalData.fileID = res.fileID
            app.globalData.cloudPath = cloudPath
            app.globalData.imagePath = filePath
          },
          fail: e => {
            console.error('[上传文件] 失败：', e)
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          },
          complete: () => {
            wx.hideLoading()
          }
        })
      },
      fail: e => {
        console.error(e)
      }
    })
  },

  upload(e){
    console.log(e)
  }



})
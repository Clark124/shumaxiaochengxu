// miniprogram/pages/manageBanner/manageBanner.js
Page({
  data: {
    bannerList:[{}]
  },


  onLoad: function (options) {
    const db = wx.cloud.database()
    db.collection('banner').doc('28ee4e3e607f964410e90d9b6cb28410').get({
      success:res=>{
        console.log(res.data)
        this.setData({...res.data})
      }
    })
  },
 
  //上传图片
  uploadBanner(e) {
    const index = e.currentTarget.dataset.index
    const _this = this
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
        const cloudPath = `product-image${new Date().getTime()}${filePath.match(/\.[^.]+?$/)[0]}`
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            const fileId = res.fileID
            wx.cloud.getTempFileURL({
              fileList: [fileId],
              success: res => {
                let {
                  bannerList
                } = _this.data
                const len = bannerList.length
                const url = res.fileList[0].tempFileURL
                bannerList[index] = {
                  fileId,
                  url
                }
                if (bannerList[len - 1].url) {
                  bannerList.push({})
                }
                _this.setData({
                  bannerList
                })
              }
            })
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

  //删除图片
  cancelImg(e) {
    const index = e.currentTarget.dataset.index
    let {
      bannerList
    } = this.data
    bannerList.splice(index, 1)
    
    this.setData({
      bannerList
    })
  },

  onSubmit(){
    const {bannerList,_id} = this.data
    if(bannerList.length===1){
      wx.showToast({
        title: '请上传图片！',
        icon:'none'
      })
      return
    }
    wx.showLoading({
      title: '上传中...',
      mask:true
    })
    const db = wx.cloud.database()
    db.collection('banner').doc(_id).update({
      data:{
        bannerList
      },
      success:res=>{
        wx.hideLoading()
        wx.showToast({
          title: '上传成功',
          icon:"success"
        })
      }
    })
  }

 
})
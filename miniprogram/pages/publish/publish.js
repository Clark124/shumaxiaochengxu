// miniprogram/pages/publish/publish.js
const moment = require('../../utils/moment')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    targetArray: ['库存', '需求','报价'], //发布类型
    targetIndex: -1,
    stocType: [],  //库存类目
    stockTypeIndex: -1,
    needsType:[], //需求类目
    needsTypeIndex:-1,
    quotedPirceType:[], //报价类目
    quotedPirceTypeIndex:-1,
    regionList:[], //区域选择列表
    regionIndex:-1,

    productName: "",
    quotedPriceTitle:"", //发布报价标题
    quotedPriceTitlePlaceholder:`例：${moment().format('MM.DD')}苹果国行报价`,
    productPirce: null,
    productCount: null,
    productDiscribe: "",
    businessName: "",   //商家名称
    phone: null,
    imgList: [""]
  },

  onLoad: function (options) {
    this.getSelectList()
  },

  
  //获取选择列表
  getSelectList(){
    const db = wx.cloud.database()
    //需求类目
    db.collection('needsType').get({
      success:(res)=>{
        this.setData({needsType:res.data})
      }
    })
    //库存类目
    db.collection('stockType').get({
      success:(res)=>{
        this.setData({stocType:res.data})
      }
    })
    //报价类目
    db.collection('quotedPriceType').get({
      success:(res)=>{
        this.setData({quotedPirceType:res.data})
      }
    })
    //区域列表
    db.collection('region').get({
      success:(res)=>{
        this.setData({regionList:res.data})
      }
    })
  },

  //选择发布方式
  onChangeTarget: function (e) {
    this.setData({
      targetIndex: e.detail.value
    })
  },

  //选择类型
  onChangeType(e) {
    this.setData({
      [e.currentTarget.dataset.type]: e.detail.value
    })
  },

  //输入产品名称
  inputProductName(e) {
    this.setData({
      productName: e.detail.value
    })
  },

  //输入产品价格
  inputProductPrice(e) {
    this.setData({
      productPirce: e.detail.value
    })
  },

  // 输入商品数量
  inputProductCount(e) {
    this.setData({
      productCount: e.detail.value
    })
  },

  //输入产品描述
  inputProductDiscribe(e) {
    this.setData({
      productDiscribe: e.detail.value
    })
  },

  //输入商家名称
  inputBusinessName(e) {
    this.setData({
      businessName: e.detail.value
    })
  },

  //输入联系方式
  inputPhone(e) {
    this.setData({
      phone: e.detail.value
    })
  },

  //输入报价标题
  inputQuotedPrice(){
    this.setData({
      quotedPriceTitle: e.detail.value
    })
  },

  //上传图片
  upload(e) {
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
        const cloudPath = `my-image${new Date().getTime()}${filePath.match(/\.[^.]+?$/)[0]}`
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            let {
              imgList
            } = _this.data
            const len = imgList.length
            imgList[index] = res.fileID
            if (len < 5 && imgList[len - 1] !== "") {
              imgList.push('')
            }

            _this.setData({
              imgList
            })
            // app.globalData.fileID = res.fileID
            // app.globalData.cloudPath = cloudPath
            // app.globalData.imagePath = filePath
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
      imgList
    } = this.data
    imgList.splice(index, 1)
    this.setData({
      imgList
    })
  },
  
  onSubmit() {
    const {
      targetIndex,
      typeIndex,
      productName,
      productPirce,
      productCount,
      productDiscribe,
      businessName,
      phone,
      imgList
    } = this.data
    //验证必填数据
    if(!productName||!businessName||!phone||!productPirce||!productCount){
      wx.showModal({
        title:"提示",
        content:"请完善必填项",
        showCancel:false
      })
      return
    }


    const db = wx.cloud.database()
    const collection = targetIndex === 0 ? "stock" : "needs"
    const nowTime = moment().format('YYYY-MM-DD HH:mm:ss')
    wx.showLoading({
      title: '发布中...',
    })
    db.collection(collection).add({
      data: {
        category:typeIndex,
        productName,
        productPirce,
        productCount,
        productDiscribe,
        businessName,
        phone,
        imgList,
        createDate: nowTime,
        updateDate: nowTime
      },
      success: (res) => {
        wx.showToast({
          title:"发布成功",
          icon:"success",
          duration: 2000
        })
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '发布失败',
          duration: 2000
        })
      },
      complete:()=>{
        
      }
    })

  }
})
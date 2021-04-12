// miniprogram/pages/publish/publish.js
const moment = require('../../utils/moment')
const app = getApp()

Page({
  data: {
    isLogin: false,
    targetArray: ['库存', '需求', '报价'], //发布类型
    targetIndex: -1,
    stockType: [], //库存类目
    stockTypeIndex: -1,
    needsType: [], //需求类目
    needsTypeIndex: -1,
    quotedPirceType: [], //报价类目
    quotedPirceTypeIndex: -1,
    regionList: [], //区域选择列表
    regionIndex: -1,

    productName: "",
    quotedPriceTitle: "", //发布报价标题
    quotedPriceTitlePlaceholder: `例:${moment().format('MM.DD')}苹果国行报价`,
    productPirce: null,
    productCount: null,
    productDiscribe: "",
    productConfig: "", //配置
    productCondition: "", //成色
    businessName: "", //商家名称
    phone: null,
    imgList: [{}], //产品图片
    productDetailImg: [{}], //商品细节图片
  },

  onLoad: function (options) {
    const isLogin = app.globalData.isLogin
    if (isLogin) {
      this.setData({
        isLogin: true
      })
    }
    this.getSelectList()
  },
  onShow: function () {
    const isLogin = app.globalData.isLogin
    if (isLogin) {
      this.setData({
        isLogin: true
      })
    }
  },


  //获取选择列表
  getSelectList() {
    const db = wx.cloud.database()
    //需求类目
    db.collection('needsType').get({
      success: (res) => {
        this.setData({
          needsType: res.data
        })
      }
    })
    //库存类目
    db.collection('stockType').get({
      success: (res) => {
        this.setData({
          stockType: res.data
        })
      }
    })
    //报价类目
    db.collection('quotedPriceType').get({
      success: (res) => {
        this.setData({
          quotedPirceType: res.data
        })
      }
    })
    //区域列表
    db.collection('region').get({
      success: (res) => {
        this.setData({
          regionList: res.data
        })
      }
    })
  },

  //选择发布方式
  onChangeTarget: function (e) {
    this.setData({
      targetIndex: Number(e.detail.value)
    })
  },

  //选择类型
  onChangeType(e) {
    this.setData({
      [e.currentTarget.dataset.type]: Number(e.detail.value)
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

  //输入产品配置
  inputProductConfig(e) {
    this.setData({
      productConfig: e.detail.value
    })
  },
  //输入产品成色
  inputProductCondition(e) {
    this.setData({
      productCondition: e.detail.value
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
  inputQuotedPrice(e) {
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
                  imgList
                } = _this.data
                const len = imgList.length

                const url = res.fileList[0].tempFileURL

                imgList[index] = {
                  fileId,
                  url
                }
                if (len < 5 && imgList[len - 1] !== "") {
                  imgList.push({})
                }

                _this.setData({
                  imgList
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
  //上传商品细节图片
  uploadDetail(e) {
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
        const cloudPath = `product-detail-image${new Date().getTime()}${filePath.match(/\.[^.]+?$/)[0]}`
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            const fileId = res.fileID
            wx.cloud.getTempFileURL({
              fileList: [fileId],
              success: res => {
                let {
                  productDetailImg
                } = _this.data
                const len = productDetailImg.length
                const url = res.fileList[0].tempFileURL
                productDetailImg[index] = {
                  fileId,
                  url
                }
                if (len < 5 && productDetailImg[len - 1] !== "") {
                  productDetailImg.push({})
                }
                _this.setData({
                  productDetailImg
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
      imgList
    } = this.data
    imgList.splice(index, 1)
    if (imgList.length === 4) {
      imgList.push("")
    }
    this.setData({
      imgList
    })
  },
  cancelDetailImg(e) {
    const index = e.currentTarget.dataset.index
    let {
      productDetailImg
    } = this.data
    productDetailImg.splice(index, 1)
    if (productDetailImg.length === 4) {
      productDetailImg.push("")
    }
    this.setData({
      productDetailImg
    })
  },

  onSubmit() {
    const {
      targetIndex
    } = this.data

    if (targetIndex === 0) {
      this.submitStock()
    } else if (targetIndex === 1) {
      this.submitNeeds()
    } else if (targetIndex === 2) {
      this.submitQuotedPrice()
    }


  },
  //提交库存
  submitStock() {
    const {
      stockType,
      stockTypeIndex,
      regionList,
      regionIndex,
      productName,
      productPirce,
      productCount,
      productConfig,
      productCondition,
      businessName,
      phone,
      imgList,
      productDetailImg
    } = this.data
    //验证填写数据
    const verifyStockData = this.verifyStockData()
    if (!verifyStockData) {
      return
    }

    const db = wx.cloud.database()
    wx.showLoading({
      title: '发布中...',
    })
    db.collection('stock').add({
      data: {
        typeName: stockType[stockTypeIndex].name,
        typeId: stockType[stockTypeIndex]._id,
        regionName: regionList[regionIndex].name,
        regionId: regionList[regionIndex]._id,
        productName,
        productPirce: Number(productPirce),
        productCount: Number(productCount),
        productConfig,
        productCondition,
        businessName,
        phone,
        imgList,
        productDetailImg,
        createDate: new Date(),
        updateDate: new Date(),
        expireDate: new Date(moment().add(1, 'month')), //1个月后过期
        topExpireDate: new Date(), //置顶到期时间
        isTop: false,
        isOffShelf:false,
      },
      success: (res) => {
        wx.showToast({
          title: "发布成功",
          icon: "success",
          duration: 2000,
          mask: true
        })
        setTimeout(() => {
          const url = '/pages/stock/stock'
          app.globalData.typeIndex = stockTypeIndex
          wx.switchTab({
            url: url,
          })
          this.clearData()
        }, 2000)
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '发布失败',
          duration: 2000
        })
      },
    })
  },
  //验证提交库存数据
  verifyStockData() {
    const {
      stockTypeIndex,
      regionIndex,
      productName,
      productPirce,
      productCount,
      productConfig,
      productCondition,
      businessName,
      phone,
      imgList,
      productDetailImg
    } = this.data
    if (stockTypeIndex < 0) {
      wx.showToast({
        title: '请选择类目',
        icon: "none"
      })
      return false
    }
    if (regionIndex < 0) {
      wx.showToast({
        title: '请选择区域',
        icon: "none"
      })
      return false
    }
    if (productName.trim() === "") {
      wx.showToast({
        title: '请输入产品名称',
        icon: "none"
      })
      return false
    }
    if (!productPirce) {
      wx.showToast({
        title: '请输入产品价格',
        icon: "none"
      })
      return false
    }
    if (!productCount) {
      wx.showToast({
        title: '请输入产品数量',
        icon: "none"
      })
      return false
    }
    if (productConfig.trim() === "") {
      wx.showToast({
        title: '请输入配置',
        icon: "none"
      })
      return false
    }
    if (productCondition.trim() === "") {
      wx.showToast({
        title: '请输入产品成色',
        icon: "none"
      })
      return false
    }
    if (!businessName.trim() === "") {
      wx.showToast({
        title: '请输入商家名称',
        icon: "none"
      })
      return false
    }
    if (!phone) {
      wx.showToast({
        title: '请输入联系电话',
        icon: "none"
      })
      return false
    }
    if (imgList.length < 2) {
      wx.showToast({
        title: '请上传产品图片',
        icon: "none"
      })
      return false
    }
    if (productDetailImg.length < 2) {
      wx.showToast({
        title: '请上传产品细节',
        icon: "none"
      })
      return false
    }
    return true
  },
  submitNeeds() {
    const {
      needsType,
      needsTypeIndex,
      regionList,
      regionIndex,
      productName,
      productConfig,
      productCondition,
      productPirce,
      productCount,
      businessName,
      phone,
    } = this.data
    //验证填写数据
    const verifyNeedData = this.verifyNeedData()
    if (!verifyNeedData) {
      return
    }

    const db = wx.cloud.database()
    wx.showLoading({
      title: '发布中...',
    })
    db.collection('needs').add({
      data: {
        typeName: needsType[needsTypeIndex].name,
        typeId: needsType[needsTypeIndex]._id,
        regionName: regionList[regionIndex].name,
        regionId: regionList[regionIndex]._id,
        productName,
        productPirce: Number(productPirce),
        productCount: Number(productCount),
        productConfig,
        productCondition,
        businessName,
        phone,
        createDate: new Date(),
        updateDate: new Date(),
        expireDate: new Date(moment().add(1, 'month')), //1个月后过期
        topExpireDate: new Date(),
        isTop: false,
        isOffShelf:false
      },
      success: (res) => {
        wx.showToast({
          title: "发布成功",
          icon: "success",
          duration: 2000,
          mask: true
        })
        setTimeout(() => {
          const url = '/pages/needs/needs'
          app.globalData.typeIndex = needsTypeIndex
          wx.navigateTo({
            url: url,
          })
          this.clearData()
        }, 2000)
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '发布失败',
          duration: 2000
        })
      },
    })
  },
  verifyNeedData() {
    const {
      needsTypeIndex,
      regionIndex,
      productName,
      productPirce,
      productCount,
      productConfig,
      productCondition,
      businessName,
      phone
    } = this.data
    if (needsTypeIndex < 0) {
      wx.showToast({
        title: '请选择类目',
        icon: "none"
      })
      return false
    }
    if (regionIndex < 0) {
      wx.showToast({
        title: '请选择区域',
        icon: "none"
      })
      return false
    }
    if (productName.trim() === "") {
      wx.showToast({
        title: '请输入产品名称',
        icon: "none"
      })
      return false
    }
    if (!productPirce) {
      wx.showToast({
        title: '请输入产品价格',
        icon: "none"
      })
      return false
    }
    if (!productCount) {
      wx.showToast({
        title: '请输入产品数量',
        icon: "none"
      })
      return false
    }
    if (productConfig.trim() === "") {
      wx.showToast({
        title: '请输入配置',
        icon: "none"
      })
      return false
    }
    if (productCondition.trim() === "") {
      wx.showToast({
        title: '请输入产品成色',
        icon: "none"
      })
      return false
    }
    if (!businessName.trim() === "") {
      wx.showToast({
        title: '请输入商家名称',
        icon: "none"
      })
      return false
    }
    if (!phone) {
      wx.showToast({
        title: '请输入联系电话',
        icon: "none"
      })
      return false
    }
    return true
  },
  submitQuotedPrice() {
    const {
      quotedPirceType,
      quotedPirceTypeIndex,
      regionList,
      regionIndex,
      quotedPriceTitle,
      businessName,
      phone,
      imgList
    } = this.data
    //验证填写数据
    const verifyQuotedPriceData = this.verifyQuotedPriceData()
    if (!verifyQuotedPriceData) {
      return
    }

    const db = wx.cloud.database()
    wx.showLoading({
      title: '发布中...',
    })
    db.collection('quotedPrice').add({
      data: {
        typeName: quotedPirceType[quotedPirceTypeIndex].name,
        typeId: quotedPirceType[quotedPirceTypeIndex]._id,
        regionName: regionList[regionIndex].name,
        regionId: regionList[regionIndex]._id,
        quotedPriceTitle,
        businessName,
        phone,
        imgList,
        createDate: new Date(),
        updateDate: new Date(),
        expireDate: new Date(moment().add(1, 'month')), //1个月后过期
        topExpireDate: new Date(),
        isTop: false,
        isOffShelf:false  
      },
      success: (res) => {
        wx.showToast({
          title: "发布成功",
          icon: "success",
          duration: 2000,
          mask: true
        })
        setTimeout(() => {
          const url = '/pages/quotedPrice/quotedPrice'
          app.globalData.typeIndex = quotedPirceTypeIndex
          wx.switchTab({
            url: url,
          })
          this.clearData()
        }, 2000)
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '发布失败',
          duration: 2000
        })
      },
    })
  },
  verifyQuotedPriceData() {
    const {
      quotedPirceTypeIndex,
      regionIndex,
      quotedPriceTitle,
      businessName,
      phone,
      imgList
    } = this.data
    if (quotedPirceTypeIndex < 0) {
      wx.showToast({
        title: '请选择类目',
        icon: "none"
      })
      return false
    }
    if (regionIndex < 0) {
      wx.showToast({
        title: '请选择区域',
        icon: "none"
      })
      return false
    }
    if (quotedPriceTitle.trim() === "") {
      wx.showToast({
        title: '请输入标题',
        icon: "none"
      })
      return false
    }

    if (!businessName.trim() === "") {
      wx.showToast({
        title: '请输入商家名称',
        icon: "none"
      })
      return false
    }
    if (!phone) {
      wx.showToast({
        title: '请输入联系电话',
        icon: "none"
      })
      return false
    }
    if (imgList.length < 2) {
      wx.showToast({
        title: '请上传产品图片',
        icon: "none"
      })
      return false
    }
    return true
  },

  navToUserCentre() {
    wx.switchTab({
      url: '/pages/userCenter/userCenter',
    })
  },

  //清空数据
  clearData() {
    this.setData({
      targetIndex: -1,
      stockTypeIndex: -1,
      needsTypeIndex: -1,
      quotedPirceTypeIndex: -1,
      regionIndex: -1,
      productName: "",
      quotedPriceTitle: "", //发布报价标题
      quotedPriceTitlePlaceholder: `例:${moment().format('MM.DD')}苹果国行报价`,
      productPirce: null,
      productCount: null,
      productConfig: "",
      productCondition:"",
      businessName: "", //商家名称
      phone: null,
      imgList: [{}], //产品图片
      productDetailImg: [{}], //商品细节图片
    })
  }
})
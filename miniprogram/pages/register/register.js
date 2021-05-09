// miniprogram/pages/register/register.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    phone: null,
    email: "",
    businessName: "",
    businessAddress: "",
    regionList: [], //区域选择列表
    regionIndex: -1,
    typeList: ['手机', '电脑'],
    typeIndex: -1

  },


  onLoad: function (options) {
    this.getSelectList()
  },

  //获取电话
  getPhone(e) {
    var that = this;

    wx.cloud.callFunction({
      name: 'getMobile',
      data: {
        weRunData: wx.cloud.CloudID(e.detail.cloudID),
      }
    }).then(res => {

      const phoneNum = res.result.event.weRunData.data.phoneNumber
      console.log(phoneNum)
      that.setData({
        phone: phoneNum,
      })
    }).catch(err => {
      console.error(err);
    });
  },

  //输入联系方式
  inputPhone(e) {
    this.setData({
      phone: e.detail.value
    })
  },

  //输入邮箱
  inputEmail(e) {
    this.setData({
      email: e.detail.value
    })
  },

  //输入店铺名称
  inputBusinessName(e) {
    this.setData({
      businessName: e.detail.value
    })
  },

  inputBusinessAddress(e) {
    this.setData({
      businessAddress: e.detail.value
    })
  },
  //获取选择列表
  getSelectList() {
    const db = wx.cloud.database()
    //区域列表
    db.collection('region').get({
      success: (res) => {
        this.setData({
          regionList: res.data
        })
      }
    })
  },
  //选择类型
  onChangeType(e) {
    this.setData({
      [e.currentTarget.dataset.type]: Number(e.detail.value)
    })
  },

  onSubmit() {
    const verifyInput = this.verifyInput()
    if (!verifyInput) {
      return
    }
    this.getUserProfile()
  },

  getUserProfile() {
    wx.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        const { phone, email, businessName, businessAddress,regionList, regionIndex, typeIndex } = this.data
        const db = wx.cloud.database()
        db.collection('user').add({
          data: {
            ...res.userInfo,
            phone,
            email,
            businessName,
            businessAddress,
            region:regionList[regionIndex],
            
            createDate: new Date(),
            userLevel: 1, //1.普通  2.会员  3.管理员 
          },
          success: res => {
            app.globalData.isLogin = true
          }
        })

      }
    })
  },
  verifyInput() {
    const { phone, email, businessName, businessAddress, regionIndex, typeIndex } = this.data
    if (!(/^1[3456789]\d{9}$/.test(Number(phone)))) {
      wx.showToast({
        title: '手机号码有误',
        icon: "none"
      })
      return false;
    }
    var reg = /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/;
    if (!reg.test(email)) {
      wx.showToast({
        title: '邮箱格式不正确',
        icon: "none"
      })
      return
    }
    if(businessName.trim()===""){
      wx.showToast({
        title: '请输入店铺名称',
        icon: "none"
      })
      return
    }
    if(businessAddress.trim()===""){
      wx.showToast({
        title: '请输入店铺地址',
        icon: "none"
      })
      return
    }
    if(regionIndex===-1){
      wx.showToast({
        title: '请选择区域',
        icon: "none"
      })
      return
    }
    if(typeIndex===-1){
      wx.showToast({
        title: '请选择领域',
        icon: "none"
      })
      return
    }

    return true

  }



})
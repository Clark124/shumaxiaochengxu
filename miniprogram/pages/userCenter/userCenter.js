// miniprogram/pages/userCenter/userCenter.js
const app = getApp()
Page({
  data: {
    avatarUrl: '/images/user-unlogin.png',
    userInfo: {},
    hasUserInfo: false,
    logged: false,
    takeSession: false,
    requestResult: '',
    canIUseGetUserProfile: false,
    canIUseOpenData: false, // 如需尝试获取用户信息可改为false
    isLogin:false,
    isDataArrive:true
  },

  navToRegister(){
    wx.navigateTo({
      url: '/pages/register/register',
    })
  },

  onLoad: function (options) {
    this.isShowModal = true
    const isLogin = app.globalData.isLogin
    if(isLogin){
      this.setData({canIUseOpenData:true})
    }
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true,
      })
    }
    let base64 = wx.getFileSystemManager().readFileSync(this.data.avatarUrl, 'base64');
    this.setData({ avatarUrl: 'data:image/jpg;base64,' + base64 })
  },

  onShow(){
    const isLogin = app.globalData.isLogin
    if(isLogin){
      this.getUserInfo()
    }
  },

  //获取用户信息
  getUserInfo(){
    const openid = app.globalData.openid
    const db = wx.cloud.database()
    db.collection('user').where({
      _openid: openid,
    }).get({
      success:res=>{
        if(res.data.length>0){
          const userInfo = res.data[0]
          if(userInfo.userLevel!==1&&userInfo.vipExpireDate<new Date()){
            userInfo.userLevel = 4
          }
          app.globalData.userInfo = userInfo
          this.setData({userInfo:userInfo,isLogin:true})
        }
      }
    })
  },

  getUserProfile() {
    if(!this.isShowModal){
      return
    }
    this.isShowModal = false
    setTimeout(()=>{
      this.isShowModal = true
    },1000)
    wx.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        const {isDataArrive} = this.data
        if(!isDataArrive){
          return
        }
        const db = wx.cloud.database()
        let userLevel = 3
        if (new Date() > new Date('2021/06/01')) {
          userLevel = 4
        }
        const userInfo = {
          ...res.userInfo,
          createDate: new Date(),
          userLevel: userLevel, //1.普通  2.会员  3.管理员 
          vipExpireDate: new Date('2021/06/01'),
          region: [{
            _id: '28ee4e3e6061957c0d443d0d35088a23',
            name: "武昌广埠屯"
          }],
          businessType: ['手机']
        }
        this.setData({isDataArrive:false})
        db.collection('user').add({
          data: userInfo,
          success:ret=>{
            this.setData({
              userInfo: userInfo,
              canIUseOpenData: true,
              isLogin:true,
              isDataArrive:true
            })
            app.globalData.isLogin = true
            app.globalData.userInfo = userInfo
          },
          fail:err=>{
            this.setData({isDataArrive:true})
          }
        })
       
      }
    })
  },

  onGetUserInfo: function (e) {
    if (!this.data.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo,
        hasUserInfo: true,
      })
    }
  },

  onMakeCall(){
    wx.makePhoneCall({
      phoneNumber: "18164113247",
    })
  },
  
  onShowEWM(){
    wx.previewImage({
      current: 'cloud://test-4g4qvj3hf2e69c63.7465-test-4g4qvj3hf2e69c63-1305399772/contact_img.jpeg', // 当前显示图片的http链接
      urls: ['cloud://test-4g4qvj3hf2e69c63.7465-test-4g4qvj3hf2e69c63-1305399772/contact_img.jpeg'] // 需要预览的图片http链接列表
    })
  },

  navManager(){
    wx.navigateTo({
      url: '/pages/manageList/manageList',
    })
  },

  navMyVip(){
    if(!this.data.isLogin){
      wx.showToast({
        title: '请先登录',
        icon:"none"
      })
      return
    }
    wx.navigateTo({
      url: '/pages/userVip/userVip',
    })

  }

})
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
    canIUseOpenData: false // 如需尝试获取用户信息可改为false
  },

  onLoad: function (options) {
    const isLogin = app.globalData.isLogin
    if(isLogin){
      this.setData({canIUseOpenData:true,userInfo:app.globalData.userInfo})
    }
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true,
      })
    }
    let base64 = wx.getFileSystemManager().readFileSync(this.data.avatarUrl, 'base64');
    this.setData({ avatarUrl: 'data:image/jpg;base64,' + base64 })
  },
  navToRegister(){
    wx.navigateTo({
      url: '/pages/register/register',
    })
  },

  getUserProfile() {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        const db = wx.cloud.database()
        db.collection('user').add({
          data: {
            ...res.userInfo,
            createDate: new Date(),
            userLevel: 3, //1.普通  2.会员  3.管理员 
            vipExpireDate:  new Date('2021/06/01'),
            region:[{_id:'28ee4e3e6061957c0d443d0d35088a23',name:"武昌广埠屯"}],
            businessType:['手机']
          },
          success:ret=>{
            this.setData({
              // avatarUrl: res.userInfo.avatarUrl,
              userInfo: res.userInfo,
              // hasUserInfo: true,
              canIUseOpenData: true
            })
            app.globalData.isLogin = true
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
  }

})
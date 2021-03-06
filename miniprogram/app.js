//app.js
App({
  onLaunch:async function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        // env: 'my-env-id',
        traceUser: true,
      })
    }
    // await this.login()
  },
  login(){
    return new Promise((resolve,reject)=>{
      wx.showLoading({
        title: '加载中',
        mask:true
      })
      wx.cloud.callFunction({
        name: 'login',
        data: {},
        success: res => {
  
          const openid =  res.result.openid
          this.globalData.openid = openid
        
          const db = wx.cloud.database()
          db.collection('user').where({
            _openid: openid,
          }).get({
            success:res=>{
              console.log(res)
              wx.hideLoading()
              if(res.data.length>0){
                this.globalData.isLogin = true
              }
              resolve()
            }
          })
        },
        fail: err => {
          reject()
          wx.hideLoading()
          console.error('[云函数] [login] 调用失败', err)
         
        }
      })
    })
    
  },
  globalData:{
    isLogin:false
  }
})

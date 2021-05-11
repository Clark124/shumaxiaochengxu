// miniprogram/pages/manageUserDetail/manageUserDetail.js
const moment = require('../../utils/moment')
Page({
  data: {
    vipLeverList: ['管理员', '批发商', '零售商', '个人'],
    typeList: [{
      name: '手机',
      checked: false
    }, {
      name: '电脑',
      checked: false
    }],
    regionList:[],
  },


  onLoad: function (options) {
    const {
      id
    } = options
    const db = wx.cloud.database()
    
    //区域列表
    db.collection('region').get({
      success: (ret) => {
       
        const regionList = ret.data
        //获取用户信息
        db.collection('user').doc(id).get({
          success: res => {
            let data = res.data
            data.vipDate = moment(data.vipExpireDate).format('YYYY-MM-DD')
            const {
              typeList
            } = this.data
            typeList.forEach(item => {
              if (data.businessType.includes(item.name)) {
                item.checked = true
              }
            })
            regionList.forEach(item=>{
              data.region.forEach(regionItem=>{
                if(item._id === regionItem._id){
                  item.checked = true
                }
              })
            })
            this.setData({
              ...this.data,
              ...data,
              regionList
            })
          }
        })
       
      }
    })
  },

  radioChange(e) {
    this.setData({
      userLevel: Number(e.detail.value)
    })
  },

  checkboxChange(e) {
    let {typeList} = this.data
    const value = e.detail.value
    typeList.forEach(item=>{
      if(value.includes(item.name)){
        item.checked = true
      }else{
        item.checked = false
      }
    })
    this.setData({
      businessType: value,typeList
    })
  },

  changeArea(e){
    const value = e.detail.value
    let {regionList} = this.data
    let region = []
    regionList.forEach(item=>{
      if(value.includes(item.name)){
        item.checked = true
        region.push(item)
      }else{
        item.checked = false
      }
    })
    this.setData({regionList,region})
  },

  changeVipDate(e){
    this.setData({vipDate:e.detail.value})
  },

  onSubmit(){
    const {userLevel,businessType,region,vipDate} = this.data

    wx.showLoading({
      title: '加载中...',
    })
    wx.cloud.callFunction({
      name: 'managePublic',
      data: {
        type: "update", //指定操作是insert  
        collection: 'user', //指定操作的数据表
        id: this.data._id,
        data:{
          userLevel,businessType,region,vipExpireDate:new Date(vipDate)
        }
      },
      success: (res) => {
        
        wx.hideLoading()
        wx.showToast({
          title: '提交成功',
          icon: "success"
        })
      },
      fail: err => {
        wx.hideLoading()
        console.error('[云函数] [insertDB] 增加失败', err)
      }
    })
   


  }



})
const app = getApp()
const moment = require('../../utils/moment')
Page({
  data: {
    scrollTop:0,
    openid:"",
    typeList:[],
    typeIndex:0,
    stockList:[],
    triggered:true,
    page:1,
    pageSize:10,
    isDataArrive:true,
    isDataOver:false
  },

  
  onLoad: function (options) {
    const db = wx.cloud.database()
    const openid = app.globalData.openid
    this.setData({openid})
    db.collection('quotedPriceType').get({
      success:(res)=>{
        this.setData({typeList:res.data})
        this.getStockList()
      }
    })
  },

  //获取我的库存列表
  getStockList(callback){
    const db = wx.cloud.database()
    const {openid,page,pageSize,typeList,typeIndex} = this.data
    db.collection('quotedPrice').orderBy('updateDate','desc').skip((page-1)*pageSize).limit(pageSize).where({
      _openid: openid,
      typeId:typeList[typeIndex]._id
    }).get({
      success: (res) => {
        let dataList = res.data
        dataList.forEach(item=>{
          item.updateDate = moment(item.updateDate).format('YYYY-MM-DD HH:mm:ss')
        })
        this.setData({stockList:dataList,page:2,isDataOver:false,isDataArrive:true})
        if(res.data.length<10){
          this.setData({isDataOver:true})
        }
        if(callback){
          callback()
        }
      }
    })
  },
  //切换tab
  onChangeTab(e){
    this.setData({typeIndex:e.currentTarget.dataset.index,page:1,isDataArrive:true,isDataOver:false,scrollTop:0})
    this.getStockList()
  },

  //下拉刷新
  onRefresh() {
    if (this._freshing) return
    this._freshing = true
    this.setData({isDataArrive:true,isDataOver:false,page:1})
    this.getStockList(()=>{
      this.setData({triggered:false})
      this._freshing = false
      wx.showToast({
        title: '刷新成功',
        icon:"success"
      })
    })
  },
  //加载更多
  loadMore(e){
    const {isDataArrive,isDataOver,stockList,openid,page,pageSize,typeList,typeIndex} = this.data
    if(page===1||!isDataArrive||isDataOver){
      return
    }
    this.setData({isDataArrive:false})
    const db = wx.cloud.database()
    db.collection('quotedPrice').orderBy('updateDate','desc').skip((page-1)*pageSize).limit(pageSize).where({
      _openid: openid,
      typeId:typeList[typeIndex]._id
    }).get({
      success: (res) => {
        let dataList = res.data
        dataList.forEach(item=>{
          item.updateDate = moment(item.updateDate).format('YYYY-MM-DD HH:mm:ss')
        })
        this.setData({stockList:[...stockList,...dataList],page:page+1,isDataArrive:true})
        if(res.data.length<10){
          this.setData({isDataOver:true})
        }
      }
    })
  },


  onShow: function () {

  },

 
  onHide: function () {

  },
})
// miniprogram/pages/search/search.js
const moment = require('../../utils/moment')

import {filterUserLevel} from '../../utils/index'

Page({
  data: {
    collection: "",
    key: "",
    scrollTop: 0,
    stockList: [],
    triggered: true,
    page: 1,
    pageSize: 10,
    isDataArrive: true,
    isDataOver: false
  },


  onLoad: function (options) {
    const {
      collection,
      key,
      typeId
    } = options
    this.setData({
      collection,
      key,
      typeId
    })

  },
  onShow: function () {
    this.setData({
      page: 1,
      isDataArrive: true,
      isDataOver: false,
      scrollTop: 0
    })
    this.getDataList()
  },

  getDataList(callback) {
    const {
      page,
      pageSize,
      collection,
      key,
      typeId
    } = this.data
    const db = wx.cloud.database()
    const _ = db.command
    let filterUserPublic =  filterUserLevel()
    filterUserPublic = Object.entries(filterUserPublic).map(item=>{
      return {
        [item[0]]:item[1]
      }
    })
    let condition
    let andCondition = [{expireDate: _.gte(new Date())},{isOffShelf:false},...filterUserPublic]
    if(typeId!=='undefined'){
      andCondition.push({typeId: typeId})
    }
    if (collection === 'stock' || collection === 'needs') {
      condition = _.or([{
        productName: db.RegExp({
          regexp: '.*' + key,
          options: 'i',
        })
      }, {
        productDiscribe: db.RegExp({
          regexp: '.*' + key,
          options: 'i',
        })
      },{
        businessName:db.RegExp({
          regexp: '.*' + key,
          options: 'i',
        })
      }
    ]).and(andCondition)
    } else if (collection === 'quotedPrice') {
      condition = _.or([{
        quotedPriceTitle: db.RegExp({
          regexp: '.*' + key,
          options: 'i',
        })
      },
      {
        businessName:db.RegExp({
          regexp: '.*' + key,
          options: 'i',
        })
      }
    
    ]).and(andCondition)
    }
    db.collection(collection).orderBy('createDate', 'desc').skip((page - 1) * pageSize).limit(pageSize).where(condition).get({
      success: res => {
        let dataList = res.data
        dataList.forEach(item => {
          item.createDate = moment(item.createDate).format('YYYY-MM-DD HH:mm:ss')
        })
        this.setData({
          stockList: dataList,
          isDataOver: false,
          isDataArrive: true,
          page: 2
        })
        if (dataList.length < 10) {
          this.setData({
            isDataOver: true
          })
        }
        if (callback) {
          callback()
        }
      }
    })
  },

  navToDetail(e) {
    const id = e.currentTarget.dataset.id
    let url = ""
    if (this.data.collection === 'stock') {
      url = '/pages/stockDetail/stockDetail?id=' + id
    } else if (this.data.collection === 'needs') {
      url = '/pages/needsDetail/needsDetail?id=' + id
    } else if (this.data.collection === "quotedPrice") {
      url = '/pages/quotedPriceDetail/quotedPriceDetail?id=' + id
    }

    wx.navigateTo({
      url,
    })
  },

  //????????????
  onRefresh() {
    if (this._freshing) return
    this._freshing = true
    this.setData({
      isDataArrive: true,
      isDataOver: false,
      page: 1
    })
    this.getDataList(() => {
      this.setData({
        triggered: false
      })
      this._freshing = false
      wx.showToast({
        title: '????????????',
        icon: "success"
      })
    })
  },
  //????????????
  loadMore(e) {
    const {
      isDataArrive,
      isDataOver,
      stockList,
      page,
      pageSize,
      typeId,
      collection,
      key
    } = this.data
    if (page === 1 || !isDataArrive || isDataOver) {
      return
    }
    this.setData({
      isDataArrive: false
    })
    const db = wx.cloud.database()
    const _ = db.command
    let filterUserPublic =  filterUserLevel()
    filterUserPublic = Object.entries(filterUserPublic).map(item=>{
      return {
        [item[0]]:item[1]
      }
    })
    //????????????
    let condition
    let andCondition = [{expireDate: _.gte(new Date())},{isOffShelf:false},...filterUserPublic]
    if(typeId!=='undefined'){
      andCondition.push({typeId: typeId})
    }
    if (collection === 'stock' || collection === 'needs') {
      condition = _.or([{
        productName: db.RegExp({
          regexp: '.*' + key,
          options: 'i',
        })
      }, {
        productDiscribe: db.RegExp({
          regexp: '.*' + key,
          options: 'i',
        })
      },{
        businessName:db.RegExp({
          regexp: '.*' + key,
          options: 'i',
        })
      }
    
    ]).and(andCondition)
    } else if (collection === 'quotedPrice') {
      condition = _.or([{
        quotedPriceTitle: db.RegExp({
          regexp: '.*' + key,
          options: 'i',
        })
      },
      {
        businessName:db.RegExp({
          regexp: '.*' + key,
          options: 'i',
        })
      }
    ]).and(andCondition)
    }
    db.collection(collection).orderBy('createDate', 'desc').skip((page - 1) * pageSize).limit(pageSize).where(
      condition
    ).get({
      success: (res) => {
        let dataList = res.data
        dataList.forEach(item => {
          item.createDate = moment(item.createDate).format('YYYY-MM-DD HH:mm:ss')
        })
        this.setData({
          stockList: [...stockList, ...dataList],
          page: page + 1,
          isDataArrive: true
        })
        if (res.data.length < 10) {
          this.setData({
            isDataOver: true
          })
        }
      }
    })
  },



  //???????????????
  onChangeInput(e) {
    this.setData({
      search: e.detail.value
    })
  },
  onConfirmSearch() {
    const {
      search,
    } = this.data
    if (!search.trim()) {
      wx.showToast({
        title: '?????????????????????',
        icon: "none"
      })
      return
    }
   
  },
})
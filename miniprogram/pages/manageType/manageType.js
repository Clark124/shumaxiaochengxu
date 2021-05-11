// miniprogram/pages/manageType/manageType.js
Page({

  data: {
    tabList: ['库存', '报价', '需求'],
    tabIndex: 0,
    typeList: [],
    clone: {
      name: "",
      top: 0,
    },
    replace: {
      name: '',
    },
    showClone: false,
    lastIndex: 0,
    status: 0,
    showAddModal:false,
    typeName:"",
    showEditModal:false,
    editType:{
      name:"",
    },
    regionList:['手机','电脑'],
    regionIndex:-1,
  },

  onLoad: function (options) {
    this.onGetTypeList()
    this.scrollTop = 0
  },

  onShow: function () {

  },

  onChangeTab(e) {
    const index = e.currentTarget.dataset.index
    this.setData({
      tabIndex: index
    })
    this.onGetTypeList()
  },

  onGetTypeList() {
    const {
      tabIndex
    } = this.data
    let collection = ""
    if (tabIndex === 0) {
      collection = 'stockType'
    } else if (tabIndex === 1) {
      collection = 'quotedPriceType'
    } else if (tabIndex === 2) {
      collection = 'needsType'
    }
    const db = wx.cloud.database()
    db.collection(collection).orderBy('index', 'asc').get({
      success: res => {
        const len = res.data.length
        const lastIndex = res.data[len - 1].index
        const list = res.data
        list.forEach(item => {
          item.isSelect = false
        })
        this.setData({
          typeList: res.data,
          lastIndex
        })
      }
    })
  },
  onScroll(e){
    this.scrollTop = e.detail.scrollTop
  },

  dragStart: function (e) {
    var that = this
    var clone = that.data.clone
    var i = e.currentTarget.dataset.index

    clone.name = this.data.typeList[i].name

    var query = wx.createSelectorQuery();
    //选择id
    query.select('.listbox').boundingClientRect(function (rect) {
      clone.top = e.changedTouches[0].clientY+that.scrollTop - rect.top - 30
      that.setData({
        clone: clone,
        showClone: true
      })
    }).exec();
  },

  dragMove: function (e) {
    var that = this
    var query = wx.createSelectorQuery();
    var clone = that.data.clone
    query.select('.listbox').boundingClientRect(function (rect) {
      clone.top = e.changedTouches[0].clientY+that.scrollTop - rect.top - 30
      
      that.setData({
        clone: clone,
      })
    }).exec();
  },

  dragEnd: function (e) {
    var that = this
    var i = e.currentTarget.dataset.index
    var query = wx.createSelectorQuery();
    var clone = that.data.clone
    var typeList = that.data.typeList
    query.select('.listbox').boundingClientRect(function (rect) {
      clone.top = e.changedTouches[0].clientY+that.scrollTop - rect.top - 30

      var target = Math.ceil((clone.top - 30) / 50)
      var replace = that.data.replace
      if (target >= 0) {
        replace = typeList[target]
        const currentIndex = typeList[i].index
        const targetIndex = typeList[target].index
        typeList[target] = typeList[i]
        typeList[i] = replace
        typeList[target].index = targetIndex
        typeList[i].index = currentIndex
        that.onChangeIndex(i, target)
      }
      that.setData({
        typeList: typeList,
        showClone: false
      })
    }).exec();
  },

  onChangeIndex(index, target) {
    const {
      tabIndex,
      typeList
    } = this.data
    let collection = ""
    if (tabIndex === 0) {
      collection = 'stockType'
    } else if (tabIndex === 1) {
      collection = 'quotedPriceType'
    } else if (tabIndex === 2) {
      collection = 'needsType'
    }
    const db = wx.cloud.database()
    db.collection(collection).doc(typeList[index]._id).update({
      data: {
        index: typeList[index].index
      }
    })
    db.collection(collection).doc(typeList[target]._id).update({
      data: {
        index: typeList[target].index
      }
    })
  },

  onChangeState() {
    this.setData({
      status: this.data.status === 0 ? 1 : 0
    })
  },

  onSelectDelete(e) {
    const index = e.currentTarget.dataset.index
    let {
      typeList
    } = this.data
    typeList[index].isSelect = !typeList[index].isSelect
    this.setData({
      typeList
    })
  },

  onDelete() {
    let { typeList,tabIndex} = this.data
    const selectList = typeList.filter(item => item.isSelect)
    if(selectList.length===0){
      wx.showToast({
        title: '请选择要删除的类目',
        icon:"none",
        mask:true
      })
      return
    }
    wx.showModal({
      title: "提示",
      content: "确定要删除所选中的类目吗？",
      success: res => {
        if (res.confirm) {
          selectList.forEach(item => {
            let collection = ""
            if (tabIndex === 0) {
              collection = 'stockType'
            } else if (tabIndex === 1) {
              collection = 'quotedPriceType'
            } else if (tabIndex === 2) {
              collection = 'needsType'
            }
            const db = wx.cloud.database()
            db.collection(collection).doc(item._id).remove()
          })
          typeList = typeList.filter(item=>!item.isSelect)
          this.setData({typeList})
          wx.showToast({
            title: '删除成功',
            icon:"success"
          })
          
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

  //显示添加modal
  onShowAddModal(){
    this.setData({showAddModal:true})
  },
  inputTypeName(e){
    this.setData({typeName:e.detail.value})
  },

  onChangeRegion(e){
    this.setData({regionIndex:Number(e.detail.value)})
  },

  hideModal(){
    this.setData({showAddModal:false})
  },
  onAddType(){
    const {typeName,tabIndex,lastIndex,regionList,regionIndex} = this.data
    if(typeName.trim()===""){
      wx.showToast({
        title: '请输入类目名称',
        icon:'none'
      })
      return
    }
    if(regionIndex<0){
      wx.showToast({
        title: '请选择领域',
        icon:'none'
      })
      return
    }

    let collection = ""
    if (tabIndex === 0) {
      collection = 'stockType'
    } else if (tabIndex === 1) {
      collection = 'quotedPriceType'
    } else if (tabIndex === 2) {
      collection = 'needsType'
    }
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    const db = wx.cloud.database()
    db.collection(collection).add({
      data:{
        name:typeName,
        index:lastIndex+1,
        type:regionList[regionIndex]
      },
      success:res=>{
        wx.hideLoading()
        wx.showToast({
          title: '添加成功！'
        })
        this.onGetTypeList()
        this.setData({showAddModal:false,typeName:"",regionIndex:-1})
      }
    })
  },

  //显示修改modal
  onShowEditModal(e){
    const index = e.currentTarget.dataset.index
    const {typeList,regionList} = this.data
    let regionIndex = -1
    if(typeList[index].type){
      regionList.forEach((item,itemIndex)=>{
        if(item===typeList[index].type){
          regionIndex = itemIndex
        }
      })
    }
    this.setData({showEditModal:true,editType:typeList[index],regionIndex})
  },
  hideEditModal(){
    this.setData({showEditModal:false,regionIndex:-1})
  },
  inputEditTypeName(e){
    const {editType} = this.data
    editType.name = e.detail.value
    this.setData({editType})
  },
  onEditTypeName(){
    const {editType,tabIndex,regionList,regionIndex} = this.data
    if(editType.name.trim()===""){
      wx.showToast({
        title: '请输入类目名称',
        icon:'none'
      })
      return
    }
    if(regionIndex<0){
      wx.showToast({
        title: '请选择领域',
        icon:'none'
      })
      return
    }
    let collection = ""
    if (tabIndex === 0) {
      collection = 'stockType'
    } else if (tabIndex === 1) {
      collection = 'quotedPriceType'
    } else if (tabIndex === 2) {
      collection = 'needsType'
    }
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    const db = wx.cloud.database()
    db.collection(collection).doc(editType._id).update({
      data:{
        name:editType.name,
        type:regionList[regionIndex]
      },
      success:res=>{
        wx.hideLoading()
        wx.showToast({
          title: '修改成功！'
        })
        this.onGetTypeList()
        this.setData({showEditModal:false,regionIndex:-1})
      }
    })

  },
  



})
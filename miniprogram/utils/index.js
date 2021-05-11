const app = getApp()

export function filterUserLevel() {
  const db = wx.cloud.database()
  const _ = db.command
  const userInfo = app.globalData.userInfo
  if (userInfo) {
    const {
      businessType,
      region,
      userLevel
    } = userInfo
    const regionIdList = region.map(item => item._id)
    if (userLevel === 2 || userLevel === 3) {
      return {
        typeRegion: _.in(businessType),
        regionId: _.in(regionIdList),
      }
    } else if (userLevel === 4) {
      return {
        typeRegion: _.in(['手机']),
        regionId: _.in(['28ee4e3e6061957c0d443d0d35088a23']),
        userLevel: 1
      }
    } else {
      return {}
    }
  } else {
    return {
      typeRegion: _.in(['手机']),
      regionId: _.in(['28ee4e3e6061957c0d443d0d35088a23']),
      userLevel: 1
    }
  }


}

export function filterType() {
  const db = wx.cloud.database()
  const _ = db.command
  const userInfo = app.globalData.userInfo
  if (userInfo) {
    const {
      businessType
    } = userInfo
    return {
      type: _.in(businessType)
    }
  } else {
    return {
      type: '手机'
    }
  }
}
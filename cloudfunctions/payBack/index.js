
// 云函数入口文件
const cloud = require('wx-server-sdk')
 
cloud.init({
  env:cloud.DYNAMIC_CURRENT_ENV
})
 
// 云函数入口函数
exports.main = async (event, context) => {
  const returnCode = event.returnCode
  // const orderId = event.outTradeNo
  // const openid = event.userInfo.openId
  // const cashFee = event.cashFee
  console.log(event)
  if(returnCode == 'SUCCESS'){
    // const db = cloud.database()
    //更新云数据库数据
    const res = {errcode:0,errmsg:''}//需要返回的字段，不返回该字段则一直回调
    return res
  }
}
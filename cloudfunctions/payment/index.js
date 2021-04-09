// 云函数代码
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event, context) => {
  const res = await cloud.cloudPay.unifiedOrder({
    "body" : event.body,
    "outTradeNo" : Date.parse(new Date()).toString(),
    "spbillCreateIp" : event.spbillCreateIp,
    "subMchId" : "1608238242",
    "totalFee" : parseInt(event.totalFee),
    "envId": "test-4g4qvj3hf2e69c63",
    "functionName": "payBack"
  })
  return res
}

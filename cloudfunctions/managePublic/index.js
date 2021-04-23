
const cloud = require('wx-server-sdk')
 
cloud.init()
const db = cloud.database()
const _ = db.command
 
// 云函数入口函数
exports.main = async (event, context) => {
  const targetDB = db.collection(event.collection)
  try {
    if (event.type == "insert") {
      return await targetDB.add({
        data: event.data,
        success:res=>{
          console.log("添加纪录成功",res);
        },
        fail:res=>{
          console.log("添加纪录失败", res);
        }
      })
    }
 
    if (event.type == "update") {
      return await targetDB.doc(event.id).update({
        data: event.data
      })
    }
 
    if (event.type == "remove") {
      return await targetDB.doc(event.id).remove()
    }
 
    if (event.type == "get") {
      return await targetDB.where(event.condition).get()
    }
  } catch (e) {
    console.error(e)
  }
}

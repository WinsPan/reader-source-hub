// 数据库 Dao、界面提示等：检测器中不使用，统一返回空结果
const noop = () => Promise.resolve(null)
const dao = new Proxy({}, { get: () => noop })
export default dao
export const showMessage = () => {}

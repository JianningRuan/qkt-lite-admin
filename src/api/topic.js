import { get, post } from '../utils/request'

export const topic = {
  // 新增修改话题
  updateCompusTopic (params) {
    return post('/service/lite/admin/compustopic/updateCompusTopic', params)
  },
  // 获取话题信息
  getCompusTopic (params) {
    return get('/service/lite/admin/compustopic/getCompusTopic', params)
  },
  // 话题列表
  compustopicList (params) {
    return get('/service/lite/admin/compustopic/compustopicList', params)
  },
  // 话题删除
  delCompusTopic (params) {
    return post('/service/lite/admin/compustopic/delCompusTopic', params)
  }
}

import { get, post } from '../utils/request'

export const tag = {
  // 新增修改标签
  updateTag (params) {
    return post('/service/lite/admin/tag/updateTag', params)
  },
  // 标签列表
  getTagList (params) {
    return get('/service/lite/admin/tag/getTagList', params)
  },
  // 标签删除
  delTag (params) {
    return post('/service/lite/admin/tag/delTag', params)
  },
  // 根据类型获取标签
  getTagByType (params) {
    return get('/service/lite/admin/tag/getTagByType', params)
  },
  // 获取标签信息
  getTag (params) {
    return get('/service/lite/admin/tag/getTag', params)
  }
}

import { get, post } from '../utils/request'

export const address = {
  // 地区列表
  getAreaList (params) {
    return get('/service/lite/admin/area/getAreaList', params)
  },
  // 地区新增修改
  updateArea (params) {
    return post('/service/lite/admin/area/updateArea', params)
  }
}

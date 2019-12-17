import { get, post } from '../utils/request'

export const banner = {
  // 删除广告
  delBanner (params) {
    return post('/service/lite/admin/banner/delBanner', params)
  },
  // 广告列表
  getBannerList (params) {
    return get('/service/lite/admin/banner/getBannerList', params)
  },
  // 广告详情
  getBanner (params) {
    return get('/service/lite/admin/banner/getBanner', params)
  },
  // 添加修改广告
  updateBanner (params) {
    return post('/service/lite/admin/banner/updateBanner', params)
  }
}

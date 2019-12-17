import { get, post } from '../utils/request'

export const home = {
  // 修改密码
  resMyPassWord (params) {
    return post('/service/lite/admin/index/resMyPassWord', params)
  },
  // 我的信息
  getMyUserInfo (params) {
    return get('/service/lite/admin/index/getMyUserInfo', params)
  },
  // 获取用户授权的菜单
  getMyMenu (params) {
    return get('/service/lite/admin/index/getMyMenu', params)
  }
}

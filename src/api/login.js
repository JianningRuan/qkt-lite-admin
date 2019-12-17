import { get, post } from '../utils/request'

export const login = {
  login (account, password) {
    const params = {
      account,
      password,
      clientId: 'background',
      secret: 'qkt'
    }
    return post('/security/bg', params)
  },
  // 我的信息
  getMyUserInfo (params) {
    return get('/service/lite/admin/index/getMyUserInfo', params)
  },
  // 退出登录
  logout (params) {
    return get('/security/logout', params)
  }
}

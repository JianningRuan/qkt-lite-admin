import { get, post } from '../utils/request'

export const account = {
  // 能添加区域列表
  getAllAreaList (params) {
    return get('/service/lite/admin/bguser/getAllAreaList', params)
  },
  // 能添加学校列表
  getAllSchoolList (params) {
    return get('/service/lite/admin/bguser/getAllSchoolList', params)
  },
  // 能添加角色列表
  getAllRoleList (params) {
    return get('/service/lite/admin/bguser/getAllRoleList', params)
  },
  // 账号列表
  getBgUserList (params) {
    return get('/service/lite/admin/bguser/getBgUserList', params)
  },
  // 账号删除
  delBgUser (params) {
    return post('/service/lite/admin/bguser/delBgUser', params)
  },
  // 账号启用停用
  resOpen (params) {
    return post('/service/lite/admin/bguser/resOpen', params)
  },
  // 账号所授权的区域
  getAreaByUser (params) {
    return get('/service/lite/admin/bguser/getAreaByUser', params)
  },
  // 账号所授权的学校
  getSchoolByUser (params) {
    return get('/service/lite/admin/bguser/getSchoolByUser', params)
  },
  // 账号所授权的角色
  getRoleByUser (params) {
    return get('/service/lite/admin/bguser/getRoleByUser', params)
  },
  // 账号新增修改
  updateBgUser (params) {
    return post('/service/lite/admin/bguser/updateBgUser', params)
  },
  // 账号添加删除区域
  resUserArea (params) {
    return post('/service/lite/admin/bguser/resUserArea', params)
  },
  // 账号添加删除学校
  resUserSchool (params) {
    return post('/service/lite/admin/bguser/resUserSchool', params)
  },
  // 账号添加删除角色
  resUserRole (params) {
    return post('/service/lite/admin/bguser/resUserRole', params)
  },
  // 账号详情
  getBgUserDetail (params) {
    return get('/service/lite/admin/bguser/getBgUserDetail', params)
  },
  // 重置密码
  resPassword (params) {
    return post('/service/lite/admin/bguser/resPassword', params)
  }
}

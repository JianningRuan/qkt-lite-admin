import { get, post } from '../utils/request'

export const role = {
  // 操作列表
  getAllPermissionList (params) {
    return get('/service/lite/admin/bgrole/getAllPermissionList', params)
  },
  // 角色列表
  getBgRoleList (params) {
    return get('/service/lite/admin/bgrole/getBgRoleList', params)
  },
  // 角色删除
  delBgRole (params) {
    return post('/service/lite/admin/bgrole/delBgRole', params)
  },
  // 角色所授权的操作列表
  getPermissionListByRole (params) {
    return get('/service/lite/admin/bgrole/getPermissionListByRole', params)
  },
  // 角色新增修改
  updateBgRole (params) {
    return post('/service/lite/admin/bgrole/updateBgRole', params)
  },
  // 角色树列表
  geAllBgRoleTree (params) {
    return get('/service/lite/admin/bgrole/geAllBgRoleTree', params)
  },
  // 角色添加删除操作
  resPermissionByRole (params) {
    return post('/service/lite/admin/bgrole/resPermissionByRole', params)
  },
  // 角色详情
  getBgRoleDetail (params) {
    return get('/service/lite/admin/bgrole/getBgRoleDetail', params)
  }
}

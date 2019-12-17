import { get, post } from '../utils/request'

export const menu = {
  // 关联操作列表
  getPermissionListByMenu (params) {
    return get('/service/lite/admin/menu/getPermissionListByMenu', params)
  },
  // 操作删除
  delPermission (params) {
    return post('/service/lite/admin/menu/delPermission', params)
  },
  // 操作新增修改
  updatePermission (params) {
    return post('/service/lite/admin/menu/updatePermission', params)
  },
  // 操作详情
  getPermissionDetail (params) {
    return get('/service/lite/admin/menu/getPermissionDetail', params)
  },
  // 菜单列表
  getMenuList (params) {
    return get('/service/lite/admin/menu/getMenuList', params)
  },
  // 菜单删除
  delMenu (params) {
    return post('/service/lite/admin/menu/delMenu', params)
  },
  // 菜单新增修改
  updateMenu (params) {
    return post('/service/lite/admin/menu/updateMenu', params)
  },
  // 菜单树列表
  getAllMenuTree (params) {
    return get('/service/lite/admin/menu/getAllMenuTree', params)
  },
  // 菜单详情
  getMenuDetail (params) {
    return get('/service/lite/admin/menu/getMenuDetail', params)
  }
}

import { get, post } from '../utils/request'

export const common = {
  // 年级列表
  getGrade (params) {
    return get('/service/lite/admin/common/getGrade', params)
  },
  // 根据地区获取学校
  getSchoolByArea (params) {
    return get('/service/lite/admin/common/getSchoolByArea', params)
  },
  // 根据学校获取班级
  getClassBySchool (params) {
    return get('/service/lite/admin/common/getClassBySchool', params)
  },
  // 获取地区
  getAreaList (params) {
    return get('/service/lite/admin/common/getCommonAreaList', params)
  },
  // 检查手机号码是否重复
  checkMobile (params) {
    return get('/service/lite/admin/common/checkMobile', params)
  },
  // 查询菜单页按钮权限
  getPermission (params) {
    return get('/service/lite/admin/permission/getPermission', params)
  },
  // 检查轮询状态
  checkStatisticStructure (params) {
    return post('/service/lite/admin/common/checkStatisticStructure', params)
  },

  qcloud (params) {
    return get('/service/lite/qcloud/getQCloudInfo', params)
  },
  qcloudAuth (params) {
    return get('/service/lite/qcloud/getCredential', params)
  }
}

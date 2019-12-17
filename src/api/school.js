import { get, post } from '../utils/request'

export const school = {
  // 学校列表
  getSchoolList (params) {
    return get('/service/lite/admin/school/getSchoolList', params)
  },
  // 学校删除
  delSchool (params) {
    return post('/service/lite/admin/school/delSchool', params)
  },
  // 学校新增修改
  updateSchool (params) {
    return post('/service/lite/admin/school/updateSchool', params)
  },
  // 学校详情
  getSchoolDetail (params) {
    return get('/service/lite/admin/school/getSchoolDetail', params)
  },
  // 班级列表
  getClassList (params) {
    return get('/service/lite/admin/school/getClassList', params)
  },
  // 班级删除
  delClass (params) {
    return post('/service/lite/admin/school/delClass', params)
  },
  // 班级新增
  addClass (params) {
    return post('/service/lite/admin/school/addClass', params)
  }
}

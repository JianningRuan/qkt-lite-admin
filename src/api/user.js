import { get, post, postFile } from '../utils/request'

export const user = {
  // 校讯通学生用户匹配
  importStudentExcel (params) {
    return postFile('/service/lite/admin/user/importStudentExcel', params)
  },
  // 校讯通教师用户匹配
  importTeacherExcel (params) {
    return postFile('/service/lite/admin/user/importTeacherExcel', params)
  },
  // 学生列表
  getStudentList (params) {
    return get('/service/lite/admin/user/getStudentList', params)
  },
  // 学生删除
  delStudent (params) {
    return post('/service/lite/admin/user/delStudent', params)
  },
  // 学生新增修改
  updateStudent (params) {
    return post('/service/lite/admin/user/updateStudent', params)
  },
  // 学生详情
  getStudentDetail (params) {
    return get('/service/lite/admin/user/getStudentDetail', params)
  },
  // 家长列表
  getParentList (params) {
    return get('/service/lite/admin/user/getParentList', params)
  },
  // 家长删除
  delParent (params) {
    return post('/service/lite/admin/user/delParent', params)
  },
  // 家长删除学生
  delParentStudent (params) {
    return post('/service/lite/admin/user/delParentStudent', params)
  },
  // 家长学生关联列表
  getParentStudentList (params) {
    return get('/service/lite/admin/user/getParentStudentList', params)
  },
  // 家长详情
  getParentDetail (params) {
    return get('/service/lite/admin/user/getParentDetail', params)
  },
  // 家长新增修改
  updateParent (params) {
    return post('/service/lite/admin/user/updateParent', params)
  },
  // 家长查找绑定学生
  getStudentByMobileAndParentId (params) {
    return get('/service/lite/admin/user/getStudentByMobileAndParentId', params)
  },
  // 家长新增学生
  addParentStudent (params) {
    return post('/service/lite/admin/user/addParentStudent', params)
  },
  // 教师列表
  getTeacherList (params) {
    return get('/service/lite/admin/user/getTeacherList', params)
  },
  // 教师删除
  delTeacher (params) {
    return post('/service/lite/admin/user/delTeacher', params)
  },
  // 教师删除带班
  delTeacherClass (params) {
    return post('/service/lite/admin/user/delTeacherClass', params)
  },
  // 教师新增修改
  updateTeacher (params) {
    return post('/service/lite/admin/user/updateTeacher', params)
  },
  // 教师新增带班
  addTeacherClass (params) {
    return post('/service/lite/admin/user/addTeacherClass', params)
  },
  // 教师班级关联列表
  getTeacherClassList (params) {
    return get('/service/lite/admin/user/getTeacherClassList', params)
  },
  // 教师能带的班级
  getClassByTeacher (params) {
    return get('/service/lite/admin/user/getClassByTeacher', params)
  },
  // 教师详情
  getTeacherDetail (params) {
    return get('/service/lite/admin/user/getTeacherDetail', params)
  },
  // 校讯通导入是否结束
  checkState (params) {
    return post('/service/lite/admin/user/checkState', params)
  }
}

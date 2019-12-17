import { get, post } from '../utils/request'

export const course = {
  // 获取所有推荐位置
  getRecommendPlatform (params) {
    return get('/service/lite/admin/platform/getRecommendPlatform', params)
  },
  // 获取视频信息
  getVideo (params) {
    return get('/service/lite/admin/video/getVideo', params)
  },
  // 获取视频列表
  getVideoByCourse (params) {
    return get('/service/lite/admin/video/getVideoByCourse', params)
  },
  // 视频列表
  videoList (params) {
    return get('/service/lite/admin/video/videoList', params)
  },
  // 视频删除
  delVideo (params) {
    return post('/service/lite/admin/video/delVideo', params)
  },
  // 视频新增修改
  updateVideo (params) {
    return post('/service/lite/admin/video/updateVideo', params)
  },
  // 获取课时推荐记录
  getLessonRecommend (params) {
    return get('/service/lite/admin/platform/getLessonRecommend', params)
  },
  // 课时列表
  getLessonList (params) {
    return get('/service/lite/admin/lesson/getLessonList', params)
  },
  // 课时删除
  delLesson (params) {
    return post('/service/lite/admin/lesson/delLesson', params)
  },
  // 课时推荐
  lessonRecommend (params) {
    return post('/service/lite/admin/platform/lessonRecommend', params)
  },
  // 课时新增
  updateLesson (params) {
    return post('/service/lite/admin/lesson/updateLesson', params)
  },
  // 获取课程信息
  getCourse (params) {
    return get('/service/lite/admin/course/getCourse', params)
  },
  // 获取课程推荐记录
  getCourseRecommend (params) {
    return get('/service/lite/admin/platform/getCourseRecommend', params)
  },
  // 获取课程标签
  getCourseLabel (params) {
    return get('/service/lite/admin/course/getCourseLabel', params)
  },
  // 课程列表
  courseList (params) {
    return get('/service/lite/admin/course/courseList', params)
  },
  // 课程删除
  delCourse (params) {
    return post('/service/lite/admin/course/delCourse', params)
  },
  // 课程删除标签
  delLabel (params) {
    return post('/service/lite/admin/course/delLabel', params)
  },
  // 课程推荐
  courseRecommend (params) {
    return post('/service/lite/admin/platform/courseRecommend', params)
  },
  // 课程新增修改
  updateCourse (params) {
    return post('/service/lite/admin/course/updateCourse', params)
  },
  // 课程新增修改标签
  updateLabelByCourse (params) {
    return post('/service/lite/admin/course/updateLabelByCourse', params)
  }
}

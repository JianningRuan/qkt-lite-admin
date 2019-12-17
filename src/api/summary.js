import { get, post } from '../utils/request'

export const summary = {
  // 评论列表
  summaryList (params) {
    return get('/service/lite/admin/summary/summaryList', params)
  },
  // 评论删除
  delSummary (params) {
    return post('/service/lite/admin/summary/delSummary', params)
  },
  // 评论审核
  setSummaryCheck (params) {
    return post('/service/lite/admin/summary/setSummaryCheck', params)
  }
}

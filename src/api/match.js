import { get, post, getDown, postDown } from '../utils/request'

export const match = {
  // 场次列表
  getLevelList (params) {
    return get('/service/lite/admin/math/match/getLevelList', params)
  },
  // 场次删除
  delLevel (params) {
    return post('/service/lite/admin/math/match/delLevel', params)
  },
  // 场次新增修改
  updateLevel (params) {
    return post('/service/lite/admin/math/match/updateLevel', params)
  },
  // 场次详情
  getLevelDetail (params) {
    return get('/service/lite/admin/math/match/getLevelDetail', params)
  },
  // 大赛下拉
  getAllMatch (params) {
    return get('/service/lite/admin/math/match/getAllMatch', params)
  },
  // 大赛列表
  getMatchList (params) {
    return get('/service/lite/admin/math/match/getMatchList', params)
  },
  // 大赛删除
  delMatch (params) {
    return post('/service/lite/admin/math/match/delMatch', params)
  },
  // 大赛发布
  resDeploy (params) {
    return post('/service/lite/admin/math/match/resDeploy', params)
  },
  // 大赛新增修改
  updateMatch (params) {
    return post('/service/lite/admin/math/match/updateMatch', params)
  },
  // 大赛详情
  getMatchDetail (params) {
    return get('/service/lite/admin/math/match/getMatchDetail', params)
  },
  // 统计-大赛数据汇总
  getMatchCountStatisticList (params) {
    return get('/service/lite/admin/math/match/getMatchCountStatisticList', params)
  },
  // 统计-导出参赛明细excel
  exportMatchUserStatisticExcel (params) {
    return postDown('/service/lite/admin/math/match/exportMatchUserStatisticExcel', params)
  },
  // 计-导出大赛数据excel
  exportMatchCountStatisticExcel (params) {
    return postDown('/service/lite/admin/math/match/exportMatchCountStatisticExcel', params)
  },
  // 统计-导出活跃数据excel
  exportMatchActiveStatisticExcel (params) {
    return postDown('/service/lite/admin/math/match/exportMatchActiveStatisticExcel', params)
  },
  // 统计-活跃数据统计
  getMatchActiveStatisticList (params) {
    return get('/service/lite/admin/math/match/getMatchActiveStatisticList', params)
  },
  // 统计-用户参赛明细
  getMatchUserStatisticList (params) {
    return get('/service/lite/admin/math/match/getMatchUserStatisticList', params)
  },
  // 统计-请求导出参赛明细
  structureMatchUserStatistic (params) {
    return post('/service/lite/admin/math/match/structureMatchUserStatistic', params)
  },
  // 统计-请求导出大赛数据
  structureMatchCountStatistic (params) {
    return post('/service/lite/admin/math/match/structureMatchCountStatistic', params)
  },
  // 统计-请求导出活跃数据
  structureMatchActiveStatistic (params) {
    return post('/service/lite/admin/math/match/structureMatchActiveStatistic', params)
  },
  // 赛区列表
  getZoneList (params) {
    return get('/service/lite/admin/math/match/getZoneList', params)
  },
  // 赛区删除
  delZone (params) {
    return post('/service/lite/admin/math/match/delZone', params)
  },
  // 赛区删除区域
  delZoneArea (params) {
    return post('/service/lite/admin/math/match/delZoneArea', params)
  },
  // 赛区删除奖项
  delZonePrize (params) {
    return post('/service/lite/admin/math/match/delZonePrize', params)
  },
  // 赛区删除学校
  delZoneSchool (params) {
    return post('/service/lite/admin/math/match/delZoneSchool', params)
  },
  // 赛区删除题目
  delZoneQuestion (params) {
    return post('/service/lite/admin/math/match/delZoneQuestion', params)
  },
  // 赛区新增修改
  updateZone (params) {
    return post('/service/lite/admin/math/match/updateZone', params)
  },
  // 赛区添加修改奖项
  updatePrize (params) {
    return post('/service/lite/admin/math/match/updatePrize', params)
  },
  // 赛区添加修改题目
  updateQuestion (params) {
    return post('/service/lite/admin/math/match/updateQuestion', params)
  },
  // 赛区添加区域
  addZoneArea (params) {
    return post('/service/lite/admin/math/match/addZoneArea', params)
  },
  // 赛区的区域
  getZoneAreaList (params) {
    return get('/service/lite/admin/math/match/getZoneAreaList', params)
  },
  // 赛区的奖项
  getZonPrizeList (params) {
    return get('/service/lite/admin/math/match/getZonPrizeList', params)
  },
  // 赛区的题目
  getZonQuestionList (params) {
    return get('/service/lite/admin/math/match/getZonQuestionList', params)
  },
  // 赛区详情
  getZoneDetail (params) {
    return get('/service/lite/admin/math/match/getZoneDetail', params)
  },
  // 赛区删除年级组
  delZoneGroup (params) {
    return post('/service/lite/admin/math/match/delZoneGroup', params)
  },
  // 赛区添加年级组
  updateGroup (params) {
    return post('/service/lite/admin/math/match/updateGroup', params)
  },
  // 赛区的年级组
  getZoneGroupList (params) {
    return get('/service/lite/admin/math/match/getZoneGroupList', params)
  }
}

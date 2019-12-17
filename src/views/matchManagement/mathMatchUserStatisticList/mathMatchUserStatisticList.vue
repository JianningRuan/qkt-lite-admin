<template>
  <div v-loading="fullScreenLoading" class="app-container">
    <el-card shadow="never" class="mb-20">
      <el-form ref="form" :inline="false" :model="matchParams" :rules="rules" label-width="120px" size="mini">
        <el-form-item label="大赛" prop="matchId">
          <el-select v-model="matchParams.matchId" placeholder="请选择大赛" @change="changeMatch">
            <el-option v-for="item in mathList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="场次" prop="levelId">
          <el-select v-model="matchParams.levelId" placeholder="请选择场次" @change="changeLevel">
            <el-option v-for="item in levelList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="赛区" prop="zoneId">
          <el-select v-model="matchParams.zoneId" placeholder="请选择赛区" @change="changeZone">
            <el-option v-for="item in zoneList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <el-button type="text" style="padding-bottom: 0; padding-top: 0;" @click="showOrHideForm">
            {{ showMore ? '收起' : '展开' }}<i :class="showMore ? 'el-icon-arrow-up' : 'el-icon-arrow-down'" />
          </el-button>
        </el-form-item>
      </el-form>
      <el-form v-show="showMore" ref="moreForm" :inline="false" :model="matchParams" :rules="rules" label-width="120px" size="mini">
        <el-form-item label="奖项">
          <el-select v-model="matchParams.prizeId" clearable placeholder="请选择奖项">
            <el-option v-for="item in prizeList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="地区">
          <el-select v-model="matchParams.provinceId" clearable placeholder="请选择省" @change="changeProvince">
            <el-option v-for="item in provinceList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <el-select v-model="matchParams.cityId" clearable placeholder="请选择市" @change="changeCity">
            <el-option v-for="item in cityList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <el-select v-model="matchParams.townId" clearable placeholder="请选择镇区" @change="changeTown">
            <el-option v-for="item in townList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="学校">
          <el-select v-model="matchParams.schoolId" clearable placeholder="请选择学校" @change="changeSchool">
            <el-option v-for="item in schoolList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="年级">
          <el-select v-model="matchParams.grade" clearable placeholder="请选择年级" @change="changeGrade">
            <el-option v-for="item in gradeList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="班级">
          <el-select v-model="matchParams.classId" clearable placeholder="请选择班级">
            <el-option v-for="item in classList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="是否晋级/获奖">
          <el-select v-model="matchParams.result" clearable placeholder="请选择是否晋级/获奖">
            <el-option v-for="item in resultList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
      </el-form>
      <el-form :inline="false" label-width="120px" size="mini">
        <el-form-item>
          <el-button type="primary" @click="onSearch">
            搜索
          </el-button>
          <el-button type="info" @click="onReset">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <div slot="header" class="flex flex-pack-justify flex-align-center">
        <span class="flex1">大赛用户参赛明细</span>
        <el-button type="primary" size="mini" :disabled="opaList.indexOf('exp') === -1 ? true : false" @click="uploadExcel">
          导出
        </el-button>
      </div>
      <el-table stripe :data="list" tooltip-effect="dark" style="width: 100%">
        <el-table-column label="大赛" prop="matchTitle" width="250" />
        <el-table-column label="场次" prop="levelName" width="100" />
        <el-table-column label="赛区" prop="zoneName" width="120" />
        <el-table-column label="姓名" prop="userName" width="100" />
        <el-table-column label="手机号码" prop="mobile" width="120" />
        <el-table-column label="省份" prop="province" width="100" />
        <el-table-column label="城市" prop="city" width="100" />
        <el-table-column label="镇区" prop="town" width="100" />
        <el-table-column label="学校" prop="schoolName" width="150" />
        <el-table-column label="年级" prop="grade" width="100">
          <template slot-scope="scope">
            {{ scope.row.grade | returnGradeName }}
          </template>
        </el-table-column>
        <el-table-column label="班级" prop="className" width="100" />
        <el-table-column label="得分" prop="score" width="100" />
        <el-table-column label="时长(秒)" prop="duration" width="100" />
        <el-table-column label="次数" prop="challengeCount" width="100" />
        <el-table-column label="是否晋级/获奖" width="100">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.result === true" type="success">
              是
            </el-tag>
            <el-tag v-else-if="scope.row.result === false" type="info">
              否
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="奖项" prop="prizeName" width="100" />
        <el-table-column label="当前排名" prop="ranking" align="center" width="100" />
      </el-table>

      <pagination v-show="matchParams.total > 0" :total="matchParams.total" :page.sync="matchParams.offSet" :limit.sync="matchParams.offSize" @pagination="getMatchUserStatisticList" />
    </el-card>

    <el-dialog
      title="温馨提示"
      :visible.sync="dialogVisible"
      width="30%"
      :before-close="handleClose"
    >
      <div v-loading="excelLoading" element-loading-text="正在导出， 请耐心等候..." style="height: 160px;" />
    </el-dialog>
  </div>
</template>

<script>
import { common } from '../../../utils'
import Pagination from '@/components/Pagination' // 分页
import { opaMixin } from '../../../utils/mixins'
export default {
  name: 'MathMatchUserStatisticList',
  components: { Pagination },
  filters: {
    returnGradeName (val) {
      if (val) {
        const grade = common.gradeList[val - 1]
        return grade.label
      } else {
        return ''
      }
    }
  },
  mixins: [opaMixin],
  data () {
    return {
      fullScreenLoading: false,
      showMore: false,
      matchParams: {
        matchId: '',
        levelId: '',
        zoneId: '',
        provinceId: '',
        cityId: '',
        townId: '',
        areaId: '',
        schoolId: '',
        grade: '',
        classId: '',
        prizeId: '',
        result: '',
        offSet: 0,
        offSize: 10,
        total: 0
      },
      rules: {
        matchId: [
          { required: true, message: '大赛不能为空', trigger: 'change' }
        ],
        levelId: [
          { required: true, message: '场次不能为空', trigger: 'change' }
        ],
        zoneId: [
          { required: true, message: '赛区不能为空', trigger: 'change' }
        ]
      },
      list: [],
      mathList: [],
      levelList: [], // 场次
      zoneList: [],
      provinceList: [],
      cityList: [],
      townList: [],
      schoolList: [],
      gradeList: common.gradeList,
      classList: [],
      prizeList: [],
      resultList: [{ label: '所有状态', value: '' }, { label: '是', value: true }, { label: '否', value: false }],
      excelTime: '', // 循环导入时监听返回的setInterval
      excelTimeNum: 0, // 计算循环的累计时间
      dialogVisible: false,
      excelLoading: false
    }
  },
  computed: {},
  watch: {},
  created () {
  },
  async mounted () {
    await this.getOpaList()
    this.fullScreenLoading = false
    this.$nextTick(() => {
      this.getAllMatch()
      this.getZoneList()
    })
  },
  activated () {
  },
  destroyed () {
  },
  methods: {
    showOrHideForm () {
      const showMore = this.showMore
      this.showMore = !showMore
    },
    // 获取
    getMatchUserStatisticList () {
      if (this.opaList.indexOf('list') === -1) {
        return
      }
      this.fullScreenLoading = true
      this.$nextTick(() => {
        const matchParams = Object.assign({}, this.matchParams)
        matchParams.offSet--
        this.$api.match.getMatchUserStatisticList(matchParams).then((res) => {
          if (res.rcode === 300) {
            this.matchParams.total = res.data.totalPages
            this.list = res.data.userList
          }
          this.fullScreenLoading = false
        }).catch((err) => {

        })
      })
    },
    // 获取大赛列表
    getAllMatch () {
      this.$api.match.getAllMatch().then((res) => {
        if (res.rcode === 300) {
          const mathList = res.data.mathList
          mathList.forEach((item) => {
            item.value = item.id
            item.label = item.title
          })
          this.mathList = mathList
        }
      })
    },
    // 查询场次
    changeMatch (value) {
      this.clearMatchList(2)
      this.$nextTick(() => {
        this.$refs['form'].clearValidate()
      })
      const params = {
        matchId: value
      }
      this.$api.match.getLevelList(params).then((res) => {
        if (res.rcode === 300) {
          const levelList = res.data.levelList
          levelList.forEach((item) => {
            item.value = item.id
            item.label = item.name
          })
          this.levelList = levelList
        }
      })
    },
    // 查询赛区
    changeLevel (value) {
      this.clearMatchList(3)
      this.$nextTick(() => {
        this.$refs['form'].clearValidate()
      })
      const params = {
        levelId: value
      }
      this.$api.match.getZoneList(params).then((res) => {
        if (res.rcode === 300) {
          const zoneList = res.data.zoneList
          zoneList.forEach((item) => {
            item.value = item.id
            item.label = item.name
          })
          this.zoneList = zoneList
        }
      })
    },
    changeZone (val) {
      this.clearMatchList(4)
      this.$nextTick(() => {
        this.$refs['form'].clearValidate()
      })
      const params = {
        zoneId: val
      }
      this.$api.match.getZonPrizeList(params).then((res) => {
        if (res.rcode === 300) {
          const prizeList = res.data.prizeList
          prizeList.forEach((item) => {
            item.value = item.id
            item.label = item.name
          })
          this.prizeList = prizeList
        }
      })
    },
    clearMatchList (listNum) {
      for (let i = 1, l = 5; i < l; i++) {
        if (i === 1 && i >= listNum) {
          this.matchParams.matchId = ''
        }
        if (i === 2 && i >= listNum) {
          this.matchParams.levelId = ''
          this.levelList = []
        }
        if (i === 3 && i >= listNum) {
          this.matchParams.zoneId = ''
          this.zoneList = []
        }
        if (i === 4 && i >= listNum) {
          this.matchParams.prizeId = ''
          this.prizeList = []
        }
      }
    },
    // 获取省市镇
    async getZoneList (areaType = 1, parentId = 0) { // table = 0 表示 是上方搜索框用 table = 1 表示弹出框用
      const params = {
        areaType,
        parentId,
        type: 1
      }
      const res = await this.$api.common.getAreaList(params)
      if (res.rcode === 300) {
        const areaList = res.data.areaList
        areaList.forEach((item) => {
          item.value = item.id
          item.label = item.name
        })
        if (areaType === 1) {
          const areaTempList = areaList.concat()
          // areaTempList.splice(0, 1);
          this.provinceList = areaTempList
        } else if (areaType === 2) {
          this.cityList = areaList
        } else {
          this.townList = areaList
        }
      }
    },
    // 清空地区选项
    clearZoneList (listNum) {
      for (let i = 1, l = 7; i < l; i++) {
        if (i === 1 && i >= listNum) {
          this.matchParams.provinceId = ''
        }
        if (i === 2 && i >= listNum) {
          this.matchParams.cityId = ''
          this.cityList = []
        }
        if (i === 3 && i >= listNum) {
          this.matchParams.townId = ''
          this.townList = []
        }
        if (i === 4 && i >= listNum) {
          this.matchParams.schoolId = ''
          this.schoolList = []
        }
        if (i === 5 && i >= listNum) {
          this.matchParams.grade = ''
        }
        if (i === 6 && i >= listNum) {
          this.matchParams.classId = ''
          this.classList = []
        }
      }
    },
    // 选择省份后
    changeProvince (value) {
      if (value === '') {
        this.matchParams.areaId = ''
        this.clearZoneList(2)
        this.schoolList = []
      } else {
        this.matchParams.areaId = value
        this.clearZoneList(2)
        this.getZoneList(2, this.matchParams.provinceId)
        if (value !== 0) {
          this.getSchool(this.matchParams.provinceId)
        }
      }
    },
    // 选择城市后
    changeCity (value) {
      if (value === '' || value === 0) {
        this.clearZoneList(3)
        if (value === 0) {
          this.getZoneList(3, this.matchParams.cityId)
        }
        if (this.matchParams.provinceId !== '' && this.matchParams.provinceId !== 0) {
          this.matchParams.areaId = this.matchParams.provinceId
          this.getSchool(this.matchParams.provinceId)
        }
      } else {
        this.matchParams.areaId = value
        this.clearZoneList(3)
        this.getZoneList(3, this.matchParams.cityId)
        this.getSchool(this.matchParams.cityId)
      }
    },
    // 选择镇区后
    changeTown (value) {
      if (value === '' || value === 0) {
        this.clearZoneList(4)
        if (this.matchParams.cityId !== '' && this.matchParams.cityId !== 0) {
          this.matchParams.areaId = this.matchParams.cityId
          this.getSchool(this.matchParams.cityId)
          return
        }
        if (this.matchParams.provinceId !== '' && this.matchParams.provinceId !== 0) {
          this.matchParams.areaId = this.matchParams.provinceId
          this.getSchool(this.matchParams.provinceId)
        }
      } else {
        this.matchParams.areaId = value
        this.clearZoneList(4)
        this.getSchool(this.matchParams.townId)
      }
    },
    // 获取学校
    async getSchool (areaId) {
      const params = {
        areaId: areaId
      }
      const res = await this.$api.common.getSchoolByArea(params)
      if (res.rcode === 300) {
        const schoolList = res.data.schoolList
        schoolList.forEach((item) => {
          item.value = item.id
          item.label = item.name
        })
        this.schoolList = schoolList
      }
    },
    // 选择学校后
    changeSchool () {
      this.clearZoneList(5)
    },
    changeGrade (value) {
      if (this.matchParams.schoolId !== '') {
        this.getClassList()
      }
    },
    // 获取班级列表
    async getClassList () {
      const params = {
        grade: this.matchParams.grade,
        schoolId: this.matchParams.schoolId
      }
      const res = await this.$api.common.getClassBySchool(params)
      if (res.rcode === 300) {
        const classNameList = res.data.classList
        classNameList.forEach((item) => {
          item.value = item.id
          item.label = item.name
        })
        this.classList = classNameList
      }
    },
    onSearch () {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.matchParams.offSet = 1
          this.getMatchUserStatisticList()
        }
      })
    },
    onReset () {
      this.matchParams = {
        matchId: '',
        levelId: '',
        zoneId: '',
        provinceId: '',
        cityId: '',
        townId: '',
        areaId: '',
        schoolId: '',
        grade: '',
        classId: '',
        prizeId: '',
        result: '',
        offSet: 0,
        offSize: 10,
        total: 0
      }
      this.list = []
      this.levelList = [] // 场次
      this.zoneList = []
      this.cityList = []
      this.townList = []
      this.schoolList = []
      this.classList = []
      this.prizeList = []
    },
    // 导出
    uploadExcel () {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.dialogVisible = true
          this.excelLoading = true
          const matchParams = Object.assign({}, this.matchParams)
          this.$api.match.structureMatchUserStatistic(matchParams).then((res) => {
            if (res.rcode === 300) {
              const key = res.data.key
              this.excelTime = setInterval(() => {
                this.excelTimeNum += 4000
                if (this.excelTimeNum >= 3600000) {
                  clearInterval(this.excelTime)
                  this.excelTimeNum = 0
                  // 弹窗提示超时
                  const message = `导出超时，请重试`
                  this.$alert(message, '提示', {
                    callback: action => {
                      this.handleClose()
                    }
                  })
                  return false
                }

                const params = {
                  key: key
                }
                this.$api.common.checkStatisticStructure(params).then((result) => {
                  if (result.rcode === 300) {
                    if (result.data.model === null) {
                      return
                    }
                    const status = result.data.model.result
                    const finish = result.data.model.finish
                    if (status && finish) {
                      this.handleClose()
                      // clearInterval(this.excelTime);
                      this.$api.match.exportMatchUserStatisticExcel(params).then((exportRes) => {
                        const fileDownload = require('js-file-download')
                        let fileName = exportRes.headers['content-disposition'].match(/\%(\S*)xls/)[0]
                        fileName = decodeURI(fileName)
                        fileDownload(exportRes.data, fileName)
                        // let blob = new Blob([exportRes], {type: "application/vnd.ms-excel"});
                        // let blob = new Blob([exportRes], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8'});
                        // let url = window.URL.createObjectURL(blob);
                        // window.location.href = url;
                      })
                    } else if (!status && finish) {
                      this.handleClose()
                      this.$message.error(result.data.model.errorMsg)
                    }
                  } else {
                    this.handleClose()
                  }
                }).catch((err) => {
                  this.handleClose()
                })
              }, 2000)
            } else {
              this.handleClose()
            }
          }).catch((err) => {
            this.handleClose()
          })
        }
      })
    },
    handleClose () {
      this.excelLoading = false
      this.dialogVisible = false
      clearInterval(this.excelTime)
      this.excelTimeNum = 0
    }
  }
}
</script>

<style scoped>

</style>

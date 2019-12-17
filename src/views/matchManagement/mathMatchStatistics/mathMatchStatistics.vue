<template>
  <div v-loading="fullScreenLoading" class="app-container">
    <el-card shadow="never" class="mb-20">
      <el-form ref="form" :inline="false" :model="matchParams" :rules="rules" label-width="80px" size="mini">
        <el-form-item label="大赛" prop="matchId">
          <el-select v-model="matchParams.matchId" placeholder="请选择大赛" @change="changeLevel">
            <el-option v-for="item in mathList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="场次" prop="levelId">
          <el-select v-model="matchParams.levelId" placeholder="请选择场次" @change="changeZone">
            <el-option v-for="item in levelList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="赛区" prop="zoneId">
          <el-select v-model="matchParams.zoneId" placeholder="请选择赛区">
            <el-option v-for="item in zoneList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <el-button type="text" style="padding-bottom: 0; padding-top: 0;" @click="showOrHideForm">
            {{ showMore ? '收起' : '展开' }}<i :class="showMore ? 'el-icon-arrow-up' : 'el-icon-arrow-down'" />
          </el-button>
        </el-form-item>
      </el-form>
      <el-form v-show="showMore" ref="moreForm" :inline="false" :model="matchParams" :rules="rules" label-width="80px" size="mini">
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
          <el-select v-model="matchParams.schoolId" clearable placeholder="请选择学校">
            <el-option v-for="item in schoolList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
      </el-form>
      <el-form label-width="80px" size="mini">
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
        <span class="flex1">大赛数据汇总</span>
        <el-button type="primary" size="mini" :disabled="opaList.indexOf('exp') === -1 ? true : false" @click="uploadExcel">
          导出
        </el-button>
      </div>
      <el-table stripe :data="dataList" tooltip-effect="dark" style="width: 100%">
        <el-table-column label="大赛" prop="matchTitle" width="250" />
        <el-table-column label="场次" prop="levelName" />
        <el-table-column label="赛区" prop="zoneName" />
        <el-table-column label="名称" prop="name" />
        <el-table-column label="参赛人数" prop="joinCount" />
        <el-table-column label="晋级/获奖人数" prop="successCount" />
      </el-table>

      <pagination v-show="matchParams.total > 0" :total="matchParams.total" :page.sync="matchParams.offSet" :limit.sync="matchParams.offSize" @pagination="getMatchCountStatisticList" />
    </el-card>

    <el-dialog
      title="温馨提示"
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      width="30%"
      :before-close="handleClose"
    >
      <div v-loading="excelLoading" element-loading-text="正在导出， 请耐心等候..." style="height: 160px;" />
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination' // 分页
import { opaMixin } from '../../../utils/mixins'
export default {
  name: 'MathMatchStatistics',
  components: { Pagination },
  filters: {},
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
      dataList: [],
      mathList: [],
      levelList: [], // 场次
      zoneList: [],
      provinceList: [],
      cityList: [],
      townList: [],
      schoolList: [],
      excelTime: '', // 循环导入时监听返回的setInterval
      excelTimeNum: 0, // 计算循环的累计时间
      excelLoading: false,
      dialogVisible: false
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
    // 获取大赛数据汇总
    getMatchCountStatisticList () {
      if (this.opaList.indexOf('list') === -1) {
        return
      }
      if (this.matchParams.zoneId === '') {
        return
      }
      this.fullScreenLoading = true
      this.$nextTick(() => {
        const matchParams = Object.assign({}, this.matchParams)
        matchParams.offSet--
        this.$api.match.getMatchCountStatisticList(matchParams).then((res) => {
          if (res.rcode === 300) {
            this.matchParams.total = res.data.totalPages
            this.dataList = res.data.list
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
    changeLevel (value) {
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
    changeZone (value) {
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
    clearMatchList (listNum) {
      for (let i = 1, l = 4; i < l; i++) {
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
      for (let i = 1, l = 5; i < l; i++) {
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
    // 搜索
    onSearch () {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.matchParams.offSet = 1
          this.getMatchCountStatisticList()
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
        offSet: 0,
        offSize: 10,
        total: 0
      }
      this.dataList = []
      this.levelList = [] // 场次
      this.zoneList = []
      this.cityList = []
      this.townList = []
      this.schoolList = []
    },
    uploadExcel () {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          const matchParams = Object.assign({}, this.matchParams)
          this.$api.match.structureMatchCountStatistic(matchParams).then((res) => {
            if (res.rcode === 300) {
              this.dialogVisible = true
              this.excelLoading = true
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
                    const status = result.data.model.result
                    const finish = result.data.model.finish
                    if (status && finish) {
                      // clearInterval(this.excelTime);
                      this.handleClose()
                      this.$api.match.exportMatchCountStatisticExcel(params).then((exportRes) => {
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
            }
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

<template>
  <div v-loading="fullScreenLoading" class="app-container">
    <el-card shadow="never" class="mb-20">
      <el-form ref="form" :inline="true" :model="matchParams" :rules="rules" label-width="80px" size="mini">
        <el-form-item label="时间区间" prop="matchTime">
          <el-date-picker
            v-model="matchParams.matchTime"
            type="daterange"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
            @change="handleChange"
          />
        </el-form-item>
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
        <span class="flex1">大赛活跃数据统计</span>
        <el-button type="primary" size="mini" :disabled="opaList.indexOf('exp') === -1 ? true : false" @click="uploadExcel">
          导出
        </el-button>
      </div>
      <el-table stripe :data="list" tooltip-effect="dark" style="width: 100%">
        <el-table-column label="时间" prop="searchTime" />
        <el-table-column label="省份" prop="province" />
        <el-table-column label="参与人数" prop="joinCount" />
        <el-table-column label="会员参与人数" prop="vipCount" />
        <el-table-column label="活跃人数" prop="activeCount" />
      </el-table>

      <pagination v-show="matchParams.total > 0" :total="matchParams.total" :page.sync="matchParams.offSet" :limit.sync="matchParams.offSize" @pagination="getMatchActiveStatisticList" />
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
import Pagination from '@/components/Pagination' // 分页
import { opaMixin } from '../../../utils/mixins'
export default {
  name: 'MathMatchCountStatisticList',
  components: { Pagination },
  filters: {},
  mixins: [opaMixin],
  data () {
    return {
      fullScreenLoading: false,
      matchParams: {
        startTime: '',
        endTime: '',
        matchTime: [],
        offSet: 0,
        offSize: 10,
        total: 0
      },
      rules: {
        matchTime: [
          { required: true, message: '大赛时间区间不能为空', trigger: 'change' }
        ]
      },
      list: [],
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
  },
  activated () {
  },
  destroyed () {
  },
  methods: {
    // 获取统计数据
    getMatchActiveStatisticList () {
      if (this.opaList.indexOf('list') === -1) {
        return
      }
      this.fullScreenLoading = true
      this.$nextTick(() => {
        const matchParams = Object.assign({}, this.matchParams)
        matchParams.offSet--
        delete matchParams.matchTime
        this.$api.match.getMatchActiveStatisticList(matchParams).then((res) => {
          if (res.rcode === 300) {
            this.matchParams.total = res.data.totalPages
            this.list = res.data.list
          }
          this.fullScreenLoading = false
        }).catch((err) => {

        })
      })
    },
    handleChange (val) {
      this.matchParams.startTime = val[0]
      this.matchParams.endTime = val[1]
    },
    // 搜索
    onSearch () {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.matchParams.offSet = 1
          this.getMatchActiveStatisticList()
        }
      })
    },
    // 重置
    onReset () {
      this.matchParams = {
        startTime: '',
        endTime: '',
        matchTime: [],
        offSet: 0,
        offSize: 10,
        total: 0
      }
      this.list = []
    },
    // 导出
    uploadExcel () {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          const matchParams = Object.assign({}, this.matchParams)
          delete matchParams.matchTime
          this.$api.match.structureMatchActiveStatistic(matchParams).then((res) => {
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
                      this.$api.match.exportMatchActiveStatisticExcel(params).then((exportRes) => {
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

<template>
  <div v-loading="fullScreenLoading" class="app-container">
    <el-card shadow="never">
      <div slot="header" class="flex flex-pack-justify flex-align-center">
        <span class="flex1">场次赛区列表</span>
        <div>
          <el-button type="primary" size="mini" :disabled="opaList.indexOf('add') === -1 ? true : false" @click="handleCreate">
            新增
          </el-button>
          <el-button type="danger" size="mini" :disabled="opaList.indexOf('delete') === -1 ? true : false" @click="batchDeletion">
            批量删除
          </el-button>
        </div>
      </div>
      <el-table ref="zoneTable" stripe :data="zoneList" tooltip-effect="dark" style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column fixed type="selection" width="55" />
        <el-table-column label="赛区名称" prop="name" />
        <el-table-column label="开始时间" prop="startTime" :formatter="beginTimeFormatter">
          >
        </el-table-column>
        <el-table-column label="结束时间" prop="endTime" :formatter="endTimeFormatter" />
        <el-table-column label="答题时长（秒）" prop="answerDuration" />
        <!--<el-table-column label="可挑战次数" prop="challengeCount"></el-table-column>-->
        <el-table-column label="评奖单位" prop="awardsType" :formatter="typeFormatter" />
        <el-table-column label="晋级/获奖人数" prop="successCount" />
        <el-table-column label="是否发送晋级短信" prop="sendMessage">
          <template slot-scope="scope">
            {{ scope.row.sendMessage ? '是' : '否' }}
          </template>
        </el-table-column>
        <el-table-column label="是否发送晋级公众号消息" prop="sendWechat">
          <template slot-scope="scope">
            {{ scope.row.sendWechat ? '是' : '否' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" align="center">
          <template slot-scope="scope">
            <el-button size="mini" :disabled="opaList.indexOf('edit') === -1 ? true : false" @click="handleEdit(scope.$index, scope.row)">
              编辑
            </el-button>
            <el-button size="mini" :disabled="opaList.indexOf('query') === -1 ? true : false" @click="handleCheckZone(scope.$index, scope.row)">
              查看详情
            </el-button>
            <el-button size="mini" type="danger" :disabled="opaList.indexOf('delete') === -1 ? true : false" @click="handleDelete(scope.$index, scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!--新增或编辑赛区弹窗-->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="800px" @close="cancelData">
      <el-form ref="zoneForm" :model="zoneTemp" :rules="zoneRules" label-position="left" label-width="180px" style="margin-left:50px; margin-right: 50px;">
        <el-form-item label="赛区名称" prop="name">
          <el-input v-model="zoneTemp.name" placeholder="赛区名称" class="filter-item input-box" maxlength="60" show-word-limit />
        </el-form-item>
        <el-form-item label="赛区描述" prop="desc">
          <el-input v-model="zoneTemp.desc" placeholder="赛区描述" class="filter-item input-box" maxlength="400" show-word-limit />
        </el-form-item>
        <el-form-item label="可挑战次数" prop="challengeCount">
          <el-input v-model="zoneTemp.challengeCount" type="number" placeholder="可挑战次数" />
        </el-form-item>
        <el-form-item label="晋级/获奖人数" prop="successCount">
          <el-input v-model="zoneTemp.successCount" type="number" placeholder="晋级/获奖人数" />
        </el-form-item>
        <el-form-item label="额外增加的挑战次数" prop="extraChallenge">
          <el-input v-model="zoneTemp.extraChallenge" type="number" placeholder="额外增加的挑战次数" />
        </el-form-item>
        <el-form-item label="参数资格说明">
          <el-input v-model="zoneTemp.qualification" placeholder="参数资格说明" type="textarea" :rows="3" maxlength="45" show-word-limit />
        </el-form-item>
        <el-form-item label="赛区比赛时间" prop="matchTime">
          <el-date-picker
            v-model="zoneTemp.matchTime"
            type="daterange"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="timestamp"
            @change="handleChange"
          />
        </el-form-item>
        <el-form-item label="答题时长（秒）" prop="answerDuration">
          <el-input v-model="zoneTemp.answerDuration" type="number" placeholder="答题时长（单位：秒）" class="time-input" />
          <div class="time-show">
            转换： {{ zoneTemp.answerDuration | timeFormat }}
          </div>
        </el-form-item>
        <el-form-item label="获奖单位" prop="awardsType">
          <el-select v-model="zoneTemp.awardsType" placeholder="请选择">
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="是否发送晋级短信">
          <el-switch v-model="zoneTemp.sendMessage" />
        </el-form-item>
        <el-form-item label="是否发送晋级公众号消息">
          <el-switch v-model="zoneTemp.sendWechat" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelData">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          确定
        </el-button>
      </div>
    </el-dialog>
    <!--新增或编辑赛区弹窗-end-->
  </div>
</template>

<script>
import { parseTime } from '../../../utils'
import moment from 'dayjs'
import { opaMixin } from '../../../utils/mixins'
export default {
  name: 'MathMatchLevelList',
  components: {},
  filters: {
    timeFormat (value) {
      const s = value % 60
      const m = parseInt((value / 60)) % 60
      const h = parseInt((value / 60 / 60)) % 60
      let formatTime = ''
      if (h !== 0) {
        formatTime = h + '小时' + m + '分钟' + s + '秒'
      } else if (m !== 0) {
        formatTime = m + '分钟' + s + '秒'
      } else {
        formatTime = s + '秒'
      }
      return formatTime
    }
  },
  mixins: [opaMixin],
  data () {
    const validatorNum = (rule, value, callback) => {
      if (value < 1) {
        callback(new Error('请填入大于0的数字'))
      } else {
        callback()
      }
    }
    return {
      id: '',
      title: '',
      fullScreenLoading: false,
      zoneList: [],
      selectArr: [],
      textMap: {
        update: '编辑',
        create: '创建'
      },
      dialogStatus: '',
      dialogFormVisible: false,
      zoneTemp: {
        id: 0,
        levelId: 0,
        name: '',
        desc: '',
        startTime: '',
        endTime: '',
        answerDuration: '',
        challengeCount: '',
        awardsType: 1,
        successCount: 0,
        matchTime: [],
        qualification: '',
        sendMessage: false,
        sendWechat: false,
        extraChallenge: 0
      },
      zoneRules: {
        name: [
          { required: true, message: '赛区名称不能为空', trigger: 'blur' }
        ],
        desc: [
          { required: true, message: '赛区描述不能为空', trigger: 'blur' }
        ],
        matchTime: [
          { required: true, message: '赛区比赛时间不能为空', trigger: 'blur' }
        ],
        answerDuration: [
          { required: true, message: '答题时长不能为空', trigger: 'blur' },
          { trigger: 'blur', validator: validatorNum }
        ],
        challengeCount: [
          { required: true, message: '可挑战次数不能为空', trigger: 'blur' },
          { trigger: 'blur', validator: validatorNum }
        ],
        awardsType: [
          { required: true, message: '获奖单位不能为空', trigger: 'change' }
        ],
        successCount: [
          { required: true, message: '晋级/获奖人数不能为空', trigger: 'blur' },
          { trigger: 'blur', validator: validatorNum }
        ]
      },
      options: [{
        value: 1,
        label: '班级'
      }, {
        value: 2,
        label: '年级'
      }, {
        value: 3,
        label: '年级组'
      }]
    }
  },
  computed: {},
  watch: {},
  created () {
    this.id = this.$route.params.id
    this.title = this.$route.params.title
  },
  async mounted () {
    await this.getOpaList()
    this.$nextTick(() => {
      this.getZoneList()
    })
  },
  activated () {
  },
  destroyed () {
  },
  methods: {
    // 获取赛区
    getZoneList () {
      if (this.opaList.indexOf('list') === -1) {
        return
      }
      const params = {
        levelId: this.id
      }
      this.$api.match.getZoneList(params).then((res) => {
        if (res.rcode === 300) {
          this.zoneList = res.data.zoneList
        }
        this.fullScreenLoading = false
      })
    },
    // 过滤开始时间
    beginTimeFormatter (row, column) {
      if (row.startTime === 0) {
        return '无开始时间'
      } else {
        return parseTime(row.startTime, '{y}-{m}-{d}')
      }
    },
    // 过滤结束时间
    endTimeFormatter (row, column) {
      if (row.endTime === 0) {
        return '无结束时间'
      } else {
        return parseTime(row.endTime, '{y}-{m}-{d}')
      }
    },
    // 过滤时长
    dayFormatter (row, index) {
      const answerDuration = row.answerDuration
      const day = answerDuration / 1000 / 60 / 60 / 24
      return day + '天'
    },
    // 过滤获奖单位类型
    typeFormatter (row, column) {
      if (row.awardsType === 1) {
        return '班级'
      } else if (row.awardsType === 2) {
        return '年级'
      } else {
        return '年级组'
      }
    },
    handleCreate () {
      /* if (this.opaList.indexOf('add') === -1) { // 权限
      return
    } */
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['zoneForm'].clearValidate()
      })
    },
    // 重置模板
    resetTemp () {
      this.zoneTemp = {
        id: 0,
        levelId: 0,
        name: '',
        desc: '',
        startTime: '',
        endTime: '',
        answerDuration: '',
        challengeCount: '',
        awardsType: 1,
        successCount: 0,
        matchTime: [],
        qualification: '',
        sendMessage: false,
        sendWechat: false,
        extraChallenge: 0
      }
    },
    // 批量删除
    batchDeletion () {
      if (this.selectArr.length === 0) {
        // 请先选择要删除的项
        this.$message({
          message: '请先选择要删除的项',
          type: 'warning'
        })
        return
      }
      this.$confirm('删除已选中的赛区，是否继续？', '提示', {
        type: 'warning'
      }).then(() => {
        const ids = []
        this.selectArr.forEach((value) => {
          ids.push(value.id)
        })
        this.delZone(ids).then((res) => {
          if (res.rcode === 300) {
            this.getZoneList()
            this.selectArr = []
          } else {
            // 错误提示
            this.$message.error(res.message)
          }
        })
      })
    },
    // 赛区删除
    async delZone (ids) {
      const params = {
        ids
      }
      return await this.$api.match.delZone(params)
    },
    // 勾选
    handleSelectionChange (val) {
      this.selectArr = val
    },
    // 编辑
    async handleEdit (index, row) {
      const params = {
        id: row.id
      }
      const res = await this.$api.match.getZoneDetail(params)
      if (res.rcode === 300) {
        const data = res.data
        data.matchTime = [data.startTime, data.endTime]
        this.zoneTemp.levelId = this.id
        this.zoneTemp = Object.assign({}, this.zoneTemp, row, data) // copy obj
        this.dialogStatus = 'update'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['zoneForm'].clearValidate()
        })
      }
    },
    // 赛区详情
    handleCheckZone (index, row) {
      this.$router.push({
        path: `/matchManagement/mathMatchZoneDetail/${row.id}/${this.title}的${row.name}/${this.id}`
      })
    },
    // 单项删除
    handleDelete (index, row) {
      this.$confirm('删除该赛区，是否继续？', '提示', {
        type: 'warning'
      }).then(() => {
        this.delZone([row.id]).then((res) => {
          if (res.rcode === 300) {
            this.zoneList.splice(index, 1)
          } else {
            // 提示错误
            this.$message.error(res.message)
          }
        }).catch((err) => {

        })
      })
    },
    // 关闭弹窗
    cancelData () {
      this.dialogFormVisible = false
    },
    handleChange (val) {
      const beginTimes = val[0]
      const beginDay = new Date(beginTimes).toLocaleDateString()
      this.zoneTemp.startTime = new Date(beginDay).getTime() // 变成0时0分0秒
      const endTimes = val[1]
      const endDay = new Date(endTimes).toLocaleDateString()
      this.zoneTemp.endTime = new Date(endDay + ' 23:59:59').getTime() // 变成23时59分59秒
    },
    // 确认创建
    createData () {
      this.$refs['zoneForm'].validate((valid) => {
        if (valid) {
          this.zoneTemp.levelId = this.id
          this.$api.match.updateZone(this.zoneTemp).then((res) => {
            if (res.rcode === 300) {
              this.dialogFormVisible = false
              this.$notify({
                title: '成功',
                message: '创建成功',
                type: 'success',
                duration: 2000
              })
              this.getZoneList()
            } else {
              // 错误提示
            }
          }).catch(() => {

          })
        }
      })
    },
    // 确认更新
    updateData () {
      this.$refs['zoneForm'].validate((valid) => { // 检查rule
        if (valid) {
          // this.zoneTemp.answerDuration = parseInt(this.zoneTemp.answerDuration);
          const tempData = Object.assign({}, this.zoneTemp)
          // delete tempData.matchTime;
          this.$api.match.updateZone(tempData).then((res) => {
            if (res.rcode === 300) {
              for (const v of this.zoneList) {
                if (v.id === tempData.id) {
                  const index = this.zoneList.indexOf(v)
                  this.zoneList.splice(index, 1, this.zoneTemp)
                  break
                }
              }
              this.dialogFormVisible = false
              this.$notify({
                title: '成功',
                message: '更新成功',
                type: 'success',
                duration: 2000
              })
            } else {
              // 失败提示
              this.$message.error(res.message)
            }
          }).catch((err) => {

          })
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
.time-input {
  width: 280px;
  float: left;
}
  .time-show {
    float: right;
  }
</style>

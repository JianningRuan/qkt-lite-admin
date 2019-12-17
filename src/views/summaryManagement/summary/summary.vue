<template>
  <div v-loading="fullScreenLoading" class="app-container">
    <el-card shadow="never" class="mb-20">
      <el-form ref="form" :inline="true" :model="params" label-width="120px" size="mini">
        <el-form-item label="评论人/评论内容">
          <el-input v-model="params.name" placeholder="视频名称/作者" class="input-box" @keyup.enter.native="onSearch" />
        </el-form-item>
        <el-form-item label="审核情况">
          <el-select v-model="params.check" placeholder="请选择审核情况" @change="onSearch">
            <el-option v-for="item in checkList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="params.type" placeholder="请选择类型" @change="onSearch">
            <el-option v-for="item in typeList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSearch">搜索</el-button>
          <el-button type="info" @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card shadow="never">
      <div slot="header" class="flex flex-pack-justify flex-align-center">
        <span class="flex1">评论列表</span>
        <div>
          <!--<el-button size="mini" :disabled="opaList.indexOf('edit') === -1 ? true : false" @click="batchSelectPass">批量审核通过</el-button>
          <el-button size="mini" :disabled="opaList.indexOf('edit') === -1 ? true : false" @click="batchSelectNoPass">批量审核不通过</el-button>-->
          <el-button type="danger" size="mini" :disabled="opaList.indexOf('delete') === -1 ? true : false" @click="batchDeletion">批量删除</el-button>
        </div>
      </div>
      <el-table ref="table" :data="summaryList" :default-expand-all="defaultExpandAll" tooltip-effect="dark" style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column fixed type="selection" width="55" />
        <el-table-column type="expand">
          <template slot-scope="props">
            <el-form label-position="left" inline class="demo-table-expand">
              <el-form-item label="评论内容">
                <div v-html="props.row.comment" />
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>
        <el-table-column prop="createrName" label="评论人" />
        <el-table-column prop="comment" label="评论内容" width="280">
          <template slot-scope="props">
            <el-popover placement="top-start" width="400" trigger="hover">
              <div v-html="props.row.comment" />
              <div slot="reference" class="content-box ellipsis">{{ props.row.comment }}</div>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column prop="comment" label="评论图片">
          <template slot-scope="props">
            <div class="pic-box">
              <el-image v-for="(pic, index) in props.row.picList" :key="index" :src="pic.pic" style="width: 33px; height: 33px" :preview-src-list="props.row.srcList" />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="评论时间" :formatter="createTimeFormatter" />
        <el-table-column prop="quoteName" label="评论/回复" />
        <el-table-column prop="typeName" label="所属类型" />
        <el-table-column prop="typeName" label="审核状态">
          <template slot-scope="scope">
            <el-tooltip class="item" effect="dark" content="点击按钮改变审核状态" placement="top-start">
              <el-button v-if="scope.row.check" type="success" size="mini" plain round @click="changeCheck(scope.$index, scope.row)">通过</el-button>
              <el-button v-else type="danger" size="mini" plain round @click="changePassCheck(scope.$index, scope.row)">不通过</el-button>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="80" align="center">
          <template slot-scope="scope">
            <el-button size="mini" type="danger" :disabled="opaList.indexOf('delete') === -1 ? true : false" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="params.total > 0" :total="params.total" :page.sync="params.offSet" :limit.sync="params.offSize" @pagination="getSummaryList" />
    </el-card>
    <!--审核弹窗-->
    <el-dialog class="check-box" :title="temp.type === 1 ? '审核通过' : '审核不通过'" :visible.sync="dialogFormVisible" width="500px" @close="cancelEditData">
      <el-form ref="dataForm" :model="temp" :rules="rules" label-position="left">
        <el-form-item label="审核理由" prop="checkReason">
          <el-input v-model="temp.checkReason" type="textarea" :rows="2" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelEditData">取消</el-button>
        <el-button type="primary" @click="updateData">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination' // 分页
import { opaMixin } from '../../../utils/mixins'
import { parseTime } from '../../../utils'
export default {
  name: 'SummaryList',
  components: { Pagination },
  filters: {},
  mixins: [opaMixin],
  data () {
    return {
      defaultExpandAll: false,
      fullScreenLoading: false,
      params: {
        name: '',
        check: '',
        type: '',
        total: 0, // 总共条数
        offSet: 0, // 页面
        offSize: 10 // 一页的条数
      },
      checkList: [{ value: '', label: '全部' }, { value: 1, label: '通过' }, { value: 0, label: '不通过' }],
      typeList: [{ value: '', label: '全部' }, { value: 1, label: '视频' }, { value: 2, label: '话题' }],
      summaryList: [],
      selectArr: [],
      dialogFormVisible: false,
      checkReason: '',
      temp: {
        ids: [],
        type: 0,
        checkReason: ''
      },
      rules: {
        checkReason: [
          { required: true, message: '审核理由不能为空', trigger: 'blur' }
        ]
      },
      visibleTips: false
    }
  },
  computed: {},
  watch: {
    'temp.type': function (newVal) {
      const rules = this.rules
      if (newVal === 0) {
        rules.checkReason[0].required = true
      } else {
        rules.checkReason[0].required = false
      }
      this.rules = rules
    }
  },
  created () {
  },
  async mounted () {
    await this.getOpaList()
    this.$nextTick(() => {
      this.getSummaryList()
    })
  },
  activated () {
  },
  destroyed () {
  },
  methods: {
    // 过滤最后登录时间
    createTimeFormatter (row, column) {
      if (row.createTime === 0) {
        return '无登录记录'
      } else {
        return parseTime(row.createTime, '{y}-{m}-{d}')
      }
    },
    getSummaryList () {
      if (this.opaList.indexOf('list') === -1) { // 权限
        return
      }
      this.fullScreenLoading = true
      this.$nextTick(() => {
        const params = Object.assign({}, this.params)
        params.offSet--
        this.$api.summary.summaryList(params).then((res) => {
          if (res.rcode === 300) {
            const summaryList = res.data.summaryList
            summaryList.forEach(value => {
              const srcList = []
              if (value.picList.length > 0) {
                value.picList.forEach(val => {
                  srcList.push(val.pic)
                  value.srcList = srcList
                })
              } else {
                value.srcList = []
              }
            })
            this.params.total = res.data.totalPages
            this.summaryList = res.data.summaryList
          }
          this.fullScreenLoading = false
        }).catch(() => {

        })
      })
    },
    onSearch () {
      this.params.offSet = 1
      this.getSummaryList()
    },
    onReset () {
      this.params = {
        name: '',
        check: '',
        type: '',
        total: 0, // 总共条数
        offSet: 0, // 页面
        offSize: 10 // 一页的条数
      }
      this.onSearch()
    },
    handleSelectionChange (val) {
      this.selectArr = val
    },
    batchDeletion () {
      if (this.selectArr.length === 0) {
        // 请先选择要删除的项
        this.$message({
          message: '请先选择要删除的项',
          type: 'warning'
        })
        return
      }
      this.$confirm('删除已选中的评论，是否继续？', '提示', {
        type: 'warning'
      }).then(() => {
        const ids = []
        this.selectArr.forEach((value) => {
          ids.push(value.id)
        })
        this.delSummary(ids).then((res) => {
          if (res.rcode === 300) {
            this.getSummaryList()
            this.selectArr = []
          } else {
            // 错误提示
            this.$message.error(res.message)
          }
        })
      })
    },
    async delSummary (ids) {
      const params = {
        ids
      }
      return await this.$api.summary.delSummary(params)
    },
    handleDelete (index, row) {
      this.$confirm('删除该评论，是否继续？', '提示', {
        type: 'warning'
      }).then(() => {
        this.delSummary([row.id]).then((res) => {
          if (res.rcode === 300) {
            this.getSummaryList()
          } else {
            // 提示错误
            this.$message.error(res.message)
          }
        }).catch((err) => {

        })
      })
    },
    resetTemp () {
      this.temp = {
        ids: [],
        type: 0,
        checkReason: ''
      }
    },
    batchSelectPass () {
      if (this.selectArr.length === 0) {
        // 请先选择要删除的项
        this.$message({
          message: '请先选择要审核的项',
          type: 'warning'
        })
        return
      }
      this.resetTemp()
      this.temp.type = 1
      const ids = []
      this.selectArr.forEach((value) => {
        ids.push(value.id)
      })
      this.temp.ids = ids
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    batchSelectNoPass () {
      if (this.selectArr.length === 0) {
        // 请先选择要删除的项
        this.$message({
          message: '请先选择要审核的项',
          type: 'warning'
        })
        return
      }
      this.resetTemp()
      this.temp.type = 0
      const ids = []
      this.selectArr.forEach((value) => {
        ids.push(value.id)
      })
      this.temp.ids = ids
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    cancelEditData () {
      this.dialogFormVisible = false
    },
    updateData () {
      this.visibleTips = false
      this.$refs['dataForm'].validate((valid) => { // 检查rule
        if (valid) {
          this.$confirm('不通过该评论，是否继续？', '提示', {
            type: 'warning'
          }).then(() => {
            const tempData = Object.assign({}, this.temp)
            this.$api.summary.setSummaryCheck(tempData).then((res) => {
              if (res.rcode === 300) {
                this.dialogFormVisible = false
                this.getSummaryList()
                // this.selectArr = []
                this.$notify({
                  title: '成功',
                  message: '审核成功',
                  type: 'success',
                  duration: 2000
                })
              } else {

              }
            }).catch(() => {

            })
          }).catch(() => {})
        }
      })
    },
    changeCheck (index, row) {
      this.resetTemp()
      this.temp.type = row.check === 0 ? 1 : 0
      this.temp.ids = [row.id]
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    changePassCheck (index, row) {
      this.$confirm('通过该评论，是否继续？', '提示', {
        type: 'warning'
      }).then(() => {
        this.resetTemp()
        this.temp.type = row.check === 0 ? 1 : 0
        this.temp.ids = [row.id]
        const tempData = Object.assign({}, this.temp)
        this.$api.summary.setSummaryCheck(tempData).then((res) => {
          if (res.rcode === 300) {
            this.getSummaryList()
            this.$notify({
              title: '成功',
              message: '审核成功',
              type: 'success',
              duration: 2000
            })
          }
        }).catch(() => {

        })
      }).catch(() => {

      })
    }
  }
}
</script>

<style scoped lang="scss">
  .demo-table-expand {
    font-size: 0;
  }
  .demo-table-expand label {
    width: 90px;
    color: #99a9bf;
  }
  .demo-table-expand .el-form-item {
    width: 100%;
    padding-top: 20px;
    padding-bottom: 20px;
    // border-bottom: 1px solid #EBEEF5;
    margin-right: 0;
    margin-bottom: 0;
    &:last-child {
      border-bottom: 0;
    }
  }
  .pic-box {
    line-height: 0;

    & /deep/ .el-icon-circle-close {
      color: #fff;
    }
  }
  .content-box {
    width: 260px;
  }
  .check-box {
    p {
      line-height: 24px;
    }
  }
</style>

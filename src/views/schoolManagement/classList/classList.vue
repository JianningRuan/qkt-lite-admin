<template>
  <div v-loading="fullScreenLoading" class="app-container">
    <el-card shadow="never" class="mb-20">
      <el-form ref="form" :inline="true" :model="classParams" label-width="80px" size="mini">
        <el-form-item label="年级">
          <el-select v-model="classParams.grade" placeholder="请选择年级" class="input-box" @change="changeGrade">
            <el-option
              v-for="item in gradeList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
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
        <span class="flex1">班级列表</span>
        <div>
          <el-button type="primary" size="mini" :disabled="opaList.indexOf('add') === -1 ? true : false" @click="handleCreate">
            新增
          </el-button>
          <el-button type="danger" size="mini" :disabled="opaList.indexOf('delete') === -1 ? true : false" @click="batchDeletion">
            批量删除
          </el-button>
        </div>
      </div>

      <el-table ref="classTable" :data="classList" stripe tooltip-effect="dark" style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column label="班级名称" prop="className" />
        <el-table-column label="年级名称" prop="grade" :formatter="gradeFormatter" />
        <el-table-column label="班号" prop="num" />
        <el-table-column label="学校" prop="schoolName" />
        <el-table-column label="添加时间" prop="createTime" :formatter="createTimeFormatter" />
        <el-table-column label="操作" width="126">
          <template slot-scope="scope">
            <el-button size="mini" type="danger" :disabled="opaList.indexOf('delete') === -1 ? true : false" @click="handleDelete(scope.$index, scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="classParams.total > 0" :total="classParams.total" :page.sync="classParams.offSet" :limit.sync="classParams.offSize" @pagination="getClassList" />
    </el-card>

    <!--新增班级弹层-->
    <el-dialog title="创建班级" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :model="temp" :rules="rules" label-position="left" label-width="80px" style="margin-left:50px;">
        <el-form-item label="年级" prop="grade">
          <el-select v-model="temp.grade" placeholder="请选择年级" class="input-box">
            <el-option
              v-for="item in gradeTempList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="班号" prop="num">
          <el-select v-model="temp.num" placeholder="请选择班号" class="input-box">
            <el-option
              v-for="item in classNumTempList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="createData">
          确定
        </el-button>
      </div>
    </el-dialog>
    <!--新增班级弹层-end-->
  </div>
</template>

<script>
import Pagination from '@/components/Pagination' // 分页
import { parseTime } from '../../../utils'
import { opaMixin } from '../../../utils/mixins'

export default {
  name: 'ClassList',
  components: {
    Pagination
  },
  filters: {},
  mixins: [opaMixin],
  data () {
    return {
      fullScreenLoading: false,
      classParams: {
        schoolId: '',
        grade: 0,
        total: 0, // 总共条数
        offSet: 0, // 页面
        offSize: 10 // 一页的条数
      },
      gradeList: [],
      classList: [],
      delArr: [],
      gradeTempList: [],
      dialogFormVisible: false,
      temp: {
        grade: '',
        num: '',
        schoolId: ''
      },
      rules: {
        grade: [
          { required: true, trigger: 'change', message: '年级不能为空' }
        ],
        num: [
          { required: true, trigger: 'change', message: '班号不能为空' }
        ]
      },
      classNumTempList: [
        { value: 1, label: '1班' }, { value: 2, label: '2班' }, { value: 3, label: '3班' }, { value: 4, label: '4班' }, { value: 5, label: '5班' }, { value: 6, label: '6班' }, { value: 7, label: '7班' }, { value: 8, label: '8班' }, { value: 9, label: '9班' }, { value: 10, label: '10班' },
        { value: 11, label: '11班' }, { value: 12, label: '12班' }, { value: 13, label: '13班' }, { value: 14, label: '14班' }, { value: 15, label: '15班' }, { value: 16, label: '16班' }, { value: 17, label: '17班' }, { value: 18, label: '18班' }, { value: 19, label: '19班' }, { value: 20, label: '20班' },
        { value: 21, label: '21班' }, { value: 22, label: '22班' }, { value: 23, label: '23班' }, { value: 24, label: '24班' }, { value: 25, label: '25班' }, { value: 26, label: '26班' }, { value: 27, label: '27班' }, { value: 28, label: '28班' }, { value: 29, label: '29班' }, { value: 30, label: '30班' },
        { value: 31, label: '31班' }, { value: 32, label: '32班' }, { value: 33, label: '33班' }, { value: 34, label: '34班' }, { value: 35, label: '35班' }, { value: 36, label: '36班' }, { value: 37, label: '37班' }, { value: 38, label: '38班' }, { value: 39, label: '39班' }, { value: 40, label: '40班' }
      ]
    }
  },
  computed: {},
  watch: {},
  created () {
    this.classParams.schoolId = this.$route.params.id
  },
  async mounted () {
    await this.getOpaList()
    this.$nextTick(() => {
      this.getClassList()
      this.getGradeList()
    })
  },
  activated () {
  },
  destroyed () {
  },
  methods: {
    // 获取班级列表
    getClassList () {
      if (this.opaList.indexOf('list') === -1) {
        return
      }
      this.fullScreenLoading = true
      this.$nextTick(() => {
        const classParams = Object.assign({}, this.classParams)
        classParams.offSet--
        this.$api.school.getClassList(classParams).then((res) => {
          if (res.rcode === 300) {
            this.classList = res.data.classList
            this.classParams.total = res.data.totalPages
          }
          this.fullScreenLoading = false
        })
      })
    },
    // 获取年级
    async getGradeList () {
      const params = {
        type: 1
      }
      const res = await this.$api.common.getGrade(params)
      if (res.rcode === 300) {
        const gradeList = res.data.gradeList
        gradeList.forEach((item) => {
          item.value = item.id
          item.label = item.name
        })
        this.gradeList = gradeList
        const gradeTempList = gradeList.concat()
        gradeTempList.splice(0, 1)
        this.gradeTempList = gradeTempList
      }
    },
    // 改变年级
    changeGrade () {
      this.onSearch()
    },
    // 搜索
    onSearch () {
      this.classParams.offSet = 1
      this.getClassList()
    },
    // 重置
    onReset () {
      this.classParams = {
        schoolId: this.$route.params.id,
        grade: 0,
        total: 0, // 总共条数
        offSet: 0, // 页面
        offSize: 10 // 一页的条数
      }
      this.onSearch()
    },
    //
    resetTemp () {
      this.temp = {
        grade: '',
        num: '',
        schoolId: this.$route.params.id
      }
    },
    // 新增
    handleCreate () {
      this.resetTemp()
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    // 进行班级的删除
    async delClass (ids) {
      const params = {
        ids
      }
      return await this.$api.school.delClass(params)
    },
    // 批量删除
    batchDeletion () {
      if (this.delArr.length === 0) {
        // 请先选择要删除的项
        this.$message({
          message: '请先选择要删除的项',
          type: 'warning'
        })
        return
      }
      this.$confirm('是否删除所勾选的班级？', '提示', {
        type: 'warning'
      }).then(() => {
        const classIdArr = []
        this.delArr.forEach((value) => {
          classIdArr.push(value.id)
        })
        // let userIds = userIdArr.join(',');
        this.delClass(classIdArr).then((res) => {
          if (res.rcode === 300) {
            this.getClassList()
          } else {
            // 错误提示
            this.$message.error(res.message)
          }
        })
      })
    },
    // 选择
    handleSelectionChange (val) {
      this.delArr = val
    },
    // 单个删除
    handleDelete (index, row) {
      this.$confirm('是否删除该班级？', '提示', {
        type: 'warning'
      }).then(() => {
        this.delClass([row.id]).then((res) => {
          if (res.rcode === 300) {
            this.classList.splice(index, 1)
          } else {
            // 提示错误
            this.$message.error(res.message)
          }
        }).catch((err) => {

        })
      })
    },
    // 过滤年级
    gradeFormatter (row, column) {
      const gradeArr = ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级', '七年级', '八年级', '九年级']
      return gradeArr[row.grade - 1]
    },
    // 过滤创建时间
    createTimeFormatter (row, column) {
      if (row.createTime === 0) {
        return '无创建记录'
      } else {
        return parseTime(row.createTime, '{y}-{m}-{d}')
      }
    },
    // 创建班级
    createData () {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          // 提交
          this.$api.school.addClass(this.temp).then((res) => {
            if (res.rcode === 300) {
              // 提交之后
              this.dialogFormVisible = false
              this.$notify({
                title: '成功',
                message: '创建成功',
                type: 'success',
                duration: 2000
              })

              // 回到第一页
              this.onSearch()
            } else {
              // 提示错误
            }
          }).catch((err) => {

          })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .input-box {
    width: 140px;
  }
</style>

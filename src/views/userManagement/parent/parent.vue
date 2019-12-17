<template>
  <div v-loading="fullScreenLoading" class="app-container">
    <el-card shadow="never" class="mb-20">
      <el-form ref="form" :inline="true" :model="userParams" label-width="80px" size="mini">
        <el-form-item label="家长姓名">
          <el-input v-model="userParams.userName" placeholder="家长姓名" class="filter-item input-box" @change="onSearch" @keyup.enter.native="handleFilter" />
        </el-form-item>
        <el-form-item label="家长号码">
          <el-input v-model="userParams.mobile" placeholder="绑定号码" class="filter-item input-box" @change="onSearch" @keyup.enter.native="handleFilter" />
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
        <span class="flex1">学生列表</span>
        <div>
          <el-button type="primary" size="mini" :disabled="opaList.indexOf('add') === -1 ? true : false" @click="handleCreate">
            新增
          </el-button>
          <el-button type="primary" size="mini" :disabled="opaList.indexOf('impl') === -1 ? true : false" @click="uploadExcel">
            学生导入
          </el-button>
          <el-button type="danger" size="mini" :disabled="opaList.indexOf('delete') === -1 ? true : false" @click="batchDeletion">
            批量删除
          </el-button>
        </div>
      </div>
      <el-table :data="parentList" class="parent-list" style="width: 100%;" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column label="家长姓名" prop="userName" />
        <el-table-column label="绑定电话" prop="mobile" />
        <el-table-column label="来源" prop="source" />
        <el-table-column label="最后登录时间" prop="lastLoginTime" :formatter="loginTimeFormatter">
          <!--<template slot-scope="scope">{{scope.row.lastLoginTime | parseTime('{y}-{m}-{d}')}}</template>-->
        </el-table-column>
        <el-table-column label="操作" width="360">
          <template slot-scope="scope">
            <el-button size="mini" :disabled="opaList.indexOf('query') === -1 ? true : false" @click="handleCheck(scope.$index, scope.row)">
              查看详情
            </el-button>
            <el-button size="mini" :disabled="opaList.indexOf('edit') === -1 ? true : false" @click="handleEdit(scope.$index, scope.row)">
              编辑
            </el-button>
            <el-button size="mini" :disabled="opaList.indexOf('verify') === -1 ? true : false" @click="handleCreateChild(scope.$index, scope.row)">
              绑定学生
            </el-button>
            <el-button size="mini" type="danger" :dsiabled="opaList.indexOf('delete') === -1 ? true : false" @click="handleDelete(scope.$index, scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="userParams.total > 0" :total="userParams.total" :page.sync="userParams.offSet" :limit.sync="userParams.offSize" @pagination="getParentList" />
    </el-card>

    <el-dialog
      title="导入学生EXCEL"
      :visible.sync="dialogVisible"
      width="30%"
      :before-close="handleClose"
    >
      <div v-loading="excelLoading" element-loading-text="正在导入， 请耐心等候...">
        <upload-excel-component :on-success="handleSuccess" :before-upload="beforeUpload" />
      </div>
      <el-button type="text" @click="downExcel">
        下载学生导入模板
      </el-button>
    </el-dialog>

    <!--家长详情弹窗（学生列表）-->
    <el-dialog title="家长详情":visible.sync="dialogTableVisible" width="890px">
      <el-row type="flex" class="row-bg" :gutter="20">
        <el-col :span="4">
          <div class="grid-content grid-content-title">
            家长姓名：
          </div>
        </el-col>
        <el-col :span="6">
          <div class="grid-content">
            {{ parentData.userName }}
          </div>
        </el-col>
        <el-col :span="4">
          <div class="grid-content grid-content-title">
            家长号码：
          </div>
        </el-col>
        <el-col :span="10">
          <div class="grid-content">
            {{ parentData.mobile }}
          </div>
        </el-col>
      </el-row>
      <el-row type="flex" class="row-bg" :gutter="20">
        <el-col :span="4">
          <div class="grid-content grid-content-title">
            最后登录时间：
          </div>
        </el-col>
        <el-col :span="6">
          <div v-if="parentData.lastLoginTime > 0" class="grid-content">
            {{ parentData.lastLoginTime | parseTime('{y}-{m}-{d}') }}
          </div>
          <div v-else class="grid-content">
            无登录记录
          </div>
        </el-col>
        <el-col :span="4">
          <div class="grid-content grid-content-title">
            操作：
          </div>
        </el-col>
        <el-col :span="10">
          <div class="grid-content">
            <el-button size="mini" @click="handleEdit(parentIndex, parentData)">
              编辑
            </el-button>
            <!--<el-button size="mini">创建学生并绑定</el-button>-->
            <el-button size="mini" @click="handleCreateChild(parentIndex, parentData)">
              绑定学生
            </el-button>
            <el-button size="mini" type="danger" @click="handleDelete(parentIndex, parentData, true)">
              删除
            </el-button>
          </div>
        </el-col>
      </el-row>
      <el-table :data="childList">
        <el-table-column label="学生姓名" prop="userName" />
        <el-table-column label="学生电话" prop="mobile" />
        <el-table-column label="年级" prop="grade" :formatter="gradeFormatter" />
        <el-table-column label="班级" prop="className" />
        <el-table-column label="操作" width="126">
          <template slot-scope="scope">
            <!--<el-button size="mini" @click="handleStuEdit(scope.$index, scope.row)">编辑</el-button>-->
            <el-button size="mini" type="danger" @click="handleStuDel(scope.$index, scope.row)">
              解除绑定
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
    <!--家长详情弹窗（学生列表）-end-->

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogParentEditVisible" width="890px">
      <el-form ref="dataForm" :model="temp" :rules="rules" label-position="left" label-width="80px" style="margin-left:50px; margin-right: 50px;">
        <el-form-item label="家长姓名" prop="userName">
          <el-input v-model="temp.userName" placeholder="家长姓名" />
        </el-form-item>
        <el-form-item label="家长号码" prop="mobile">
          <el-input v-model="temp.mobile" placeholder="家长号码" :disabled="dialogStatus === 'update' ? true : false" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogParentEditVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          确定
        </el-button>
      </div>
    </el-dialog>

    <el-dialog title="绑定学生" :visible.sync="dialogChildAddVisible" @close="closeChildAddVisible">
      <el-form ref="addStuForm" :model="stuTemp" :rules="stuRules" label-position="left" label-width="120px" style="margin-left: 50px; margin-right: 50px;">
        <el-form-item label="学生手机号码" prop="mobile">
          <el-input v-model="stuTemp.mobile" placeholder="学生手机号码" />
        </el-form-item>
        <el-form-item label="学生名字" prop="studentIds">
          <el-select
            v-model="stuTemp.studentIds"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="请选择学生"
            style="width: 100%;"
          >
            <el-option
              v-for="item in stuList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeChildAddVisible">
          取消
        </el-button>
        <el-button type="primary" @click="createStuData()">
          确定
        </el-button>
      </div>
    </el-dialog>

    <!--导入失败弹窗-->
    <el-dialog title="导入结果" :visible.sync="dialogExcelErrorVisible" :before-close="handleCloseExcelErrorVisible">
      <div class="mb-20">
        {{ dialogExcelErrorMessage }}
      </div>
      <el-table
        :data="excelFailedList"
        height="250"
        style="width: 100%"
      >
        <el-table-column prop="row" label="错误行数" width="180" />
        <el-table-column prop="errorMsg" label="错误信息" />
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="closeExcelErrorVisible">
          确定
        </el-button>
      </div>
    </el-dialog>
    <!--导入失败弹窗-end-->

    <!--<el-dialog title="编辑学生" :visible.sync="dialogChildEditVisible">
      <el-form ref="stuEditForm" :model="stuEditTemp" :rules="stuEditRules" label-position="left" label-width="120px" style="margin-left: 50px; margin-right: 50px;">
        <el-form-item label="学生姓名">
          <el-input placeholder="学生姓名" prop="" />
        </el-form-item>
      </el-form>
    </el-dialog>-->
  </div>
</template>
<script>
import Pagination from '@/components/Pagination' // 分页
import UploadExcelComponent from '@/components/UploadExcel/index.vue' // 导入excel
import { parseTime, common } from '../../../utils'
import { opaMixin } from '../../../utils/mixins'

export default {
  name: 'ParentManagement',
  components: {
    Pagination,
    UploadExcelComponent
  },
  filters: {},
  mixins: [opaMixin],
  data () {
    const validateMobile = (rule, value, callback) => {
      if (this.dialogStatus === 'update' && value === this.oriMobile) { // 当是编辑时，同时没有改变手机号
        callback()
        return
      }
      const isMobile = common.isMobile(value)
      if (isMobile) {
        // 接口判断
        const params = {
          mobile: value,
          role: 2
        }
        this.$api.common.checkMobile(params).then((res) => {
          if (res.rcode === 300) {
            if (res.data.result) {
              callback(new Error('该电话号码的家长已存在'))
            } else {
              callback()
            }
          }
        })
      } else {
        callback(new Error('含有非电话号码字符'))
      }
    }
    const validateStuMobile = (rule, value, callback) => {
      const isMobile = common.isMobile(value)
      if (isMobile) {
        const params = {
          mobile: value,
          role: 1
        }
        this.$api.common.checkMobile(params).then((res) => {
          if (res.rcode === 300) {
            if (res.data.result) {
              if (this.stuTemp.studentIds.length === 0) { // 避免 点击提交时再次检验，接口会报错
                this.getParentStuList(value)
              }
              callback()
            } else {
              callback(new Error('该电话号码的学生不存在'))
            }
          }
        }).catch((err) => {

        })
      } else {
        callback(new Error('含有非电话号码字符'))
      }
    }
    return {
      fullScreenLoading: false,
      dialogVisible: false, // 是否显示上传EXCEL表单弹层
      delArr: [],
      userParams: {
        userName: '',
        mobile: '',
        offSet: 0,
        offSize: 10,
        total: 0
      }, // 搜索条件
      parentList: [],
      parentData: {}, // 查看父母的详细资料
      parentIndex: '',
      childList: [],
      dialogTableVisible: false,
      dialogParentEditVisible: false,
      rules: {
        userName: [
          { required: true, message: '姓名不能为空', trigger: 'blur' }
        ],
        mobile: [
          { required: true, trigger: 'blur', message: '手机号码不能为空' },
          { trigger: 'blur', validator: validateMobile }
        ]
      },
      temp: {
        id: 0,
        userName: '',
        mobile: '',
        pic: '',
        lastLoginTime: 0
      },
      oriMobile: '',
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '创建'
      },
      dialogChildAddVisible: false,
      stuTemp: {
        parentId: '',
        mobile: '',
        studentIds: []
      },
      stuList: [],
      stuRules: {
        mobile: [
          { required: true, trigger: 'blur', message: '手机号码不能为空' },
          { trigger: 'blur', validator: validateStuMobile }
        ],
        studentIds: [
          { required: true, trigger: 'change', message: '学生不能为空' }
        ]
      },
      dialogChildEditVisible: false,
      imageCropperShow: false,
      imageCropperKey: 0,
      excelTime: '', // 循环导入时监听返回的setInterval
      excelTimeNum: 0, // 计算循环的累计时间
      excelLoading: false,
      dialogExcelErrorVisible: false,
      dialogExcelErrorMessage: '',
      excelFailedList: []
    }
  },
  computed: {},
  watch: {},
  created () {},
  async mounted () {
    await this.getOpaList()
    this.$nextTick(() => {
      this.getParentList()
    })
  },
  activated () {},
  destroyed () {},
  methods: {
    // 过滤最后登录时间
    loginTimeFormatter (row, column) {
      if (row.lastLoginTime === 0) {
        return '无登录记录'
      } else {
        return parseTime(row.lastLoginTime, '{y}-{m}-{d}')
      }
    },
    // 获取家长列表
    getParentList () {
      if (this.opaList.indexOf('list') === -1) { // 权限
        return
      }
      this.fullScreenLoading = true
      this.$nextTick(() => {
        const userParams = Object.assign({}, this.userParams)
        userParams.offSet--
        this.$api.user.getParentList(userParams).then((res) => {
          if (res.rcode === 300) {
            this.parentList = res.data.userList
            this.userParams.total = res.data.totalPages
          }
          this.fullScreenLoading = false
        }).catch((err) => {

        })
      })
    },
    // enter后
    handleFilter () {
      this.onSearch()
    },
    // 搜索
    onSearch () {
      this.userParams.offSet = 1
      this.getParentList()
    },
    // 重置
    onReset () {
      this.userParams = {
        userName: '',
        mobile: '',
        offSet: 0,
        offSize: 10,
        total: 0
      }
      this.onSearch()
    },
    // 查看详情
    async handleCheck (index, value) {
      this.parentData = value
      this.parentIndex = index
      this.dialogTableVisible = true

      const params = {
        parentId: value.id
      }
      const res = await this.$api.user.getParentStudentList(params)
      if (res.rcode === 300) {
        this.childList = res.data.userList
      }
    },
    // 过滤年级
    gradeFormatter (row, column) {
      const gradeArr = ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级', '七年级', '八年级', '九年级']
      return gradeArr[row.grade - 1]
    },
    // 编辑家长
    async handleEdit (index, row) {
      const params = {
        parentId: row.id
      }
      const res = await this.$api.user.getParentDetail(params)
      if (res.rcode === 300) {
        this.oriMobile = row.mobile
        this.temp = Object.assign({}, row, res.data)
        this.dialogStatus = 'update'
        this.dialogParentEditVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      }
    },
    // 确定编辑家长
    updateData () {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          this.$api.user.updateParent(this.temp).then((res) => {
            if (res.rcode === 300) {
              this.parentData = tempData
              for (const v of this.parentList) {
                if (tempData.id === v.id) {
                  const index = this.parentList.indexOf(v)
                  this.parentList.splice(index, 1, this.temp)
                  break
                }
              }
              this.dialogParentEditVisible = false
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
    },
    // 格式化家长模板
    resetTemp () {
      this.temp = {
        id: 0,
        pic: '',
        userName: '',
        mobile: '',
        lastLoginTime: 0
      }
    },
    // 创建家长
    handleCreate () {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogParentEditVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    // 确定创建家长
    createData () {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.$api.user.updateParent(this.temp).then((res) => {
            if (res.rcode === 300) {
              // this.parentList.unshift(this.temp);
              this.dialogParentEditVisible = false
              this.$notify({
                title: '成功',
                message: '创建成功',
                type: 'success',
                duration: 2000
              })

              // 回到第一页
              this.onSearch()
            } else {
              // 失败提示
              this.$message.error(res.message)
            }
          }).catch((err) => {

          })
        }
      })
    },
    // 多选列表
    handleSelectionChange (val) {
      this.delArr = val
    },
    // 批量删除家长
    batchDeletion () {
      if (this.delArr.length === 0) {
        // 请先选择要删除的项
        this.$message({
          message: '请先选择要删除的项',
          type: 'warning'
        })
        return
      }
      this.$confirm('删除用户将会解除与所有孩子的绑定，是否继续？', '提示', {
        type: 'warning'
      }).then(() => {
        const userIdArr = []
        this.delArr.forEach((value) => {
          userIdArr.push(value.id)
        })
        this.delParent(userIdArr).then((res) => {
          if (res.rcode === 300) {
            this.getParentList()
          } else {
            // 失败提示
            this.$message.error(res.message)
          }
        }).catch((err) => {

        })
      })
    },
    // 删除家长
    handleDelete (index, row, dialog = false) {
      this.$confirm('删除用户将会解除与所有孩子的绑定，是否继续？', '提示', {
        type: 'warning'
      }).then(() => {
        this.delParent([row.id]).then((res) => {
          if (res.rcode === 300) {
            this.parentList.splice(index, 1)
            if (dialog) {
              this.dialogTableVisible = false
            }
          } else {
            // 失败提示
            this.$message.error(res.message)
          }
        }).catch((err) => {

        })
      })
    },
    // 进行家长的删除
    async delParent (ids) {
      const params = {
        ids
      }
      const res = await this.$api.user.delParent(params)
      return res
    },
    // 格式化学生模板
    clearStuTemp () {
      this.stuTemp = {
        parentId: '',
        mobile: '',
        studentIds: []
      }
    },
    // 创建学生
    handleCreateChild (index, row) {
      this.parentData = row
      this.parentIndex = index
      this.clearStuTemp()
      this.stuTemp.parentId = row.id
      this.dialogChildAddVisible = true
      this.$nextTick(() => {
        this.$refs['addStuForm'].clearValidate()
      })
    },
    // 获取可绑定的学生的名单
    async getParentStuList (value) {
      const res = await this.$api.user.getStudentByMobileAndParentId(this.stuTemp)
      if (res.rcode === 300 && res.data !== null) {
        const studentList = res.data.studentList
        studentList.forEach((item) => {
          item.value = item.id
          item.label = item.name
        })
        this.stuList = studentList
      } else {
        // 提示没有可绑定的账号角色
        this.$message({
          message: '没有可绑定的账号学生角色',
          type: 'warning'
        })
      }
    },
    // 确定绑定学生
    createStuData () {
      this.$refs['addStuForm'].validate((valid) => {
        if (valid) {
          this.$api.user.addParentStudent(this.stuTemp).then((res) => {
            if (res.rcode === 300) {
              // this.dialogChildAddVisible = false;
              this.closeChildAddVisible()
              this.$notify({
                title: '成功',
                message: '绑定成功',
                type: 'success',
                duration: 2000
              })
              // 刷新列表
              this.handleCheck(this.parentIndex, this.parentData)
            } else {
              // 失败提示
              this.$message.error(res.message)
            }
          }).catch((err) => {

          })
        }
      })
    },
    // 关闭绑定学生弹窗
    closeChildAddVisible () {
      this.dialogChildAddVisible = false
      this.stuList = []
    },
    // 编辑学生
    handleStuEdit (index, row) {},
    // 解除学生绑定
    handleStuDel (index, row) {
      this.$confirm('是否解除该绑定？', '提示', {
        type: 'warning'
      }).then(() => {
        const params = {
          parentId: this.parentData.id,
          studentId: row.id
        }
        this.$api.user.delParentStudent(params).then((res) => {
          if (res.rcode === 300) {
            this.childList.splice(index, 1)
            this.$notify({
              title: '成功',
              message: '解绑成功',
              type: 'success',
              duration: 2000
            })
          } else {
            // 失败提示
            this.$message.error(res.message)
          }
        }).catch((err) => {

        })
      })
    },
    // 导入弹层关闭
    handleClose () {
      this.excelLoading = false
      this.dialogVisible = false
      clearInterval(this.excelTime)
      this.excelTimeNum = 0
    },
    // 点击打开导入弹层
    uploadExcel () {
      this.dialogVisible = true
    },
    // 关闭导入错误报告弹窗
    closeExcelErrorVisible () {
      this.dialogExcelErrorVisible = false
      this.dialogExcelErrorMessage = ''
      this.handleClose()
      // 跳转到首页
      this.onReset()
    },
    handleCloseExcelErrorVisible (done) {
      done()
      this.handleClose()
    },
    beforeUpload (file) {
      const isLt1M = file.size / 1024 / 1024 < 1

      if (isLt1M) {
        return true
      }

      this.$message({
        message: '请不要上传大小超过1M的文件.',
        type: 'warning'
      })
      return false
    },
    handleSuccess ({ results, header, rawFile }) {
      this.excelLoading = true
      const tableData = results
      const tableHeader = header
      const formData = new FormData()
      formData.append('file', rawFile)
      this.$api.user.importStudentExcel(formData).then((res) => {
        if (res.rcode === 300) {
          const key = res.data.key
          this.excelTime = setInterval(() => { // 循环发送接口检测导入是否完成
            this.excelTimeNum += 4000
            if (this.excelTimeNum >= 3600000) {
              clearInterval(this.excelTime)
              this.excelTimeNum = 0
              // 弹窗提示超时
              const message = `导入超时，请重试`
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
            this.$api.user.checkState(params).then((result) => {
              if (result.rcode === 300 && result.data !== null) {
                clearInterval(this.excelTime)
                const excelTimeNum = this.excelTimeNum
                this.excelTimeNum = 0
                const data = result.data
                let message = ``
                if (data.success && data.failedList.length === 0) {
                  // 导入成功
                  message = `一共导入${data.totalCount}名学生，成功绑定${data.successSCount}名，失败${data.failSCount}名，共耗时${excelTimeNum / 1000}秒。`
                  this.$alert(message, '提示', {
                    callback: action => {
                      this.handleClose()

                      // 跳转到首页
                      this.onReset()
                    }
                  })
                } else {
                  // 导入失败
                  this.excelFailedList = data.failedList
                  this.dialogExcelErrorMessage = `一共导入${data.totalCount}名学生，成功绑定${data.successSCount}名，失败${data.failSCount}名，共耗时${excelTimeNum / 1000}秒。`
                  this.dialogExcelErrorVisible = true
                  /* data.failedList.forEach((failed)=>{
                      message += `EXCEL表中第${failed.row}行出现错误：${failed.errorMsg}`;
                    })
                    this.$alert(message, '提示', {
                      callback: action => {
                        this.handleClose()
                      }
                    }) */
                }
              } else {
                // 出错
                console.log('导入出错')
              }
            })
          }, 4000)
        }
      }).catch((err) => {

      })
    },
    // 下载模板
    downExcel () {
      window.open('http://qtone-qkt.callmesoul.cn/lite/admin/xxt/excel/student.xlsx')
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
  .input-box {
    width: 140px;
  }
  .class-input-box {
    width: 100px;
  }

  .row-bg {
    background: #f2f2f2;
  }
  .grid-content {
    height: 40px;
    line-height: 40px;

    &.grid-content-title {
      text-align: right;
      font-weight: bold;
    }
  }

</style>

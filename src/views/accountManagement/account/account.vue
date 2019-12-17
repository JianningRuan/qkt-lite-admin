<template>
  <div v-loading="fullScreenLoading" class="app-container">
    <el-card shadow="never" class="mb-20">
      <el-form ref="form" :inline="false" :model="accountParams" label-width="80px" size="mini">
        <el-form-item label="账号">
          <el-input v-model="accountParams.account" placeholder="账号" class="input-box" @change="onSearch" @keyup.enter.native="handleFilter" />
        </el-form-item>
        <el-form-item label="手机号码">
          <el-input v-model="accountParams.mobile" placeholder="绑定号码" class="input-box" @change="onSearch" @keyup.enter.native="handleFilter" />
          <el-button type="text" style="padding-bottom: 0; padding-top: 0;" @click="showOrHideForm">
            {{ showMore ? '收起' : '展开' }}<i :class="showMore ? 'el-icon-arrow-up' : 'el-icon-arrow-down'" />
          </el-button>
        </el-form-item>
      </el-form>
      <el-form v-show="showMore" ref="moreForm" :inline="false" :model="accountParams" label-width="80px" size="mini">
        <el-form-item label="姓名">
          <el-input v-model="accountParams.name" placeholder="姓名" class="input-box" @change="onSearch" @keyup.enter.native="handleFilter" />
        </el-form-item>
        <el-form-item label="账号状态">
          <el-select v-model="accountParams.open" placeholder="请选择账号状态" @change="changeOpen">
            <el-option v-for="item in openList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="角色">
          <el-cascader placeholder="请选择角色" change-on-select :options="roleList" clearable class="input-box" @change="handleChange" />
          <!--<el-select v-model="accountParams.roleId" placeholder="请选择角色" class="class-input-box" @change="changeRole">
            <el-option
              v-for="item in roleList"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>-->
        </el-form-item>
      </el-form>
      <el-form :inline="false" label-width="80px" size="mini">
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
        <span class="flex1">账号列表</span>
        <div>
          <el-button type="primary" size="mini" :disabled="opaList.indexOf('add') === -1 ? true : false" @click="handleCreate">
            新增
          </el-button>
          <el-button type="primary" size="mini" :disabled="opaList.indexOf('verify') === -1 ? true : false" @click="batchOpen">
            批量启用
          </el-button>
          <el-button type="primary" size="mini" :disabled="opaList.indexOf('verify') === -1 ? true : false" @click="batchClose">
            批量停用
          </el-button>
          <el-button type="danger" size="mini" :disabled="opaList.indexOf('delete') === -1 ? true : false" @click="batchDeletion">
            批量删除
          </el-button>
        </div>
      </div>

      <el-table ref="accountTable" stripe :data="accountList" tooltip-effect="dark" style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column fixed type="selection" width="55" />
        <el-table-column label="账号">
          <template slot-scope="scope">
            <el-button type="text" size="medium" @click="handleDetail(scope.$index, scope.row)">
              {{ scope.row.account }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column prop="mobile" label="手机号码" />
        <el-table-column prop="name" label="姓名" />
        <!--<el-table-column prop="password" label="密码"></el-table-column>-->
        <el-table-column prop="createTime" label="创建时间" :formatter="loginTimeFormatter" />
        <el-table-column prop="open" label="账号状态" width="100" align="center">
          <template slot-scope="scope">
            <el-tooltip content="点击切换账号状态" placement="right" effect="light" transition="el-zoom-in-bottom">
              <el-button v-if="scope.row.open" type="success" size="mini" plain @click="handleOpen(scope.$index, scope.row)">
                启用
              </el-button>
              <el-button v-else type="info" size="mini" plain @click="handleOpen(scope.$index, scope.row)">
                停用
              </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="授权查询" width="280" align="center">
          <template slot-scope="scope">
            <el-button size="mini" :disabled="opaList.indexOf('query') === -1 ? true : false" @click="goAreaPermission(scope.$index, scope.row)">
              区域/学校授权
            </el-button>
            <el-button size="mini" :disabled="opaList.indexOf('query') === -1 ? true : false" @click="goRolePermission(scope.$index, scope.row)">
              角色授权
            </el-button>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="280" align="center">
          <template slot-scope="scope">
            <el-button size="mini" :disabled="opaList.indexOf('edit') === -1 ? true : false" @click="handleEdit(scope.$index, scope.row)">
              编辑
            </el-button>
            <el-button size="mini" :disabled="opaList.indexOf('edit') === -1 ? true : false" @click="handleEditPassword(scope.$index, scope.row)">
              重置密码
            </el-button>
            <el-button size="mini" type="danger" :disabled="opaList.indexOf('delete') === -1 ? true : false" @click="handleDelete(scope.$index, scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="accountParams.total > 0" :total="accountParams.total" :page.sync="accountParams.offSet" :limit.sync="accountParams.offSize" @pagination="getAccountList" />
    </el-card>

    <!--新建或编辑弹窗-->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="500px" @close="cancelData">
      <el-form ref="dataForm" :model="temp" :rules="rules" label-position="left" label-width="80px" style="margin-left:50px; margin-right: 50px;">
        <el-form-item label="账号" prop="account">
          <el-input v-model="temp.account" placeholder="账号" class="filter-item input-box" />
        </el-form-item>
        <el-form-item label="手机号码" prop="mobile">
          <el-input v-model="temp.mobile" placeholder="手机号码" class="filter-item input-box" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="temp.name" placeholder="姓名" class="filter-item input-box" />
        </el-form-item>
        <el-form-item label="是否启用">
          <el-switch v-model="temp.open" />
        </el-form-item>
        <el-form-item v-if="dialogStatus === 'create'" label="密码" prop="password">
          <el-input v-model="temp.password" show-password :type="temp.passwordType" placeholder="密码" class="filter-item input-box">
            <i slot="suffix" class="el-input__icon" :class="temp.passwordType === 'password' ? 'el-icon-view' : 'el-icon-ali-hide'" @click="changePass('edit')" />
          </el-input>
        </el-form-item>
        <el-form-item v-if="dialogStatus === 'create'" label="确认密码" prop="repassword">
          <el-input v-model="temp.repassword" show-password :type="temp.rePasswordType" placeholder="确认密码" class="filter-item input-box">
            <i slot="suffix" class="el-input__icon" :class="temp.rePasswordType === 'password' ? 'el-icon-view' : 'el-icon-ali-hide'" @click="changeRePass('edit')" />
          </el-input>
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
    <!--新建或编辑弹窗-end-->

    <!--修改密码弹窗-->
    <el-dialog title="修改密码" :visible.sync="dialogPasswordFormVisible" @close="cancelPasswordData">
      <el-form ref="passwordForm" :model="passwordTemp" :rules="passwordRules" label-position="left" label-width="80px" style="margin-left:50px; margin-right: 50px;">
        <el-form-item label="新密码" prop="password">
          <el-input v-model="passwordTemp.password" show-password :type="passwordTemp.passwordType" placeholder="新密码" class="filter-item input-box">
            <i slot="suffix" class="el-input__icon" :class="passwordTemp.passwordType === 'password' ? 'el-icon-view' : 'el-icon-ali-hide'" @click="changePass('password')" />
          </el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="repassword">
          <el-input v-model="passwordTemp.repassword" placeholder="确认密码" :type="passwordTemp.rePasswordType" class="filter-item input-box">
            <i slot="suffix" class="el-input__icon" :class="passwordTemp.rePasswordType === 'password' ? 'el-icon-view' : 'el-icon-ali-hide'" @click="changeRePass('password')" />
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelPasswordData">
          取消
        </el-button>
        <el-button type="primary" @click="updatePasswordData">
          确定
        </el-button>
      </div>
    </el-dialog>
    <!--修改密码弹窗-end-->
  </div>
</template>

<script>
import Pagination from '@/components/Pagination' // 分页
import { parseTime, common } from '../../../utils'
import { opaMixin } from '../../../utils/mixins'

export default {
  name: 'Account',
  components: { Pagination },
  filters: {},
  mixins: [opaMixin],
  data () {
    const validateMobile = (rule, value, callback) => {
      if (value === '') {
        callback()
      } else {
        const isMobile = common.isMobile(value)
        if (isMobile) {
          callback()
        } else {
          callback(new Error('含有非电话号码字符'))
        }
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (value.length < 6 || value.length > 20) {
        callback(new Error('密码只能在6-20位数之间'))
        return
      }
      const isPassword = common.isPasswd(value)
      if (isPassword) {
        callback()
      } else {
        callback(new Error('密码不符合规范'))
      }
    }
    const validateRePassword = (rule, value, callback) => {
      if (value === this.temp.password) {
        callback()
      } else {
        callback(new Error('与密码不一致'))
      }
    }
    const validateRePasswordPop = (rule, value, callback) => {
      if (value === this.passwordTemp.password) {
        callback()
      } else {
        callback(new Error('与密码不一致'))
      }
    }
    return {
      showMore: false,
      accountParams: {
        account: '',
        mobile: '',
        name: '',
        roleId: '',
        total: 0, // 总共条数
        offSet: 0, // 页面
        offSize: 10 // 一页的条数
      }, // 搜索条件
      openList: [{ value: '', label: '所有' }, { value: true, label: '启用' }, { value: false, label: '停用' }], // 状态列表
      roleList: [], // 角色列表
      accountList: [], // 账号列表
      fullScreenLoading: false,
      dialogFormVisible: false, // 是否显示编辑弹层
      temp: {
        id: 0,
        account: '',
        mobile: '',
        name: '',
        open: true,
        password: '',
        repassword: '',
        passwordType: 'password',
        rePasswordType: 'password'
      },
      modifyTemp: {
        id: 0,
        account: '',
        mobile: '',
        name: '',
        open: true
      },
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '创建'
      },
      rules: {
        account: [
          { required: true, message: '账号不能为空', trigger: 'blur' }
        ],
        mobile: [
          { trigger: 'blur', validator: validateMobile }
        ],
        name: [
          { required: true, message: '姓名不能为空', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '密码不能为空', trigger: 'blur' },
          { trigger: 'blur', validator: validatePassword }
        ],
        repassword: [
          { required: true, message: '密码不能为空', trigger: 'blur' },
          { trigger: 'blur', validator: validateRePassword }
        ]
      },
      selectArr: [], // 筛选的内容
      dialogPasswordFormVisible: false,
      passwordTemp: {
        password: '',
        repassword: '',
        passwordType: 'password',
        rePasswordType: 'password'
      },
      passwordRules: {
        password: [
          { required: true, message: '密码不能为空', trigger: 'blur' },
          { trigger: 'blur', validator: validatePassword }
        ],
        repassword: [
          { required: true, message: '密码不能为空', trigger: 'blur' },
          { trigger: 'blur', validator: validateRePasswordPop }
        ]
      }
    }
  },
  computed: {},
  watch: {},
  created () {},
  async mounted () {
    await this.getOpaList()
    this.$nextTick(() => {
      this.getRoleList()
      this.getAccountList()
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
    // 输入后回车执行搜索
    handleFilter () {
      this.onSearch()
    },
    // 搜索
    onSearch () {
      this.accountParams.offSet = 1
      this.getAccountList()
    },
    // 重置
    onReset () {
      this.accountParams = {
        account: '',
        mobile: '',
        name: '',
        roleId: '',
        total: 0, // 总共条数
        offSet: 0, // 页面
        offSize: 10 // 一页的条数
      }
      this.onSearch()
    },
    // 筛选账号状态
    changeOpen () {
      this.onSearch()
    },
    // 筛选角色
    handleChange (value) {
      const roleId = value[value.length - 1]
      this.accountParams.roleId = roleId
      this.onSearch()
    },
    // 获取账号列表
    getAccountList () {
      if (this.opaList.indexOf('list') === -1) { // 权限
        return
      }
      this.fullScreenLoading = true
      this.$nextTick(() => {
        const accountParams = Object.assign({}, this.accountParams)
        accountParams.offSet--
        this.$api.account.getBgUserList(accountParams).then((res) => {
          if (res.rcode === 300) {
            this.accountParams.total = res.data.totalPages
            this.accountList = res.data.userList
          }
          this.fullScreenLoading = false
        }).catch(() => {

        })
      })
    },
    // 获取角色列表
    getRoleList () {
      this.$api.role.geAllBgRoleTree().then((res) => {
        if (res.rcode === 300) {
          const roleList = res.data.roleList
          /* roleList = [
              {id: '1', name: '1', areaType: '大名', time: '2019-02-02',},
              {id: '2', name: '1-1', areaType: '大名', time: '2019-02-02', parentId: '1'},
              {id: '3', name: '1-1-1', areaType: '大名', time: '2019-02-02', parentId: '2'},
              {id: '4', name: '1-2', areaType: '大名', time: '2019-02-02', parentId: '1'},
              {id: '5', name: '1-2-2', areaType: '大名', time: '2019-02-02', parentId: '4'},
              {id: '6', name: '1-1-1-1', areaType: '大名', time: '2019-02-02', parentId: '3'},
              {id: '7', name: '2', areaType: '大名', time: '2019-02-02'}
            ]; */
          roleList.forEach((item) => {
            item.value = item.id
            item.label = item.name
          })
          this.roleList = common.translateDataToTree(roleList)
        }
      }).catch(() => {

      })
    },
    // 初始化新增内容
    resetTemp () {
      this.temp = {
        id: 0,
        account: '',
        mobile: '',
        name: '',
        open: true,
        password: '',
        repassword: '',
        passwordType: 'password',
        rePasswordType: 'password'
      }
    },
    // 新建账号
    handleCreate () {
      if (this.opaList.indexOf('add') === -1) { // 权限
        return
      }
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    // 批量启用
    batchOpen () {
      if (this.selectArr.length === 0) {
        // 请先选择要删除的项
        this.$message({
          message: '请先选择要启用的项',
          type: 'warning'
        })
        return
      }
      this.$confirm('启用已选中的账号，是否继续？', '提示', {
        type: 'warning'
      }).then(() => {
        const userIds = []
        this.selectArr.forEach((value) => {
          userIds.push(value.id)
        })
        const params = {
          ids: userIds,
          state: true
        }
        this.openUser(params).then((res) => {
          if (res.rcode === 300) {
            this.getAccountList()
            this.selectArr = []
          }
        })
      })
    },
    // 批量停用
    batchClose () {
      if (this.selectArr.length === 0) {
        // 请先选择要删除的项
        this.$message({
          message: '请先选择要停用的项',
          type: 'warning'
        })
        return
      }
      this.$confirm('停用已选中的账号，是否继续？', '提示', {
        type: 'warning'
      }).then(() => {
        const userIds = []
        this.selectArr.forEach((value) => {
          userIds.push(value.id)
        })
        const params = {
          ids: userIds,
          state: false
        }
        this.openUser(params).then((res) => {
          if (res.rcode === 300) {
            this.getAccountList()
            this.selectArr = []
          }
        })
      })
    },
    async openUser (params) {
      return await this.$api.account.resOpen(params)
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
      this.$confirm('删除已选中的账号，是否继续？', '提示', {
        type: 'warning'
      }).then(() => {
        const userIds = []
        this.selectArr.forEach((value) => {
          userIds.push(value.id)
        })
        // let userIds = userIdArr.join(',');
        this.delAccount(userIds).then((res) => {
          if (res.rcode === 300) {
            this.getAccountList()
            this.selectArr = []
          } else {
            // 错误提示
            this.$message.error(res.message)
          }
        })
      })
    },
    // 进行学生的删除
    async delAccount (ids) {
      const params = {
        ids
      }
      return await this.$api.account.delBgUser(params)
    },
    // 多选
    handleSelectionChange (val) {
      this.selectArr = val
    },
    // 过滤最后更新时间
    loginTimeFormatter (row, column) {
      if (row.createTime === 0) {
        return '无更新记录'
      } else {
        return parseTime(row.createTime, '{y}-{m}-{d}')
      }
    },
    // 账号启用或停用
    handleOpen (index, val) {
      const open = !val.open
      const userIds = [val.id]
      const params = {
        state: open,
        ids: userIds
      }
      this.openUser(params).then((res) => {
        if (res.rcode === 300) {
          this.accountList[index].open = !val.open
        }
      })
    },
    // 去地区授权
    goAreaPermission (index, row) {
      this.$router.push({
        path: '/accountManagement/accountAreaPermission/' + row.id + '/' + row.account
      })
    },
    goRolePermission (index, row) {
      this.$router.push({
        path: '/accountManagement/accountRolePermission/' + row.id + '/' + row.account
      })
    },
    // 查看详情
    handleDetail (index, row) {

    },
    // 编辑账号
    handleEdit (index, row) {
      this.temp = Object.assign({}, this.modifyTemp, row) // copy obj  修改不需要password
      // this.temp.repassword = row.password;
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    // 重置密码
    handleEditPassword (index, row) {
      this.resetPasswordTemp()
      this.dialogPasswordFormVisible = true
      this.passwordTemp.userId = row.id
      this.$nextTick(() => {
        this.$refs['passwordForm'].clearValidate()
      })
    },
    // 单个删除账号
    handleDelete (index, row) {
      this.$confirm('删除该账号，是否继续？', '提示', {
        type: 'warning'
      }).then(() => {
        this.delAccount([row.id]).then((res) => {
          if (res.rcode === 300) {
            this.accountList.splice(index, 1)
          } else {
            // 提示错误
            this.$message.error(res.message)
          }
        }).catch((err) => {

        })
      })
    },
    // 取消新建或编辑
    cancelData () {
      this.dialogFormVisible = false
    },
    // 改变密码输入框类型
    changePass (value = 'edit') {
      if (value === 'edit') {
        if (this.temp.passwordType === 'password') {
          this.temp.passwordType = 'text'
        } else {
          this.temp.passwordType = 'password'
        }
      } else {
        if (this.passwordTemp.passwordType === 'password') {
          this.passwordTemp.passwordType = 'text'
        } else {
          this.passwordTemp.passwordType = 'password'
        }
      }
    },
    // 改变重复密码输入框类型
    changeRePass (value = 'edit') {
      if (value === 'edit') {
        if (this.temp.rePasswordType === 'password') {
          this.temp.rePasswordType = 'text'
        } else {
          this.temp.rePasswordType = 'password'
        }
      } else {
        if (this.passwordTemp.rePasswordType === 'password') {
          this.passwordTemp.rePasswordType = 'text'
        } else {
          this.passwordTemp.rePasswordType = 'password'
        }
      }
    },
    // 确认创建
    createData () {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.$api.account.updateBgUser(this.temp).then((res) => {
            if (res.rcode === 300) {
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
              // 错误提示
            }
          }).catch(() => {

          })
        }
      })
    },
    // 确认修改
    updateData () {
      this.$refs['dataForm'].validate((valid) => { // 检查rule
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          this.$api.account.updateBgUser(this.temp).then((res) => {
            if (res.rcode === 300) {
              for (const v of this.accountList) {
                if (v.id === tempData.id) {
                  const index = this.accountList.indexOf(v)
                  this.accountList.splice(index, 1, this.temp)
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
    },

    // 初始化新增内容
    resetPasswordTemp () {
      this.passwordTemp = {
        password: '',
        repassword: '',
        passwordType: 'password',
        rePasswordType: 'password'
      }
    },
    updatePasswordData () {
      this.$refs['passwordForm'].validate((valid) => { // 检查rule
        if (valid) {
          const passwordTempData = Object.assign({}, this.passwordTemp)
          // passwordTempData.id = this.id;
          console.log(passwordTempData)
          this.$api.account.resPassword(passwordTempData).then((res) => {
            if (res.rcode === 300) {
              this.dialogPasswordFormVisible = false
              this.$notify({
                title: '成功',
                message: '重置成功',
                type: 'success',
                duration: 2000
              })
            }
          }).catch(() => {

          })
        }
      })
    },
    cancelPasswordData () {
      this.dialogPasswordFormVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
  .input-box {
    width: 178px;
  }
</style>

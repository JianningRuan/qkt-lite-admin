<template>
  <div v-loading="fullScreenLoading" class="app-container">
    <el-card shadow="never" class="mb-20">
      <el-form ref="form" :inline="true" :model="roleParams" label-width="80px" size="mini">
        <el-form-item label="关键字">
          <el-input v-model="roleParams.name" placeholder="可输入角色姓名或鉴权角色名称" class="search-input-box" @change="onSearch" @keyup.enter.native="handleFilter" />
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
        <span class="flex1">角色列表</span>
        <div>
          <el-button type="primary" size="mini" :disabled="opaList.indexOf('add') === -1 ? true : false" @click="handleCreate">
            新增
          </el-button>
          <!--<el-button type="danger" @click="batchDeletion" size="mini" :disabled="opaList.indexOf('delete') === -1 ? true : false">批量删除</el-button>-->
        </div>
      </div>
      <el-table ref="roleTable" stripe :data="roleList" tooltip-effect="dark" style="width: 100%" @selection-change="handleSelectionChange">
        <!--<el-table-column fixed type="selection" width="55"></el-table-column>-->
        <el-table-column prop="name" label="角色名称" />
        <el-table-column prop="parentName" label="父角色名称" />
        <el-table-column prop="roleName" label="鉴权角色名称" />
        <el-table-column prop="createTime" label="创建时间" :formatter="loginTimeFormatter" />
        <el-table-column prop="open" label="操作" width="260">
          <template slot-scope="scope">
            <el-button v-if="scope.row.id !== 1" size="mini" @click="handleGoPermission(scope.$index, scope.row)">
              操作授权
            </el-button>
            <el-button v-if="scope.row.id !== 1 && scope.row.id !== 2" size="mini" :disabled="opaList.indexOf('edit') === -1 ? true : false" @click="handleEdit(scope.$index, scope.row)">
              编辑
            </el-button>
            <el-button v-if="scope.row.id !== 1 && scope.row.id !== 2" type="danger" size="mini" :disabled="opaList.indexOf('delete') === -1 ? true : false" @click="handleDelete(scope.$index, scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="roleParams.total > 0" :total="roleParams.total" :page.sync="roleParams.offSet" :limit.sync="roleParams.offSize" @pagination="getRoleList" />
    </el-card>

    <!--新建或编辑角色弹窗-->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="890px" @close="cancelData">
      <el-form ref="dataForm" :model="temp" :rules="rules" label-position="left" label-width="120px" style="margin-left:50px; margin-right: 50px;">
        <el-form-item label="父角色">
          <el-cascader
            v-model="selectedOptions"
            placeholder="请选择父角色，可搜索"
            :options="selectRoleList"
            :show-all-levels="false"
            filterable
            clearable
            change-on-select
          />
        </el-form-item>
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="temp.name" placeholder="角色名称" class="filter-item input-box" />
        </el-form-item>
        <el-form-item label="鉴权角色名称" prop="roleName">
          <el-input v-model="temp.roleName" placeholder="鉴权角色名称" class="filter-item input-box" />
          <p class="tips">
            一定要ROLE_开头且只能是非中文
          </p>
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
    <!--新建或编辑角色弹窗-end-->

    <!--<tree-table ref="roleTable" :data="roleData" :eval-func="func" :eval-args="args" :expand-all="expandAll" @getChild="getTreeChild" border>
      <el-table-column
        type="selection"
        width="55">
      </el-table-column>
      <el-table-column label="角色">
        <template slot-scope="scope">
          <span style="color:sandybrown">{{ scope.row.roleName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建人" prop="createUser"></el-table-column>
      <el-table-column label="修改时间" prop="time"></el-table-column>
      <el-table-column label="操作" width="200">
        <template slot-scope="scope">
          <el-button type="text" @click="message(scope.row)">点击</el-button>
        </template>
      </el-table-column>
    </tree-table>-->
  </div>
</template>

<script>
import Pagination from '@/components/Pagination' // 分页
import { parseTime, common } from '../../../utils'
import { opaMixin } from '../../../utils/mixins'

import treeTable from '@/components/TreeTable'
import treeToArray from './customEval'

export default {
  name: 'Role',
  components: {
    Pagination,
    treeTable
  },
  filters: {},
  mixins: [opaMixin],
  data () {
    const validateRoleName = (rule, value, callback) => {
      const hasValue = value.indexOf('ROLE_')
      const reg = new RegExp('^\\w+$')
      if (hasValue !== 0) {
        callback(new Error('必须含有"ROLE_"开头'))
        return
      }
      if (value.length <= 5) {
        callback(new Error('"ROLE_"后面请加上自定义名字'))
        return
      }
      if (!reg.test(value)) {
        callback(new Error('只能含有英文字母、数字和下划线'))
        return
      }
      callback()
    }
    return {
      func: treeToArray,
      fullScreenLoading: false,
      roleParams: {
        name: '',
        offSet: 0,
        offSize: 10,
        total: 0
      },
      roleList: [],
      dialogFormVisible: false, // 是否显示编辑弹层
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '创建'
      },
      temp: {
        id: 0,
        name: '',
        roleName: 'ROLE_',
        parentId: 0,
        parentName: ''
      },
      rules: {
        name: [
          { required: true, message: '中文名字不能为空', trigger: 'blur' }
        ],
        roleName: [
          { required: true, message: '授权名字不能为空', trigger: 'blur' },
          { trigger: 'blur', validator: validateRoleName }
        ]
      },
      selectRoleList: [],
      selectRoleCopyList: [],
      selectedOptions: [], // "1", "2"
      delArr: [],

      roleData: [{
        id: 1,
        roleName: '小明',
        createUser: '大名',
        time: '2019-02-02',
        children: [
          {
            id: 2,
            roleName: '小明',
            createUser: '大名',
            time: '2019-02-02',
            children: [
              {
                id: 5,
                roleName: '小明',
                createUser: '大名',
                time: '2019-02-02',
                children: null
              }
            ]
          },
          {
            id: 4,
            roleName: '小明1',
            createUser: '大名1',
            time: '2019-02-02',
            children: []
          }
        ]
      }],
      expandAll: false,
      args: [null, null, 'roleName']
    }
  },
  computed: {},
  watch: {
    selectedOptions (newVal) {
      if (newVal.length > 0) {
        this.temp.parentId = newVal[newVal.length - 1]
      } else {
        this.temp.parentId = 0
      }
    }
  },
  created () {},
  async mounted () {
    await this.getOpaList()
    this.$nextTick(() => {
      this.getRoleList()
    })
  },
  activated () {
  },
  destroyed () {
  },
  methods: {
    // 获取角色列表
    getRoleList () {
      if (this.opaList.indexOf('list') === -1) { // 权限
        return
      }
      this.fullScreenLoading = true
      this.$nextTick(() => {
        const roleParams = Object.assign({}, this.roleParams)
        roleParams.offSet--
        this.$api.role.getBgRoleList(roleParams).then((res) => {
          if (res.rcode === 300 && res.data !== null) {
            this.roleParams.total = res.data.totalPages
            this.roleList = res.data.roleList
          }
          this.fullScreenLoading = false
        }).catch(() => {

        })
      })
    },
    // 获取角色树列表
    async getRoleTreeList (roleId = '') {
      const params = {
        roleId
      }
      return await this.$api.role.geAllBgRoleTree(params)
    },
    // 搜索
    onSearch () {
      this.roleParams.offSet = 1
      this.getRoleList()
    },
    // 重置
    onReset () {
      this.roleParams = {
        name: '',
        offSet: 0,
        offSize: 10,
        total: 0
      }
      this.getRoleList()
    },
    resetTemp () {
      this.temp = {
        id: 0,
        name: '',
        roleName: 'ROLE_',
        parentId: 0,
        parentName: ''
      }
    },
    // 新增
    handleCreate () {
      this.resetTemp()
      this.getRoleTreeList().then((res) => {
        if (res.rcode === 300) {
          const roleTreeList = res.data.roleList
          this.selectRoleCopyList = res.data.roleList
          /* roleTreeList = [
              {id: '1', name: '1', areaType: '大名', time: '2019-02-02',},
              {id: '2', name: '1-1', areaType: '大名', time: '2019-02-02', parentId: '1'},
              {id: '3', name: '1-1-1', areaType: '大名', time: '2019-02-02', parentId: '2'},
              {id: '4', name: '1-2', areaType: '大名', time: '2019-02-02', parentId: '1'},
              {id: '5', name: '1-2-2', areaType: '大名', time: '2019-02-02', parentId: '4'},
              {id: '6', name: '1-1-1-1', areaType: '大名', time: '2019-02-02', parentId: '3'},
              {id: '7', name: '2', areaType: '大名', time: '2019-02-02'}
            ]; */
          roleTreeList.forEach((item) => {
            item.value = item.id
            item.label = item.name
          })
          this.selectRoleList = common.translateDataToTree(roleTreeList)
        }
      })
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
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
      this.$confirm('删除所选角色，是否继续？', '提示', {
        type: 'warning'
      }).then(() => {
        const roleIds = []
        this.delArr.forEach((value) => {
          roleIds.push(value.id)
        })
        this.delRole(roleIds).then((res) => {
          if (res.rcode === 300) {
            this.getRoleList()
          } else {
            // 错误提示
            this.$message.error(res.message)
          }
        }).catch(() => {

        })
      })
    },
    // 勾选
    handleSelectionChange (val) {
      this.delArr = val
    },
    // 过滤时间
    loginTimeFormatter (row, column) {
      if (row.createTime === 0) {
        return '无更新记录'
      } else {
        return parseTime(row.createTime, '{y}-{m}-{d}')
      }
    },
    handleGoPermission (index, row) {
      this.$router.push({
        path: `/roleManagement/rolePermission/${row.id}/${row.name}`
      })
    },
    async handleEdit (index, row) {
      let parentId = ''
      const params = {
        roleId: row.id
      }
      const res = await this.$api.role.getBgRoleDetail(params)
      if (res.rcode === 300) {
        this.temp = Object.assign({}, this.temp, row, res.data) // copy obj
        parentId = res.data.parentId
        /* if (parentId !== ''){
            this.selectedOptions = [res.data.parentId]
          } */
      }
      this.getRoleTreeList(row.id).then((resp) => {
        if (resp.rcode === 300) {
          const roleTreeList = resp.data.roleList
          this.selectRoleCopyList = resp.data.roleList
          /* roleTreeList = [
              {id: '1', name: '1', areaType: '大名', time: '2019-02-02',},
              {id: '2', name: '1-1', areaType: '大名', time: '2019-02-02', parentId: '1'},
              {id: '3', name: '1-1-1', areaType: '大名', time: '2019-02-02', parentId: '2'},
              {id: '4', name: '1-2', areaType: '大名', time: '2019-02-02', parentId: '1'},
              {id: '5', name: '1-2-2', areaType: '大名', time: '2019-02-02', parentId: '4'},
              {id: '6', name: '1-1-1-1', areaType: '大名', time: '2019-02-02', parentId: '3'},
              {id: '7', name: '2', areaType: '大名', time: '2019-02-02'}
            ]; */
          roleTreeList.forEach((item) => {
            item.value = item.id
            item.label = item.name
          })
          this.selectRoleList = common.translateDataToTree(roleTreeList)
          if (this.temp.parentId !== '') {
            this.getParentArr(parentId)
            /* this.selectRoleList.forEach((value)=>{
                if (value.id === parentId && value.parentName !== '') {
                  let detailParams = {
                    roleId: value.id
                  };
                  this.$api.role.getBgRoleDetail(detailParams).then((res)=>{
                    if (res.rcode === 300) {
                      parentId = res.data.parentId;
                      this.selectedOptions.unshift(res.data.parentId);
                    }
                  });
                }
              }) */
          }
        }
      })
      // 赋值父角色id
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    getParentArr (parent) { // 根据最后一个id，获取编辑中锁需的父类id列表
      for (let i = 0, l = this.selectRoleCopyList.length; i < l; i++) {
        const value = this.selectRoleCopyList[i]
        if (value.id === parent) {
          this.selectedOptions.unshift(value.id)
          if (value.parentName !== '') {
            const detailParams = {
              roleId: value.id
            }
            this.$api.role.getBgRoleDetail(detailParams).then((res) => {
              if (res.rcode === 300) {
                this.getParentArr(res.data.parentId)
              }
            })
          }
          break
        }
      }
    },
    handleDelete (index, row) {
      this.$confirm('删除该角色，是否继续？', '提示', {
        type: 'warning'
      }).then(() => {
        this.delRole([row.id]).then((res) => {
          if (res.rcode === 300) {
            this.getRoleList()
            // this.roleList.splice(index, 1);
          } else {
            // 错误提示
            this.$message.error(res.message)
          }
        }).catch(() => {

        })
      })
    },
    // 删除角色
    async delRole (ids) {
      const params = {
        ids
      }
      return await this.$api.role.delBgRole(params)
    },
    // 输入搜索信息回车
    handleFilter () {
      this.onSearch()
    },
    message () {},
    getTreeChild (row) {
      let a = null; let b = null
      for (let i = 0, l = this.roleData.length; i < l; i++) {
        if (this.roleData[i].id === row.id) {
          a = i
          break
        }
        const children = this.roleData[i].children
        if (children.length > 0) {
          for (let k = 0, h = children.length; k < h; k++) {
            if (children[k].id === row.id) {
              a = i
              b = k
              break
            }
          }
        }
      }
      this.roleData[a].children[b].children = [{
        id: 4,
        roleName: '小明2',
        createUser: '大名2',
        time: '2019-02-02',
        children: null
      }]
    },

    // 关闭弹窗
    cancelData () {
      this.dialogFormVisible = false
      this.selectedOptions = []
    },
    // 确认创建
    createData () {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.$api.role.updateBgRole(this.temp).then((res) => {
            if (res.rcode === 300) {
              this.selectedOptions = []
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
          this.$api.role.updateBgRole(tempData).then((res) => {
            if (res.rcode === 300) {
              /* for (const v of this.roleList) {
                  if (v.id === tempData.id) {
                    const index = this.roleList.indexOf(v);
                    this.roleList.splice(index, 1, this.temp);
                    break
                  }
                } */
              this.getRoleList()
              this.dialogFormVisible = false
              this.selectedOptions = []
              this.$notify({
                title: '成功',
                message: '更新成功',
                type: 'success',
                duration: 2000
              })
            } else {

            }
          }).catch(() => {

          })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .search-input-box {
    width: 220px;
  }
  .tips {
    color: #8492a6; font-size: 13px; line-height: 20px; word-break:break-all;
  }
</style>

<template>
  <div v-loading="fullScreenLoading" class="app-container">
    <el-card shadow="never">
      <div slot="header" class="flex flex-pack-justify flex-align-center">
        <span class="flex1">菜单关联列表</span>
        <div>
          <el-button type="primary" size="mini" :disabled="opaList.indexOf('add') === -1 ? true : false" @click="handleCreate">
            添加操作
          </el-button>
          <el-button type="danger" size="mini" :disabled="opaList.indexOf('delete') === -1 ? true : false" @click="batchDeletion">
            批量删除
          </el-button>
        </div>
      </div>

      <el-table ref="permissionTable" stripe :data="permissionList" tooltip-effect="dark" style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column fixed type="selection" width="55" />
        <el-table-column prop="name" label="操作名称" />
        <el-table-column prop="code" label="操作代码" />
        <el-table-column prop="type" label="标签类型" align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.type === 1" type="success" size="mini">
              公共
            </el-tag>
            <el-tag v-else type="info" size="mini">
              列表
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="url" label="操作地址" />
        <el-table-column label="操作" align="center" width="200">
          <template slot-scope="scope">
            <el-button size="mini" :disabled="opaList.indexOf('edit') === -1 ? true : false" @click="handleEdit(scope.$index, scope.row)">
              编辑
            </el-button>
            <el-button size="mini" type="danger" :disabled="opaList.indexOf('delete') === -1 ? true : false" @click="handleDelete(scope.$index, scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!--创建或编辑弹窗-->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="500px" @close="cancelData">
      <el-form ref="dataForm" :model="temp" :rules="rules" label-position="left" label-width="80px" style="margin-left:50px; margin-right: 50px;">
        <el-form-item label="操作名称" prop="name">
          <el-input v-model="temp.name" placeholder="操作名称" class="filter-item input-box" />
        </el-form-item>
        <el-form-item label="操作代码" prop="code">
          <el-select v-model="temp.codeList" multiple filterable allow-create default-first-option :multiple-limit="limit" placeholder="请选择" style="width: 100%;" @change="changeCode">
            <!--<el-select v-model="temp.code" placeholder="请选择" style="width: 100%;">-->
            <el-option
              v-for="item in codeList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="操作类型" prop="type">
          <el-select v-model="temp.type" placeholder="请选择" style="width: 100%;">
            <el-option
              v-for="item in typeList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="请求地址" prop="url">
          <el-input v-model="temp.url" placeholder="请求地址" class="filter-item input-box" />
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
    <!--创建或编辑弹窗-end-->
  </div>
</template>

<script>
import { opaMixin } from '../../../utils/mixins'

export default {
  name: 'MenuPermission',
  components: {},
  filters: {},
  mixins: [opaMixin],
  data () {
    return {
      fullScreenLoading: false,
      permissionList: [],
      delArr: [],
      temp: {
        id: 0,
        name: '',
        code: '',
        codeList: [],
        menuId: '',
        type: 1,
        url: ''
      },
      dialogFormVisible: false, // 是否显示编辑弹层
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '创建'
      },
      rules: {
        name: [{ required: true, message: '操作名称不能为空', trigger: 'blur' }],
        code: [{ required: true, message: '操作代码不能为空', trigger: 'change' }],
        type: [{ required: true, message: '标签类型不能为空', trigger: 'change' }],
        url: [{ required: true, message: '操作地址不能为空', trigger: 'blur' }]
      },
      codeList: [{ value: 'list', label: 'list' }, { value: 'query', label: 'query' }, { value: 'add', label: 'add' }, { value: 'edit', label: 'edit' }, { value: 'delete', label: 'delete' }, { value: 'impl', label: 'impl' }, { value: 'verify', label: 'verify' }, { value: 'exp', label: 'exp' }],
      typeList: [{ value: 1, label: '公共标签' }, { value: 2, label: '列表标签' }],
      limit: 1
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
      this.getPermissionList()
    })
  },
  activated () {
  },
  destroyed () {
  },
  methods: {
    // 获取关联操作
    getPermissionList () {
      if (this.opaList.indexOf('list') === -1) { // 权限
        return
      }
      const params = {
        menuId: this.id
      }
      this.$api.menu.getPermissionListByMenu(params).then((res) => {
        if (res.rcode === 300 && res.data !== null) {
          this.permissionList = res.data.permissionList
        }
        this.fullScreenLoading = false
      }).catch((err) => {
        this.fullScreenLoading = false
      })
    },
    // 重置模板
    resetTemp () {
      this.temp = {
        id: 0,
        name: '',
        code: '',
        codeList: [],
        menuId: '',
        type: 1,
        url: ''
      }
    },
    // 创建
    handleCreate () {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    // 选择code的时候
    changeCode (val) {
      this.temp.code = val[0]
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
        const permissionIds = []
        this.delArr.forEach((value) => {
          permissionIds.push(value.id)
        })
        this.delPermission(permissionIds).then((res) => {
          if (res.rcode === 300) {
            this.getPermissionList()
          } else {
            // 错误提示
            this.$message.error(res.message)
          }
        }).catch(() => {})
      })
    },
    // 删除操作
    async delPermission (ids) {
      const params = {
        ids
      }
      return await this.$api.menu.delPermission(params)
    },
    // 勾选
    handleSelectionChange (val) {
      this.delArr = val
    },
    // 编辑
    handleEdit (index, row) {
      this.resetTemp()
      this.temp = Object.assign({}, this.temp, row) // copy obj
      this.temp.codeList = [row.code]
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    // 单个删除
    handleDelete (index, row) {
      this.$confirm('删除该关联操作，是否继续？', '提示', {
        type: 'warning'
      }).then(() => {
        this.delPermission([row.id]).then((res) => {
          if (res.rcode === 300) {
            this.getPermissionList()
            // this.permissionList.splice(index, 1);
          } else {
            // 错误提示
            this.$message.error(res.message)
          }
        }).catch(() => {

        })
      })
    },
    // 关闭弹层
    cancelData () {
      this.dialogFormVisible = false
    },
    // 确认创建
    createData () {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.menuId = this.id
          this.$api.menu.updatePermission(this.temp).then((res) => {
            if (res.rcode === 300) {
              this.dialogFormVisible = false
              this.$notify({
                title: '成功',
                message: '创建成功',
                type: 'success',
                duration: 2000
              })
              this.getPermissionList()
            } else {

            }
          }).catch(() => {

          })
        }
      })
    },
    // 确认更新
    updateData () {
      this.$refs['dataForm'].validate((valid) => { // 检查rule
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          this.temp.menuId = this.id
          this.$api.menu.updatePermission(this.temp).then((res) => {
            if (res.rcode === 300) {
              for (const v of this.permissionList) {
                if (v.id === tempData.id) {
                  const index = this.permissionList.indexOf(v)
                  this.permissionList.splice(index, 1, this.temp)
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

            }
          }).catch(() => {

          })
        }
      })
    }
  }
}
</script>

<style scoped>

</style>

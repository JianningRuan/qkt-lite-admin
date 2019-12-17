<template>
  <div v-loading="fullScreenLoading" class="app-container">
    <el-card shadow="never">
      <div slot="header" class="flex flex-pack-justify flex-align-center">
        <span class="flex1">角色权限列表</span>
        <div>
          <el-button type="primary" size="mini" :disabled="opaList.indexOf('add') === -1 ? true : false" @click="handleCreatePermission">
            添加操作
          </el-button>
          <el-button type="danger" size="mini" :disabled="opaList.indexOf('delete') === -1 ? true : false" @click="batchDeletionPermission">
            批量删除
          </el-button>
        </div>
      </div>

      <el-table ref="permissionTable" stripe :data="permissionList" tooltip-effect="dark" style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column fixed type="selection" width="55" />
        <el-table-column prop="name" label="操作名称" />
        <el-table-column prop="code" label="操作代码" />
        <el-table-column prop="type" label="操作类型" width="100" align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.type === 1" type="success" size="mini">
              公共
            </el-tag>
            <el-tag v-else size="mini">
              列表
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="menuName" label="所属菜单" />
        <el-table-column prop="url" label="请求地址" />
        <el-table-column prop="createTime" label="添加时间" :formatter="loginTimeFormatter" />
        <el-table-column label="操作" align="center" width="200">
          <template slot-scope="scope">
            <el-button size="mini" type="danger" :disabled="opaList.indexOf('delete') === -1 ? true : false" @click="handleDelete(scope.$index, scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="permissionParams.total > 0" :total="permissionParams.total" :page.sync="permissionParams.offSet" :limit.sync="permissionParams.offSize" @pagination="getPermissionList" />
    </el-card>

    <!--添加操作弹窗-->
    <el-dialog title="添加操作" :visible.sync="dialogFormVisible" width="890px" @close="cancelData">
      <el-form label-position="left" label-width="80px">
        <el-form-item label="选择菜单">
          <el-cascader
            v-model="selectedOptions"
            placeholder="请选择菜单"
            change-on-select
            :show-all-levels="false"
            :options="menuList"
            style="width: 100%;"
            @change="handleChange"
          />
        </el-form-item>
      </el-form>

      <el-table ref="permissionTable" stripe border :data="canSelectPermissionList" tooltip-effect="dark" max-height="400" style="width: 100%" @selection-change="handlePermissionChange">
        <el-table-column fixed type="selection" width="55" />
        <el-table-column prop="name" label="操作名称" />
        <el-table-column prop="code" label="操作代码" />
        <el-table-column prop="type" label="标签类型" align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.type === 1" type="success" size="mini">
              公共
            </el-tag>
            <el-tag v-else size="mini">
              列表
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="url" label="操作地址" />
      </el-table>

      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelData">
          取消
        </el-button>
        <el-button type="primary" @click="updateData">
          确定
        </el-button>
      </div>
    </el-dialog>
    <!--添加操作弹窗-end-->
  </div>
</template>

<script>
import Pagination from '@/components/Pagination' // 分页
import { parseTime, common } from '../../../utils'
import { opaMixin } from '../../../utils/mixins'

export default {
  name: 'RolePermission',
  components: { Pagination },
  filters: {},
  mixins: [opaMixin],
  data () {
    return {
      id: '',
      title: '',
      fullScreenLoading: false,
      permissionParams: {
        total: 0, // 总共条数
        offSet: 0, // 页面
        offSize: 10 // 一页的条数
      },
      permissionList: [],
      menuList: [],
      dialogFormVisible: false,
      selectedOptions: [],
      canSelectPermissionList: [],
      selectPermissionList: [],
      delArr: []
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
    // 获取操作列表
    getPermissionList () {
      if (this.opaList.indexOf('list') === -1) {
        return
      }
      this.fullScreenLoading = true
      const permissionParams = Object.assign({}, this.permissionParams)
      permissionParams.offSet--
      permissionParams.roleId = this.id
      this.$api.role.getPermissionListByRole(permissionParams).then((res) => {
        if (res.rcode === 300) {
          this.permissionParams.total = res.data.totalPages
          this.permissionList = res.data.permissionList
        }
        this.fullScreenLoading = false
      }).catch(() => {
        this.fullScreenLoading = false
      })
    },
    // 增加操作
    handleCreatePermission () {
      this.dialogFormVisible = true

      this.$api.menu.getAllMenuTree().then((res) => {
        if (res.rcode === 300) {
          const menuList = res.data.menuList
          /* menuList = [
              {id: '1', name: '1', areaType: '大名', time: '2019-02-02',},
              {id: '2', name: '1-1', areaType: '大名', time: '2019-02-02', parentId: '1'},
              {id: '3', name: '1-1-1', areaType: '大名', time: '2019-02-02', parentId: '2'},
              {id: '4', name: '1-2', areaType: '大名', time: '2019-02-02', parentId: '1'},
              {id: '5', name: '1-2-2', areaType: '大名', time: '2019-02-02', parentId: '4'},
              {id: '6', name: '1-1-1-1', areaType: '大名', time: '2019-02-02', parentId: '3'},
              {id: '7', name: '2', areaType: '大名', time: '2019-02-02'}
            ]; */
          menuList.forEach((item) => {
            item.value = item.id
            item.label = item.title
          })
          this.menuList = common.translateDataToTree(menuList)
        }
      })
    },
    // 批量删除
    batchDeletionPermission () {
      if (this.delArr.length === 0) {
        // 请先选择要删除的项
        this.$message({
          message: '请先选择要删除的项',
          type: 'warning'
        })
        return
      }
      this.$confirm('取消所选操作的授权，是否继续？', '提示', {
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
        }).catch(() => {

        })
      })
    },
    // 删除操作
    async delPermission (permissionIds) {
      const params = {
        permissionIds,
        roleId: this.id,
        type: 2
      }
      return await this.$api.role.resPermissionByRole(params)
    },
    // 勾选删除的项
    handleSelectionChange (val) {
      this.delArr = val
    },
    // 过滤最后更新时间
    loginTimeFormatter (row, column) {
      if (row.createTime === 0) {
        return '无添加记录'
      } else {
        return parseTime(row.createTime, '{y}-{m}-{d}')
      }
    },
    // 单个删除
    handleDelete (index, row) {
      this.$confirm('取消该操作的授权，是否继续？', '提示', {
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
    // 关闭弹窗
    cancelData () {
      this.dialogFormVisible = false
    },
    // 选择菜单
    handleChange (value) {
      const menuId = value[value.length - 1]
      const params = {
        menuId,
        roleId: this.id
      }
      this.$api.menu.getPermissionListByMenu(params).then((res) => {
        if (res.rcode === 300) {
          this.canSelectPermissionList = res.data.permissionList
        }
      })
    },
    // 勾选添加的操作
    handlePermissionChange (val) {
      this.selectPermissionList = val
    },
    // 确认添加操作
    updateData () {
      if (this.selectPermissionList.length === 0) {
        // 请先选择要删除的项
        this.$message({
          message: '请先选择要添加的项',
          type: 'warning'
        })
        return
      }
      const permissionIds = []
      this.selectPermissionList.forEach((value) => {
        permissionIds.push(value.id)
      })
      const params = {
        permissionIds,
        roleId: this.id,
        type: 1
      }
      this.$api.role.resPermissionByRole(params).then((res) => {
        if (res.rcode === 300) {
          this.dialogFormVisible = false
          this.getPermissionList()
          this.selectPermissionList = []
          this.canSelectPermissionList = []
          this.selectedOptions = []
          this.$notify({
            title: '成功',
            message: '添加成功',
            type: 'success',
            duration: 2000
          })
        }
      }).catch(() => {

      })
    }
  }
}
</script>

<style scoped>

</style>

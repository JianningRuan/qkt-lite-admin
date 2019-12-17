<template>
  <div class="app-container">
    <el-card shadow="never">
      <div slot="header" class="flex flex-pack-justify flex-align-center">
        <span class="flex1">授权角色列表</span>
        <div>
          <el-button type="primary" size="mini" :disabled="opaList.indexOf('add') === -1 ? true : false" @click="handleCreateRole">
            添加角色
          </el-button>
          <el-button type="danger" size="mini" :disabled="opaList.indexOf('delete') === -1 ? true : false" @click="batchDeletionRole">
            批量取消授权
          </el-button>
        </div>
      </div>

      <el-table ref="roleTable" stripe :data="roleList" tooltip-effect="dark" style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column fixed type="selection" width="55" />
        <el-table-column prop="name" label="角色名称" />
        <el-table-column prop="createTime" label="添加授权时间" :formatter="loginTimeFormatter" />
        <el-table-column label="操作" align="center" width="200">
          <template slot-scope="scope">
            <el-button size="mini" type="danger" :disabled="opaList.indexOf('delete') === -1 ? true : false" @click="handleDelete(scope.$index, scope.row)">
              取消授权
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!--可选角色弹窗-->
    <el-dialog title="授权角色选择" :visible.sync="dialogFormVisible" width="500px" @close="cancelData">
      <el-tree
        ref="roleTree"
        :data="canSelectRoleList"
        show-checkbox
        check-strictly
        node-key="id"
        :props="defaultProps"
      />
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelData">
          取消
        </el-button>
        <el-button type="primary" @click="updateData">
          确定
        </el-button>
      </div>
    </el-dialog>
    <!--可选角色弹窗-end-->
  </div>
</template>

<script>
import { parseTime, common } from '../../../utils'
import { opaMixin } from '../../../utils/mixins'

export default {
  name: 'AccountRolePermission',
  components: {},
  filters: {},
  mixins: [opaMixin],
  data () {
    return {
      id: '',
      title: '',
      roleList: [],
      delArr: [],
      dialogFormVisible: false,
      canSelectRoleList: [],
      defaultProps: {
        children: 'children',
        label: 'label'
      }
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
      this.getRoleList()
    })
  },
  activated () {
  },
  destroyed () {
  },
  methods: {
    // 获取已授权角色
    getRoleList () {
      if (this.opaList.indexOf('list') === -1) {
        return
      }
      const params = {
        userId: this.id
      }
      this.$api.account.getRoleByUser(params).then((res) => {
        if (res.rcode === 300 && res.data !== null) {
          this.roleList = res.data.roleList
        }
      })
    },
    // 打开添加角色弹窗
    handleCreateRole () {
      this.dialogFormVisible = true
      const params = {
        userId: this.id
      }
      this.$api.account.getAllRoleList(params).then((res) => {
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
          this.canSelectRoleList = common.translateDataToTree(roleList)
        }
      })
    },
    // 批量删除
    batchDeletionRole () {
      if (this.delArr.length === 0) {
        // 请先选择要删除的项
        this.$message({
          message: '请先选择需要取消授权的项',
          type: 'warning'
        })
        return
      }
      this.$confirm('取消所选角色的授权，是否继续？', '提示', {
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
            this.$message.error(res.message)
          }
        }).catch(() => {

        })
      })
    },
    // 删除操作
    async delRole (roleIds) {
      const params = {
        roleIds,
        type: 2,
        userId: this.id
      }
      return await this.$api.account.resUserRole(params)
    },
    // 勾选
    handleSelectionChange (val) {
      this.delArr = val
    },
    // 过滤最后更新时间
    loginTimeFormatter (row, column) {
      if (row.createTime === 0) {
        return '无更新记录'
      } else {
        return parseTime(row.createTime, '{y}-{m}-{d}')
      }
    },
    // 单项删除
    handleDelete (index, row) {
      this.$confirm('取消该角色的授权，是否继续？', '提示', {
        type: 'warning'
      }).then(() => {
        this.delRole([row.id]).then((res) => {
          if (res.rcode === 300) {
            this.roleList.splice(index, 1)
          } else {
            // 提示错误
            this.$message.error(res.message)
          }
        }).catch((err) => {

        })
      })
    },
    // 确认授权
    updateData () {
      const keys = this.$refs.roleTree.getCheckedKeys()
      if (keys.length === 0) {
        // 请先选择要删除的项
        this.$message({
          message: '请先选择要授权的项',
          type: 'warning'
        })
        return
      }
      const params = {
        roleIds: keys,
        type: 1,
        userId: this.id
      }
      this.$api.account.resUserRole(params).then((res) => {
        if (res.rcode === 300) {
          this.dialogFormVisible = false
          this.getRoleList()
          this.$notify({
            title: '成功',
            message: '授权成功',
            type: 'success',
            duration: 2000
          })
        }
      })
    },
    // 关闭授权角色弹窗
    cancelData () {
      this.dialogFormVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
  .table-tit {
    line-height: 40px;
    color: #333;
    font-size: 16px;
    font-weight: bold;
  }
</style>

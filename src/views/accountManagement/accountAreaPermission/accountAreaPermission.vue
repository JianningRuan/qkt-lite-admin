<template>
  <div class="app-container">
    <el-row :gutter="40">
      <el-col :span="12">
        <el-card shadow="never">
          <div slot="header" class="flex flex-pack-justify flex-align-center">
            <span class="flex1">授权区域列表</span>
            <div>
              <el-button type="primary" size="mini" :disabled="opaList.indexOf('add') === -1 ? true : false" @click="handleCreateArea">
                添加区域
              </el-button>
              <el-button type="danger" size="mini" :disabled="opaList.indexOf('delete') === -1 ? true : false" @click="batchDeletionArea">
                批量取消授权
              </el-button>
            </div>
          </div>

          <el-table ref="accountAreaTable" stripe border :data="accountAreaList" tooltip-effect="dark" max-height="500" style="width: 100%" @selection-change="handleSelectionChange">
            <el-table-column fixed type="selection" width="55" />
            <el-table-column prop="provinceName" label="省份" />
            <el-table-column prop="cityName" label="城市" />
            <el-table-column prop="townName" label="镇区" />
            <el-table-column prop="createTime" label="添加授权时间" :formatter="loginTimeFormatter" />
            <el-table-column label="操作" align="center">
              <template slot-scope="scope">
                <el-button size="mini" type="danger" :disabled="opaList.indexOf('delete') === -1 ? true : false" @click="handleDelete(scope.$index, scope.row)">
                  取消授权
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never">
          <div slot="header" class="flex flex-pack-justify flex-align-center">
            <span class="flex1">授权学校列表</span>
            <div>
              <el-button type="primary" size="mini" :disabled="opaList.indexOf('add') === -1 ? true : false" @click="handleCreateSchool">
                添加学校
              </el-button>
              <el-button type="danger" size="mini" :disabled="opaList.indexOf('delete') === -1 ? true : false" @click="batchDeletionSchool">
                批量取消授权
              </el-button>
            </div>
          </div>

          <el-table ref="accountSchoolTable" stripe border :data="accountSchoolList" tooltip-effect="dark" max-height="500" style="width: 100%" @selection-change="handleSelectionSchoolChange">
            <el-table-column fixed type="selection" width="55" />
            <el-table-column prop="name" label="学校名称" />
            <el-table-column prop="provinceName" label="省份" />
            <el-table-column prop="cityName" label="城市" />
            <el-table-column prop="townName" label="镇区" />
            <el-table-column prop="createTime" label="添加授权时间" :formatter="loginTimeFormatter" />
            <el-table-column label="操作" align="center">
              <template slot-scope="scope">
                <el-button size="mini" type="danger" :disabled="opaList.indexOf('delete') === -1 ? true : false" @click="handleSchoolDelete(scope.$index, scope.row)">
                  取消授权
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!--可选区域列表弹窗-->
    <el-dialog title="可授权区域选择" :visible.sync="dialogFormVisible" width="500px" @close="cancelData">
      <div style="max-height: 400px; overflow: auto;">
        <el-tree
          ref="areaTree"
          show-checkbox
          check-strictly
          lazy
          node-key="id"
          :props="props"
          :load="loadNode"
        />
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelData">
          取消
        </el-button>
        <el-button type="primary" @click="updateData">
          确定
        </el-button>
      </div>
    </el-dialog>

    <!--可选区域列表弹窗-end-->

    <!--可选学校列表弹窗-->
    <el-dialog title="可授权学校选择" :visible.sync="dialogSchoolFormVisible" width="500px" @close="cancelSchoolData">
      <el-form label-position="left" label-width="80px">
        <el-form-item label="选择地区">
          <el-cascader
            v-model="selectedOptions"
            placeholder="请选择地区"
            change-on-select
            :options="canSelectSchoolAreaList"
            style="width: 100%;"
            @change="handleChange"
          />
        </el-form-item>
      </el-form>

      <!--<el-tree
            :data="canSelectSchoolAreaList"
            node-key="id"
            :props="defaultProps"
            @node-click="handleNodeClick">
          </el-tree>-->

      <el-table ref="schoolTable" stripe border :data="canSelectSchoolList" tooltip-effect="dark" max-height="400" style="width: 100%" @selection-change="handleSchoolChange">
        <el-table-column fixed type="selection" width="55" />
        <el-table-column prop="name" label="学校名称" />
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelSchoolData">
          取消
        </el-button>
        <el-button type="primary" @click="updateSchoolData">
          确定
        </el-button>
      </div>
    </el-dialog>
    <!--可选学校列表弹窗-end-->
  </div>
</template>

<script>
import { parseTime, common } from '../../../utils'
import { opaMixin } from '../../../utils/mixins'

export default {
  name: 'AccountAreaPermission',
  components: {},
  filters: {},
  mixins: [opaMixin],
  data () {
    return {
      id: '',
      account: '',
      accountAreaList: [],
      accountSchoolList: [],
      selectAreaList: [], // 选中的地区
      selectSchoolList: [], // 选中的学校
      canSelectAreaList: [], // 可以选择的地区
      canSelectSchoolAreaList: [],
      canSelectSchoolList: [], // 可以选择的学校
      dialogFormVisible: false,
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      props: {
        label: 'label',
        children: 'children',
        isLeaf: 'leaf'
      },
      node: '',
      resolve: '',
      isFirst: true,

      dialogSchoolFormVisible: false,
      resUserSchoolList: [], // 需要提交的学校
      selectedOptions: []
    }
  },
  computed: {},
  watch: {},
  created () {
    this.id = this.$route.params.id
    this.account = this.$route.params.title
  },
  async mounted () {
    await this.getOpaList()
    this.$nextTick(() => {
      this.getAccountAreaList()
      this.getAccountSchoolList()
    })
  },
  activated () {
  },
  destroyed () {
  },
  methods: {
    loadNode (node, resolve) {
      if (this.isFirst) {
        this.getOpaList()
        this.node = node
        this.resolve = resolve
        // this.fullScreenLoading = true;
        this.isFirst = false
      }
      this.$nextTick(() => {
        if (this.opaList.indexOf('list') === -1) { // 权限

        }
      })

      let params
      console.log(node)
      if (node.level === 0) {
        params = {
          areaType: 1,
          type: 1,
          userId: this.id,
          parentId: 0
        }
      } else {
        params = {
          areaType: node.data.areaType + 1,
          type: 1,
          userId: this.id,
          parentId: node.data.id
        }
      }
      this.$api.account.getAllAreaList(params).then((res) => {
        if (res.rcode === 300) {
          const areaList = res.data.areaList
          areaList.forEach((value) => {
            value.label = value.name
          })
          // this.fullScreenLoading = false;
          return resolve(areaList)
        }
      })
    },
    // 获取账号所有授权的地区
    getAccountAreaList () {
      if (this.opaList.indexOf('list') === -1) {
        return
      }
      const params = {
        userId: this.id
      }
      this.$api.account.getAreaByUser(params).then((res) => {
        if (res.rcode === 300 && res.data !== null) {
          this.accountAreaList = res.data.areaList
        } else {
          // 错误
        }
      }).catch(() => {

      })
    },
    // 获取账号所有授权的学校
    getAccountSchoolList () {
      if (this.opaList.indexOf('list') === -1) {
        return
      }
      const params = {
        userId: this.id
      }
      this.$api.account.getSchoolByUser(params).then((res) => {
        if (res.rcode === 300 && res.data !== null) {
          this.accountSchoolList = res.data.schoolList
        } else {

        }
      }).catch(() => {

      })
    },
    // 添加区域
    handleCreateArea () {
      this.dialogFormVisible = true
      if (!this.isFirst) {
        this.node.childNodes = []
        this.loadNode(this.node, this.resolve)
      }
      // this.getSelectArea(1);
    },
    // 批量删除地区
    batchDeletionArea () {
      if (this.selectAreaList.length === 0) {
        // 请先选择要删除的项
        this.$message({
          message: '请先选择需要取消授权的项',
          type: 'warning'
        })
        return
      }
      this.$confirm('取消所选地区的授权，是否继续？', '提示', {
        type: 'warning'
      }).then(() => {
        const areaIds = []
        this.selectAreaList.forEach((value) => {
          areaIds.push(value.id)
        })

        this.delArea(areaIds).then((res) => {
          if (res.rcode === 300) {
            this.getAccountAreaList()
            this.getAccountSchoolList()
          } else {
            // 错误提示
            this.$message.error(res.message)
          }
        }).catch(() => {

        })
      })
    },
    // 删除区域
    async delArea (areaIds) {
      const params = {
        areaIds,
        type: 2,
        userId: this.id
      }
      return await this.$api.account.resUserArea(params)
    },
    // 添加学校
    handleCreateSchool () {
      this.dialogSchoolFormVisible = true
      this.selectedOptions = []
      this.canSelectSchoolAreaList = []
      this.canSelectSchoolList = []
      this.getSelectArea(2)
    },
    // 批量删除学校
    batchDeletionSchool () {
      if (this.selectSchoolList.length === 0) {
        // 请先选择要删除的项
        this.$message({
          message: '请先选择需要取消授权的项',
          type: 'warning'
        })
        return
      }
      this.$confirm('取消所选学校的授权，是否继续？', '提示', {
        type: 'warning'
      }).then(() => {
        const schoolIds = []
        this.selectSchoolList.forEach((value) => {
          schoolIds.push(value.id)
        })
        this.delSchool(schoolIds).then((res) => {
          if (res.rcode === 300) {
            this.getAccountSchoolList()
          } else {
            // 错误提示
            this.$message.error(res.message)
          }
        }).catch(() => {

        })
      })
    },
    // 删除学校
    async delSchool (schoolIds) {
      const params = {
        schoolIds,
        type: 2,
        userId: this.id
      }
      return await this.$api.account.resUserSchool(params)
    },
    // 获取可选择的区域
    getSelectArea (type) {
      const params = {
        type,
        userId: this.id
      }
      this.$api.account.getAllAreaList(params).then((res) => {
        if (res.rcode === 300) {
          const selectArea = res.data.areaList
          /* selectArea = [
              {id: '1', name: '1', areaType: '大名', time: '2019-02-02',},
              {id: '2', name: '1-1', areaType: '大名', time: '2019-02-02', parentId: '1'},
              {id: '3', name: '1-1-1', areaType: '大名', time: '2019-02-02', parentId: '2'},
              {id: '4', name: '1-2', areaType: '大名', time: '2019-02-02', parentId: '1'},
              {id: '5', name: '1-2-2', areaType: '大名', time: '2019-02-02', parentId: '4'},
              {id: '6', name: '1-1-1-1', areaType: '大名', time: '2019-02-02', parentId: '3'},
              {id: '7', name: '2', areaType: '大名', time: '2019-02-02'}
            ]; */
          selectArea.forEach((item) => {
            item.value = item.id
            item.label = item.name
          })

          const selectAreaList = common.translateDataToTree(selectArea)
          if (type === 1) {
            // selectAreaList = common.translateDataToTree(selectArea);
            for (let i = 0, l = selectAreaList.length; i < l; i++) { // 分批导入以防止内存溢出卡死
              this.setAreaList(selectAreaList, i)
            }
          } else {
            // selectAreaList = common.translateAreaToTree(selectArea);
            for (let i = 0, l = selectAreaList.length; i < l; i++) { // 分批导入以防止内存溢出卡死
              this.setSchoolList(selectAreaList, i)
            }
          }
        }
      })
    },
    setAreaList (selectAreaList, i) {
      const arr = selectAreaList.slice(i, i + 1)
      setTimeout(() => {
        this.canSelectAreaList = this.canSelectAreaList.concat(arr)
      }, 200)
    },
    setSchoolList (selectAreaList, i) {
      const arr = selectAreaList.slice(i, i + 1)
      setTimeout(() => {
        this.canSelectSchoolAreaList = this.canSelectSchoolAreaList.concat(arr)
      }, 200)
    },
    //
    handleSelectionChange (val) {
      this.selectAreaList = val
    },
    //
    handleSelectionSchoolChange (val) {
      this.selectSchoolList = val
    },
    // 过滤最后更新时间
    loginTimeFormatter (row, column) {
      if (row.createTime === 0) {
        return '无添加记录'
      } else {
        return parseTime(row.createTime, '{y}-{m}-{d}')
      }
    },
    // 取消地区授权
    handleDelete (index, row) {
      this.$confirm('取消该地区的授权，是否继续？', '提示', {
        type: 'warning'
      }).then(() => {
        this.delArea([row.id]).then((res) => {
          if (res.rcode === 300) {
            this.accountAreaList.splice(index, 1)
            this.getAccountSchoolList()
          } else {
            // 提示错误
            this.$message.error(res.message)
          }
        }).catch((err) => {

        })
      })
    },
    // 取消学校授权
    handleSchoolDelete (index, row) {
      this.$confirm('取消该学校的授权，是否继续？', '提示', {
        type: 'warning'
      }).then(() => {
        this.delSchool([row.id]).then((res) => {
          if (res.rcode === 300) {
            this.accountSchoolList.splice(index, 1)
          } else {
            // 提示错误
            this.$message.error(res.message)
          }
        }).catch((err) => {

        })
      })
    },
    // 确认添加
    updateData () {
      const keys = this.$refs.areaTree.getCheckedKeys()
      if (keys.length === 0) {
        // 请先选择要删除的项
        this.$message({
          message: '请先选择要授权的项',
          type: 'warning'
        })
        return
      }
      const params = {
        areaIds: keys,
        type: 1,
        userId: this.id
      }
      this.$api.account.resUserArea(params).then((res) => {
        if (res.rcode === 300) {
          this.dialogFormVisible = false
          this.getAccountAreaList()
          this.$notify({
            title: '成功',
            message: '授权成功',
            type: 'success',
            duration: 2000
          })
        }
      })
    },
    // 取消添加
    cancelData () {
      this.dialogFormVisible = false
    },

    // 选择
    handleNodeClick (data) {
      const params = {
        areaId: data.id,
        userId: this.id
      }
      this.$api.account.getAllSchoolList(params).then((res) => {
        if (res.rcode === 300) {
          this.canSelectSchoolList = res.data.schoolList
        }
      })
    },
    handleChange (value) {
      const areaId = value[value.length - 1]
      const params = {
        areaId,
        userId: this.id
      }
      this.$api.account.getAllSchoolList(params).then((res) => {
        if (res.rcode === 300) {
          this.canSelectSchoolList = res.data.schoolList
        }
      })
    },
    // 选择学校
    handleSchoolChange (val) {
      this.resUserSchoolList = val
    },
    // 取消学校添加
    cancelSchoolData () {
      this.dialogSchoolFormVisible = false
    },
    // 确认学校添加
    updateSchoolData () {
      if (this.resUserSchoolList.length === 0) {
        // 请先选择要删除的项
        this.$message({
          message: '请先选择要授权的项',
          type: 'warning'
        })
        return
      }
      /* this.$confirm('添加选中学校的权限，是否继续？', '提示', {
          type: 'warning'
        }).then(()=>{}) */
      const schoolIds = []
      this.resUserSchoolList.forEach((value) => {
        schoolIds.push(value.id)
      })
      const params = {
        schoolIds,
        type: 1,
        userId: this.id
      }
      this.$api.account.resUserSchool(params).then((res) => {
        if (res.rcode === 300) {
          this.dialogSchoolFormVisible = false
          this.resUserSchoolList.forEach((value) => {
            const index = this.canSelectSchoolList.indexOf(value)
            this.canSelectSchoolList.splice(index, 1)
          })
          this.resUserSchoolList = []
          this.getAccountSchoolList()
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

<style lang="scss" scoped>
.table-tit {
  line-height: 40px;
  color: #333;
  font-size: 16px;
  font-weight: bold;
}
</style>

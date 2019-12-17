<template>
  <div v-loading="fullScreenLoading" class="app-container">
    <el-card shadow="never" class="mb-20">
      <el-form ref="form" :inline="true" :model="tagParams" label-width="80px" size="mini">
        <el-form-item label="标签类型">
          <el-select v-model="tagParams.type" placeholder="请选择标签类型" class="class-input-box" @change="changeShow">
            <el-option v-for="item in typeList" :key="item.value" :label="item.label" :value="item.value" />
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
        <span class="flex1">标签列表</span>
        <div>
          <el-button type="primary" size="mini" :disabled="opaList.indexOf('add') === -1 ? true : false" @click="handleCreate">
            新增
          </el-button>
          <el-button type="danger" size="mini" :disabled="opaList.indexOf('delete') === -1 ? true : false" @click="batchDeletion">
            批量删除
          </el-button>
        </div>
      </div>
      <el-table ref="tagTable" stripe :data="tagList" tooltip-effect="dark" style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column fixed type="selection" width="55" />
        <el-table-column prop="name" label="标签" />
        <el-table-column prop="typeName" label="类型" />
        <el-table-column fixed="right" label="操作" width="280" align="center">
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
      <pagination v-show="tagParams.total > 0" :total="tagParams.total" :page.sync="tagParams.offSet" :limit.sync="tagParams.offSize" @pagination="getTagList" />
    </el-card>
    <!--新建或编辑菜单弹窗-->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="800px" @close="cancelData">
      <el-form ref="dataForm" :model="temp" :rules="rules" label-position="left" label-width="100px" style="margin-left:50px; margin-right: 50px;">
        <el-form-item label="标签名称" prop="name">
          <el-input v-model="temp.name" placeholder="标签名称" type="text" class="filter-item input-box" />
        </el-form-item>
        <el-form-item label="标签类型" prop="type">
          <el-select v-model="temp.type" placeholder="请选择标签类型" style="width: 100%;">
            <el-option v-for="item in changeTypeList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
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
    <!--新建或编辑菜单弹窗-end-->
  </div>
</template>

<script>
import { opaMixin } from '../../../utils/mixins'
import Pagination from '@/components/Pagination' // 分页
export default {
  name: 'Tag',
  components: { Pagination },
  filters: {},
  mixins: [opaMixin],
  data () {
    return {
      fullScreenLoading: false,
      tagParams: {
        type: '',
        total: 0, // 总共条数
        offSet: 0, // 页面
        offSize: 10 // 一页的条数
      },
      typeList: [{ value: '', label: '全部' }, { value: 1, label: '视频课程' }, { value: 2, label: '话题' }], // 状态列表
      tagList: [],
      temp: {
        id: 0,
        name: '',
        type: 1
      },
      dialogFormVisible: false, // 是否显示编辑弹层
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '创建'
      },
      changeTypeList: [{ value: 1, label: '视频课程' }, { value: 2, label: '话题' }],
      rules: {
        name: [{ required: true, message: '标签名称不能为空', trigger: 'blur' }],
        type: [{ required: true, message: '标签类型不能为空', trigger: 'change' }]
      },
      delArr: []
    }
  },
  computed: {},
  watch: {},
  created () {
  },
  async mounted () {
    await this.getOpaList()
    this.$nextTick(() => {
      this.getTagList()
    })
  },
  activated () {
  },
  destroyed () {
  },
  methods: {
    changeShow () {
      this.onSearch()
    },
    onSearch () {
      this.tagParams.offSet = 1
      this.getTagList()
    },
    onReset () {
      this.tagParams = {
        type: '',
        total: 0, // 总共条数
        offSet: 0, // 页面
        offSize: 10 // 一页的条数
      }
      this.onSearch()
    },
    resetTemp () {
      this.temp = {
        id: 0,
        name: '',
        type: 1
      }
    },
    handleCreate () {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    batchDeletion () {
      if (this.delArr.length === 0) {
        // 请先选择要删除的项
        this.$message({
          message: '请先选择要删除的项',
          type: 'warning'
        })
        return
      }
      this.$confirm('删除所选标签，是否继续？', '提示', {
        type: 'warning'
      }).then(() => {
        const tagIds = []
        this.delArr.forEach((value) => {
          tagIds.push(value.id)
        })
        this.delTag(tagIds).then((res) => {
          if (res.rcode === 300) {
            this.getTagList()
          } else {
            // 错误提示
            this.$message.error(res.message)
          }
        }).catch(() => {})
      })
    },
    async delTag (ids) {
      const params = {
        ids
      }
      return await this.$api.tag.delTag(params)
    },
    handleSelectionChange (val) {
      this.delArr = val
    },
    handleEdit (index, row) {
      const params = {
        id: row.id
      }

      this.$api.tag.getTag(params).then((res) => {
        if (res.rcode === 300) {
          this.temp = Object.assign({}, this.temp, row, res.data) // copy obj
          console.log(this.temp)
        }
      })
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleDelete (index, row) {
      this.$confirm('删除该标签，是否继续？', '提示', {
        type: 'warning'
      }).then(() => {
        this.delTag([row.id]).then((res) => {
          if (res.rcode === 300) {
            this.getTagList()
          } else {
            // 错误提示
            this.$message.error(res.message)
          }
        }).catch(() => {

        })
      })
    },
    getTagList () {
      if (this.opaList.indexOf('list') === -1) {
        return
      }
      this.fullScreenLoading = true
      this.$nextTick(() => {
        const tagParams = Object.assign({}, this.tagParams)
        tagParams.offSet--
        this.$api.tag.getTagList(tagParams).then((res) => {
          if (res.rcode === 300) {
            this.tagParams.total = res.data.totalPages
            this.tagList = res.data.list
          }
          this.fullScreenLoading = false
        }).catch(() => {

        })
      })
    },
    createData () {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.$api.tag.updateTag(this.temp).then((res) => {
            if (res.rcode === 300) {
              this.dialogFormVisible = false
              this.$notify({
                title: '成功',
                message: '创建成功',
                type: 'success',
                duration: 2000
              })
              this.onSearch()
            } else {

            }
          }).catch(() => {

          })
        }
      })
    },
    updateData () {
      this.$refs['dataForm'].validate((valid) => { // 检查rule
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          this.$api.tag.updateTag(tempData).then((res) => {
            if (res.rcode === 300) {
              this.dialogFormVisible = false
              this.getTagList()
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
    },
    cancelData () {
      this.dialogFormVisible = false
    }
  }
}
</script>

<style scoped lang="scss">

</style>

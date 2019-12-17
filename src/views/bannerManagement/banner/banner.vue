<template>
  <div v-loading="fullScreenLoading" class="app-container">
    <el-card shadow="never" class="mb-20">
      <el-form ref="form" :inline="true" :model="params" label-width="120px" size="mini">
        <el-form-item label="广告位">
          <el-select v-model="params.columnType" placeholder="请选择广告位置" @change="onSearch">
            <el-option v-for="item in columnTypeList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="用户类型">
          <el-select v-model="params.userType" placeholder="请选择用户类型" @change="onSearch">
            <el-option v-for="item in userTypeList" :key="item.value" :label="item.label" :value="item.value" />
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
        <span class="flex1">广告列表</span>
        <div>
          <el-button type="primary" size="mini" :disabled="opaList.indexOf('add') === -1 ? true : false" @click="handleCreate">
            新增
          </el-button>
          <el-button type="danger" size="mini" :disabled="opaList.indexOf('delete') === -1 ? true : false" @click="batchDeletion">
            批量删除
          </el-button>
        </div>
      </div>
      <el-table ref="table" :data="bannerList" tooltip-effect="dark" style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column fixed type="selection" width="55" />
        <el-table-column prop="pic" label="广告图片">
          <template slot-scope="scope">
            <img class="prize-pic" :src="scope.row.pic" @click="preview(scope.$index)">
          </template>
        </el-table-column>
        <el-table-column prop="columnName" label="广告位" />
        <el-table-column prop="userTypeName" label="用户类型名称" />
        <el-table-column fixed="right" label="操作" width="180" align="center">
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
      <pagination v-show="params.total > 0" :total="params.total" :page.sync="params.offSet" :limit.sync="params.offSize" @pagination="getBannerList" />
    </el-card>
    <!--新建或编辑菜单弹窗-->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="800px" @close="cancelData">
      <el-form ref="dataForm" :model="temp" :rules="rules" label-position="left" label-width="100px" style="margin-left:50px; margin-right: 50px;">
        <el-form-item label="广告位" prop="columnType">
          <el-select v-model="temp.columnType" placeholder="请选择广告位置" style="width: 100%;">
            <el-option v-for="item in selectColumnTypeList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="用户类型" prop="userType">
          <el-select v-model="temp.userType" placeholder="请选择用户类型" style="width: 100%;">
            <el-option v-for="item in userTypeList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="链接" prop="url">
          <el-input v-model="temp.url" type="text" placeholder="请输入广告点击需要跳转的链接" maxlength="255" show-word-limit />
        </el-form-item>
        <el-form-item label="广告图片" prop="pic">
          <Upload v-model="temp.pic" @input="getInputFile" />
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
  </div>
</template>

<script>
import Pagination from '@/components/Pagination' // 分页
import { opaMixin } from '../../../utils/mixins'
import Upload from '@/components/Upload/singleImage3'
export default {
  name: 'Banner',
  components: { Pagination, Upload },
  filters: {},
  mixins: [opaMixin],
  data () {
    return {
      fullScreenLoading: false,
      images: [],
      params: {
        columnType: 0,
        userType: 1,
        total: 0, // 总共条数
        offSet: 0, // 页面
        offSize: 10 // 一页的条数
      },
      columnTypeList: [{ value: 0, label: '全部' }, { value: 1, label: '小程序' }, { value: 2, label: '19版全课通首页' }, { value: 3, label: '19版全课通话题' }],
      userTypeList: [{ value: 0, label: '教师' }, { value: 1, label: '学生' }, { value: 2, label: '家长' }],
      bannerList: [],
      selectArr: [],
      temp: {
        id: 0,
        columnType: '',
        pic: '',
        url: '',
        userType: 1
      },
      dialogFormVisible: false, // 是否显示编辑弹层
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '创建'
      },
      rules: {
        columnType: [{ required: true, message: '广告位值不能为空', trigger: 'change' }],
        pic: [{ required: true, message: '广告图片不能为空', trigger: 'blur' }],
        userType: [{ required: true, message: '用户类型不能为空', trigger: 'change' }]
      },
      selectColumnTypeList: [{ value: 1, label: '小程序' }, { value: 2, label: '19版全课通首页' }, { value: 3, label: '19版全课通话题' }]
    }
  },
  computed: {},
  watch: {},
  created () {
  },
  async mounted () {
    await this.getOpaList()
    this.$nextTick(() => {
      this.getBannerList()
    })
  },
  activated () {
  },
  destroyed () {
  },
  methods: {
    preview (index) {
      this.$imagePreview({
        images: this.images,
        index: index
      })
    },
    onSearch () {
      this.params.offSet = 1
      this.getBannerList()
    },
    onReset () {
      this.params = {
        columnType: 0,
        userType: 1,
        total: 0, // 总共条数
        offSet: 0, // 页面
        offSize: 10 // 一页的条数
      }
      this.onSearch()
    },
    getBannerList () {
      if (this.opaList.indexOf('list') === -1) { // 权限
        return
      }
      this.fullScreenLoading = true
      this.$nextTick(() => {
        const params = Object.assign({}, this.params)
        params.offSet--
        this.$api.banner.getBannerList(params).then((res) => {
          if (res.rcode === 300) {
            this.params.total = res.data.totalPages
            this.bannerList = res.data.bannerList
            const images = []
            this.bannerList.forEach((value) => {
              images.push(value.pic)
            })
            this.images = images
          }
          this.fullScreenLoading = false
        }).catch(() => {

        })
      })
    },
    handleCreate () {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    resetTemp () {
      this.temp = {
        id: 0,
        columnType: '',
        pic: '',
        url: '',
        userType: 1
      }
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
      this.$confirm('删除已选中的广告，是否继续？', '提示', {
        type: 'warning'
      }).then(() => {
        const ids = []
        this.selectArr.forEach((value) => {
          ids.push(value.id)
        })
        this.delBanner(ids).then((res) => {
          if (res.rcode === 300) {
            this.getBannerList()
            this.selectArr = []
          } else {
            // 错误提示
            this.$message.error(res.message)
          }
        })
      })
    },
    async delBanner (ids) {
      const params = {
        ids
      }
      return await this.$api.banner.delBanner(params)
    },
    handleSelectionChange (val) {
      this.selectArr = val
    },
    handleDelete (index, row) {
      this.$confirm('删除该广告，是否继续？', '提示', {
        type: 'warning'
      }).then(() => {
        this.delBanner([row.id]).then((res) => {
          if (res.rcode === 300) {
            this.getBannerList()
          } else {
            // 提示错误
            this.$message.error(res.message)
          }
        }).catch((err) => {

        })
      })
    },
    async handleEdit (index, row) {
      const params = {
        id: row.id
      }
      let res = await this.$api.banner.getBanner(params)
      if (res.rcode === 300) {
        this.temp = Object.assign({}, this.temp, row, res.data) // copy obj
        this.dialogStatus = 'update'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      }
    },
    getInputFile (file) {
      this.temp.pic = file
    },
    cancelData () {
      this.dialogFormVisible = false
    },
    createData () {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.$api.banner.updateBanner(this.temp).then((res) => {
            if (res.rcode === 300) {
              this.dialogFormVisible = false
              this.$notify({
                title: '成功',
                message: '创建成功',
                type: 'success',
                duration: 2000
              })
              this.onSearch()
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
          this.$api.banner.updateBanner(tempData).then((res) => {
            if (res.rcode === 300) {
              this.dialogFormVisible = false
              this.onSearch()
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

<style scoped lang="scss">
  .prize-pic {
    width: 120px;
  }
</style>

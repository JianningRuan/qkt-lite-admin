<template>
  <div v-loading="fullScreenLoading" class="app-container">
    <el-card shadow="never" class="mb-20">
      <div slot="header" class="flex flex-pack-justify flex-align-center">
        <span class="flex1">大赛详情</span>
        <div>
          <el-button type="text" style="padding-bottom: 0; padding-top: 0;" @click="showOrHideForm">
            {{ showMore ? '收起' : '展开' }}<i :class="showMore ? 'el-icon-arrow-up' : 'el-icon-arrow-down'" />
          </el-button>
          <el-button type="primary" size="mini" @click="previewMatchData">
            预览
          </el-button>
          <el-button type="primary" size="mini" :disabled="opaList.indexOf('edit') === -1 ? true : false" @click="editMatchData">
            修改
          </el-button>
        </div>
      </div>
      <el-row type="flex" :gutter="20">
        <el-col :span="2">
          <div class="grid-content grid-content-title">
            标题：
          </div>
        </el-col>
        <el-col :span="22">
          <div class="grid-content">
            {{ postForm.title }}
          </div>
        </el-col>
      </el-row>
      <el-row type="flex" :gutter="20">
        <el-col :span="2">
          <div class="grid-content grid-content-title">
            比赛时间：
          </div>
        </el-col>
        <el-col :span="22">
          <div class="grid-content grid-content-textarea">
            {{ postForm.beginTime | parseTime('{y}-{m}-{d}') }} 至 {{ postForm.endTime | parseTime('{y}-{m}-{d}') }}
          </div>
        </el-col>
      </el-row>
      <el-row type="flex" :gutter="20">
        <el-col :span="2">
          <div class="grid-content grid-content-title">
            广告图：
          </div>
        </el-col>
        <el-col :span="22">
          <div class="grid-content-image">
            <img :src="postForm.banner" @click="preview(postForm.banner)">
          </div>
        </el-col>
      </el-row>
      <el-row type="flex" :gutter="20">
        <el-col :span="2">
          <div class="grid-content grid-content-title">
            广告图点击地址：
          </div>
        </el-col>
        <el-col :span="22">
          <div class="grid-content">
            {{ postForm.url }}
          </div>
        </el-col>
      </el-row>
      <div v-show="showMore">
        <el-row type="flex" :gutter="20">
          <el-col :span="2">
            <div class="grid-content grid-content-title">
              分享页顶图：
            </div>
          </el-col>
          <el-col :span="22">
            <div class="grid-content-image">
              <img :src="postForm.shareBanner" @click="preview(postForm.shareBanner)">
            </div>
          </el-col>
        </el-row>
        <el-row type="flex" :gutter="20">
          <el-col :span="2">
            <div class="grid-content grid-content-title">
              大赛简介：
            </div>
          </el-col>
          <el-col :span="22">
            <div class="grid-content grid-content-textarea" v-html="postForm.content" />
          </el-col>
        </el-row>
        <el-row type="flex" :gutter="20">
          <el-col :span="2">
            <div class="grid-content grid-content-title">
              大赛流程描述：
            </div>
          </el-col>
          <el-col :span="22">
            <div class="grid-content grid-content-textarea" v-html="postForm.desc" />
          </el-col>
        </el-row>
        <el-row type="flex" :gutter="20">
          <el-col :span="2">
            <div class="grid-content grid-content-title">
              大赛规则：
            </div>
          </el-col>
          <el-col :span="22">
            <div class="grid-content grid-content-textarea" v-html="postForm.activityRule" />
          </el-col>
        </el-row>
        <el-row type="flex" :gutter="20">
          <el-col :span="2">
            <div class="grid-content grid-content-title">
              评奖规则：
            </div>
          </el-col>
          <el-col :span="22">
            <div class="grid-content grid-content-textarea" v-html="postForm.awardRule" />
          </el-col>
        </el-row>
      </div>
    </el-card>

    <el-card shadow="never">
      <div slot="header">
        <div class="flex flex-pack-justify flex-align-center">
          <span class="flex1">大赛场次</span>
          <div>
            <el-button type="primary" size="mini" :disabled="opaList.indexOf('add') === -1 ? true : false" @click="handleCreate">
              新增场次
            </el-button>
            <el-button type="danger" size="mini" :disabled="opaList.indexOf('delete') === -1 ? true : false" @click="batchDeletion">
              批量删除
            </el-button>
          </div>
        </div>
      </div>
      <el-table ref="levelTable" stripe :data="levelList" tooltip-effect="dark" style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column fixed type="selection" width="55" />
        <el-table-column label="场次名称" prop="name" />
        <el-table-column label="场次" prop="num" />
        <el-table-column label="创建时间" prop="createTime" :formatter="createTimeFormatter" />
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button size="mini" :disabled="opaList.indexOf('edit') === -1 ? true : false" @click="handleEdit(scope.$index, scope.row)">
              编辑
            </el-button>
            <el-button size="mini" :disabled="opaList.indexOf('query') === -1 ? true : false" @click="handleCheckLevel(scope.$index, scope.row)">
              查看赛区
            </el-button>
            <el-button size="mini" type="danger" :disabled="opaList.indexOf('delete') === -1 ? true : false" @click="handleDelete(scope.$index, scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!--新建或编辑场次弹窗-->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="500px" @close="cancelData">
      <el-form ref="levelForm" :model="levelTemp" :rules="levelRules" label-position="left" label-width="80px" style="margin-left:50px; margin-right: 50px;">
        <el-form-item label="场次名称" prop="name">
          <el-input v-model="levelTemp.name" placeholder="场次名称" class="filter-item input-box" maxlength="30" show-word-limit />
        </el-form-item>
        <el-form-item label="场次" prop="num">
          <el-input v-model="levelTemp.num" type="number" placeholder="场次" class="filter-item input-box" />
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
    <!--新建或编辑场次弹窗-end-->
  </div>
</template>

<script>
import Tinymce from './../../../components/Tinymce'
import Upload from '@/components/Upload/singleImage3'
import { parseTime } from '../../../utils'
import { opaMixin } from '../../../utils/mixins'
export default {
  name: 'MathMatchDetail',
  components: { Tinymce, Upload },
  filters: {},
  mixins: [opaMixin],
  data () {
    const validatorNum = (rule, value, callback) => {
      if (value < 1) {
        callback(new Error('请填入大于0的数字'))
      } else {
        callback()
      }
    }
    return {
      id: '',
      fullScreenLoading: false,
      edit: false,
      showMore: false,
      postForm: {},
      postTemp: {
        status: 'draft',
        id: 0,
        title: '',
        content: '', // 大赛简介
        activityRule: '', // 大赛规则
        awardRule: '', // 评奖规则
        desc: '', // 大赛流程描述
        beginTime: '',
        endTime: '',
        banner: '',
        url: '',
        matchTime: []
      },
      rules: {
        title: [
          { required: true, message: '标题不能为空', trigger: 'blur' }
        ],
        content: [
          { required: true, message: '大赛简介不能为空', trigger: 'blur' }
        ],
        desc: [
          { required: true, message: '大赛流程描述不能为空', trigger: 'blur' }
        ],
        activityRule: [
          { required: true, message: '大赛规则不能为空', trigger: 'blur' }
        ],
        matchTime: [
          { required: true, message: '大赛时间不能为空', trigger: 'blur' }
        ]
      },
      levelList: [], // 场次列表
      textMap: {
        update: '编辑',
        create: '创建'
      },
      dialogStatus: '',
      dialogFormVisible: false,
      levelTemp: {
        id: 0,
        matchId: 0,
        name: '',
        num: ''
      },
      levelRules: {
        name: [
          { required: true, message: '场次名称不能为空', trigger: 'blur' }
        ],
        num: [
          { required: true, message: '场次不能为空', trigger: 'blur' },
          { trigger: 'blur', validator: validatorNum }
        ]
      },
      selectArr: [] // 筛选的内容
    }
  },
  computed: {},
  watch: {},
  created () {
    this.id = this.$route.params.id
  },
  async mounted () {
    await this.getOpaList()
    this.$nextTick(() => {
      this.getMatchDetail()
      this.getLevelList()
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
    // 获取详情
    getMatchDetail () {
      if (this.opaList.indexOf('list') === -1) {
        return
      }
      this.fullScreenLoading = true
      const params = {
        id: this.id
      }
      this.$api.match.getMatchDetail(params).then((res) => {
        if (res.rcode === 300) {
          const data = res.data
          data.matchTime = [res.data.beginTime, res.data.endTime]
          this.postForm = data
        }
        this.fullScreenLoading = false
      })
    },
    // 获取场次
    getLevelList () {
      if (this.opaList.indexOf('list') === -1) {
        return
      }
      const params = {
        matchId: this.id
      }
      this.$api.match.getLevelList(params).then((res) => {
        if (res.rcode === 300) {
          this.levelList = res.data.levelList
        }
      })
    },
    // 去修改
    editMatchData () {
      this.$router.push({
        path: `/matchManagement/mathMatchEdit/${this.id}`
      })
    },
    createTimeFormatter (row, column) {
      if (row.createTime === 0) {
        return '无创建记录'
      } else {
        return parseTime(row.createTime, '{y}-{m}-{d}')
      }
    },
    handleChange () {

    },
    handleSelectionChange (val) {
      this.selectArr = val
    },
    // 保存大赛详情
    saveMatchData () {

    },
    // 新增场次
    handleCreate () {
      /* if (this.opaList.indexOf('add') === -1) { // 权限
          return
        } */
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['levelForm'].clearValidate()
      })
    },
    // 重置模板
    resetTemp () {
      this.levelTemp = {
        id: 0,
        matchId: 0,
        name: '',
        num: ''
      }
    },
    // 批量删除
    batchDeletion () {
      if (this.selectArr.length === 0) {
        // 请先选择要删除的项
        this.$message({
          message: '请先选择要删除的项',
          type: 'warning'
        })
        return
      }
      this.$confirm('删除已选中的场次，是否继续？', '提示', {
        type: 'warning'
      }).then(() => {
        const ids = []
        this.selectArr.forEach((value) => {
          ids.push(value.id)
        })
        this.delLevel(ids).then((res) => {
          if (res.rcode === 300) {
            this.getLevelList()
            this.selectArr = []
          } else {
            // 错误提示
            this.$message.error(res.message)
          }
        })
      })
    },
    // 删除场次
    async delLevel (ids) {
      const params = {
        ids
      }
      return await this.$api.match.delLevel(params)
    },
    // 关闭弹窗
    cancelData () {
      this.dialogFormVisible = false
    },
    // 确认创建
    createData () {
      this.$refs['levelForm'].validate((valid) => {
        if (valid) {
          this.levelTemp.matchId = this.id
          this.$api.match.updateLevel(this.levelTemp).then((res) => {
            if (res.rcode === 300) {
              this.dialogFormVisible = false
              this.$notify({
                title: '成功',
                message: '创建成功',
                type: 'success',
                duration: 2000
              })
              this.getLevelList()
            } else {
              // 错误提示
            }
          }).catch(() => {

          })
        }
      })
    },
    updateData () {
      this.$refs['levelForm'].validate((valid) => { // 检查rule
        if (valid) {
          const tempData = Object.assign({}, this.levelTemp)
          this.$api.match.updateLevel(this.levelTemp).then((res) => {
            if (res.rcode === 300) {
              for (const v of this.levelList) {
                if (v.id === tempData.id) {
                  const index = this.levelList.indexOf(v)
                  this.levelList.splice(index, 1, this.levelTemp)
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
    // 进行编辑
    handleEdit (index, row) {
      this.levelTemp = Object.assign({}, this.levelTemp, row) // copy obj
      this.levelTemp.matchId = this.id
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['levelForm'].clearValidate()
      })
    },
    // 进入赛区列表
    handleCheckLevel (index, row) {
      this.$router.push({
        path: `/matchManagement/mathMatchZoneList/${row.id}/${this.postForm.title}${row.name}`
      })
    },
    // 单场删除
    handleDelete (index, row) {
      this.$confirm('删除该场次，是否继续？', '提示', {
        type: 'warning'
      }).then(() => {
        this.delLevel([row.id]).then((res) => {
          if (res.rcode === 300) {
            this.levelList.splice(index, 1)
          } else {
            // 提示错误
            this.$message.error(res.message)
          }
        }).catch((err) => {

        })
      })
    },
    // 预览
    previewMatchData () {
      this.$router.push({
        path: `/matchManagement/mathMatchPreview/${this.id}`
      })
    },
    // 浏览图片
    preview (img) {
      this.$imagePreview({
        images: [img],
        index: 0
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .clearfix:before,
  .clearfix:after {
    display: table;
    content: "";
  }
  .clearfix:after {
    clear: both
  }
  .grid-content {
    // height: 40px;
    line-height: 40px;
    font-size: 14px;
    &.grid-content-title {
      text-align: right;
      font-weight: bold;
    }
    &.grid-content-textarea {
      padding-top: 7px;
      line-height: 26px;
      padding-bottom: 7px;
    }
  }
  .grid-content-image {
    img {
      max-width: 300px;
    }
  }

  .dialog-footer {
    text-align: right;
  }
  .cont-margin {
    // max-width: 800px;
    margin-left: 100px;
    margin-right: 100px;
  }
  .post-cont-box {
    line-height: 26px;
    color: #666;
    border: 1px solid #aaa;
    padding-left: 10px;
    padding-right: 10px;
  }
</style>
<style lang="scss">
  .grid-content {
    p {
      -webkit-margin-before: 0;
      -webkit-margin-after: 0;
    }
  }
</style>

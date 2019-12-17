<template>
  <div v-loading="fullScreenLoading" class="app-container">
    <el-card shadow="never" class="mb-20">
      <el-form ref="form" :inline="true" :model="params" label-width="100px" size="mini">
        <el-form-item label="视频名称/作者">
          <el-input v-model="params.name" placeholder="视频名称/作者" class="input-box" @keyup.enter.native="onSearch" />
        </el-form-item>
        <el-form-item label="年级">
          <el-select v-model="params.grade" placeholder="请选择年级" @change="onSearch">
            <el-option v-for="item in gradeList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="科目">
          <el-select v-model="params.subject" placeholder="请选择科目" @change="onSearch">
            <el-option v-for="item in subjectList" :key="item.value" :label="item.label" :value="item.value" />
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
        <span class="flex1">视频列表</span>
        <div>
          <el-button type="primary" size="mini" :disabled="opaList.indexOf('add') === -1 ? true : false" @click="handleCreate">
            新增
          </el-button>
          <el-button type="danger" size="mini" :disabled="opaList.indexOf('delete') === -1 ? true : false" @click="batchDeletion">
            批量删除
          </el-button>
        </div>
      </div>
      <el-table ref="table" stripe :data="videoList" tooltip-effect="dark" style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column fixed type="selection" width="55" />
        <el-table-column prop="name" label="视频名称" />
        <el-table-column label="年级">
          <template slot-scope="scope">
            {{ gradeShowList[scope.row.grade].label }}
          </template>
        </el-table-column>
        <el-table-column prop="subjectName" label="科目" />
        <el-table-column prop="authorName" label="作者" />
        <el-table-column prop="playCount" label="播放量" />
        <el-table-column prop="collectCount" label="收藏数" />
        <el-table-column prop="likeCount" label="点赞数" />
        <el-table-column prop="summaryCount" label="评论数" />
        <el-table-column label="显示状态">
          <template slot-scope="scope">
            {{ scope.row.display === 1 ? '显示' : '不显示' }}
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="280" align="center">
          <template slot-scope="scope">
            <el-button size="mini" :disabled="opaList.indexOf('edit') === -1 ? true : false" @click="handlePlay(scope.$index, scope.row)">
              播放视频
            </el-button>
            <el-button size="mini" :disabled="opaList.indexOf('edit') === -1 ? true : false" @click="handleEdit(scope.$index, scope.row)">
              编辑
            </el-button>
            <el-button size="mini" type="danger" :disabled="opaList.indexOf('delete') === -1 ? true : false" @click="handleDelete(scope.$index, scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="params.total > 0" :total="params.total" :page.sync="params.offSet" :limit.sync="params.offSize" @pagination="getVideoList" />
    </el-card>
    <!--新建或编辑弹窗-->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="700px" @close="cancelData">
      <el-form ref="dataForm" :model="temp" :rules="rules" label-position="left" label-width="80px" style="margin-left:50px; margin-right: 50px;">
        <el-form-item label="视频名称" prop="name">
          <el-input v-model="temp.name" placeholder="视频名称" maxlength="80" show-word-limit class="filter-item input-box" />
        </el-form-item>
        <el-form-item label="视频作者" prop="authorName">
          <el-input v-model="temp.authorName" placeholder="视频作者" maxlength="30" show-word-limit class="filter-item input-box" />
        </el-form-item>
        <el-form-item label="视频简介" prop="intro">
          <el-input v-model="temp.descr" type="textarea" placeholder="视频简介" maxlength="300" show-word-limit class="filter-item input-box" />
        </el-form-item>
        <el-form-item label="年级" prop="grade">
          <el-select v-model="temp.grade" placeholder="请选择年级" class="input-box">
            <el-option v-for="item in gradeEditList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="科目" prop="subject">
          <el-select v-model="temp.subject" placeholder="请选择科目" class="input-box">
            <el-option v-for="item in subjectEditList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="视频类型" prop="resourseType">
          <el-select v-model="temp.resourseType" placeholder="请选择视频类型" class="input-box">
            <el-option v-for="item in resourceTypeList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="来源等级" prop="resourseLevel">
          <el-select v-model="temp.resourseLevel" placeholder="请选择来源等级" class="input-box">
            <el-option v-for="item in resourceLevelList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="显示状态" prop="display">
          <el-select v-model="temp.display" placeholder="请选择显示状态" class="input-box">
            <el-option v-for="item in showEditList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="视频时长（秒）" prop="videoTime">
          <el-input v-model="temp.videoTime" type="number" placeholder="视频时长（秒）" show-word-limit class="filter-item input-box" />
        </el-form-item>
        <el-form-item label="收藏数" prop="collectCount">
          <el-input v-model="temp.collectCount" type="number" placeholder="请输入收藏数" show-word-limit class="filter-item input-box" />
        </el-form-item>
        <el-form-item label="点赞数" prop="likeCount">
          <el-input v-model="temp.likeCount" type="number" placeholder="请输入收藏数" show-word-limit class="filter-item input-box" />
        </el-form-item>
        <el-form-item label="播放量" prop="playCount">
          <el-input v-model="temp.playCount" type="number" placeholder="请输入播放量" show-word-limit class="filter-item input-box" />
        </el-form-item>
        <el-form-item label="视频地址" prop="videoUrl">
          <el-input v-model="temp.videoUrl" placeholder="视频地址" show-word-limit class="filter-item input-box" />
          <UploadVideo :value="temp.videoUrl" class="mt-20" @input="getInputVideoFile" />
        </el-form-item>
        <el-form-item label="视频截图" prop="pic">
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
    <!--播放视频-->
    <el-dialog title="播放视频" :visible.sync="dialogVideoVisible" width="700px" @close="cancelVideoData">
      <video
        ref="video"
        class="player"
        controls="controls"
        controlslist="nodownload"
        name="media"
        width="100%"
        :src="videoSrc"
      >
        <source :src="videoSrc" type="video/mp4">
      </video>
    </el-dialog>
    <!--播放视频-end-->
  </div>
</template>

<script>
import Pagination from '@/components/Pagination' // 分页
import { opaMixin } from '../../../utils/mixins'
// import { common } from './../../../utils/index'
import Upload from '@/components/Upload/singleImage3'
import UploadVideo from '@/components/Upload/uploadVideo'
export default {
  name: 'VideoList',
  components: { Pagination, Upload, UploadVideo },
  filters: {},
  mixins: [opaMixin],
  data () {
    return {
      fullScreenLoading: false,
      params: {
        name: '',
        grade: '',
        subject: '',
        total: 0, // 总共条数
        offSet: 0, // 页面
        offSize: 10 // 一页的条数
      },
      gradeList: [{ value: '', label: '全部' }, { value: 1, label: '一年级' }, { value: 2, label: '二年级' }, { value: 3, label: '三年级' }, { value: 4, label: '四年级' }, { value: 5, label: '五年级' }, { value: 6, label: '六年级' }, { value: 7, label: '七年级' }, { value: 8, label: '八年级' }, { value: 9, label: '九年级' }],
      gradeShowList: [{ value: 0, label: '未指定' }, { value: 1, label: '一年级' }, { value: 2, label: '二年级' }, { value: 3, label: '三年级' }, { value: 4, label: '四年级' }, { value: 5, label: '五年级' }, { value: 6, label: '六年级' }, { value: 7, label: '七年级' }, { value: 8, label: '八年级' }, { value: 9, label: '九年级' }],
      gradeEditList: [{ value: 0, label: '未指定' }, { value: 1, label: '一年级' }, { value: 2, label: '二年级' }, { value: 3, label: '三年级' }, { value: 4, label: '四年级' }, { value: 5, label: '五年级' }, { value: 6, label: '六年级' }, { value: 7, label: '七年级' }, { value: 8, label: '八年级' }, { value: 9, label: '九年级' }],
      subjectList: [{ value: '', label: '全部' }, { value: 1, label: '语文' }, { value: 2, label: '数学' }, { value: 3, label: '英语' }],
      subjectEditList: [{ value: 1, label: '语文' }, { value: 2, label: '数学' }, { value: 3, label: '英语' }],
      resourceTypeList: [{ value: 0, label: '未指定' }, { value: 1, label: '数学' }, { value: 2, label: '奥数' }],
      resourceLevelList: [{ value: 1, label: '基础' }, { value: 2, label: '培优' }],
      showEditList: [{ value: 1, label: '显示' }, { value: 0, label: '不显示' }],
      videoList: [],
      selectArr: [],
      dialogFormVisible: false, // 是否显示编辑弹层
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '创建'
      },
      temp: {
        id: 0,
        name: '',
        grade: 1,
        subject: 1,
        display: 1,
        descr: '',
        authorName: '',
        collectCount: 0,
        likeCount: 0,
        playCount: 0,
        videoTime: 0,
        resourseLevel: 1,
        resourseType: 0,
        pic: '',
        videoUrl: ''
      },
      rules: {
        name: [
          { required: true, message: '视频名称不能为空', trigger: 'blur' }
        ],
        grade: [
          { required: true, message: '年级不能为空', trigger: 'change' }
        ],
        subject: [
          { required: true, message: '科目不能为空', trigger: 'change' }
        ],
        display: [
          { required: true, message: '显示状态不能为空', trigger: 'change' }
        ],
        descr: [
          { required: true, message: '简介不能为空', trigger: 'blur' }
        ],
        authorName: [
          { required: true, message: '作者不能为空', trigger: 'blur' }
        ],
        collectCount: [],
        likeCount: [],
        playCount: [],
        videoTime: [
          { required: true, message: '视频时长不能为空', trigger: 'blur' }
        ],
        resourseLevel: [
          { required: true, message: '来源等级不能为空', trigger: 'change' }
        ],
        resourseType: [
          { required: true, message: '来源类型不能为空', trigger: 'change' }
        ],
        pic: [
          { required: true, message: '视频截图不能为空', trigger: 'blur' }
        ],
        videoUrl: [
          { required: true, message: '视频地址不能为空', trigger: 'blur' }
        ]
      },
      dialogVideoVisible: false,
      videoSrc: ''
    }
  },
  computed: {},
  watch: {},
  created () {
  },
  async mounted () {
    await this.getOpaList()
    this.$nextTick(() => {
      this.getVideoList()
    })
  },
  activated () {
  },
  destroyed () {
  },
  methods: {
    getVideoList () {
      if (this.opaList.indexOf('list') === -1) { // 权限
        return
      }
      this.fullScreenLoading = true
      this.$nextTick(() => {
        const params = Object.assign({}, this.params)
        params.offSet--
        this.$api.course.videoList(params).then((res) => {
          if (res.rcode === 300) {
            this.params.total = res.data.totalPages
            this.videoList = res.data.videoList
          }
          this.fullScreenLoading = false
        }).catch(() => {

        })
      })
    },
    onSearch () {
      this.params.offSet = 1
      this.getVideoList()
    },
    onReset () {
      this.params = {
        name: '',
        grade: '',
        subject: '',
        total: 0, // 总共条数
        offSet: 0, // 页面
        offSize: 10 // 一页的条数
      }
      this.onSearch()
    },
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
    resetTemp () {
      this.temp = {
        id: 0,
        name: '',
        grade: 1,
        semester: 1,
        subject: 1,
        type: 1,
        display: 1,
        descr: '',
        authorName: '',
        collectCount: 0,
        likeCount: 0,
        playCount: 0,
        videoTime: 0,
        resourseLevel: 1,
        resourseType: 0,
        pic: '',
        videoUrl: ''
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
      this.$confirm('删除已选中的视频，是否继续？', '提示', {
        type: 'warning'
      }).then(() => {
        const ids = []
        this.selectArr.forEach((value) => {
          ids.push(value.id)
        })
        this.delItem(ids).then((res) => {
          if (res.rcode === 300) {
            this.getVideoList()
            this.selectArr = []
          } else {
            // 错误提示
            this.$message.error(res.message)
          }
        })
      })
    },
    async delItem (ids) {
      const params = {
        ids
      }
      return await this.$api.course.delVideo(params)
    },
    handleSelectionChange (val) {
      this.selectArr = val
    },
    async handlePlay (index, row) {
      this.videoSrc = row.videoUrl
      this.dialogVideoVisible = true
    },
    async handleEdit (index, row) {
      this.resetTemp()
      const result = await this.$api.course.getVideo({ id: row.id })
      this.temp = Object.assign({}, this.temp, result.data) // copy obj
      this.temp.id = row.id
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleDelete (index, row) {
      this.$confirm('删除该视频，是否继续？', '提示', {
        type: 'warning'
      }).then(() => {
        this.delItem([row.id]).then((res) => {
          if (res.rcode === 300) {
            this.videoList.splice(index, 1)
          } else {
            // 提示错误
            this.$message.error(res.message)
          }
        }).catch((err) => {

        })
      })
    },
    getInputFile (val) {
      this.temp.pic = val
    },
    getInputVideoFile (val) {
      console.log(val)
      this.temp.videoUrl = val
    },
    cancelData () {
      this.dialogFormVisible = false
    },
    createData () {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.$api.course.updateVideo(this.temp).then((res) => {
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
    updateData () {
      this.$refs['dataForm'].validate((valid) => { // 检查rule
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          this.$api.course.updateVideo(tempData).then((res) => {
            if (res.rcode === 300) {
              this.getVideoList()
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
    cancelVideoData () {
      this.dialogVideoVisible = false
    }
  }
}
</script>

<style scoped>

</style>

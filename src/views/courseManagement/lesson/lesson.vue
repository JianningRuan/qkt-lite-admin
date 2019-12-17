<template>
  <div v-loading="fullScreenLoading" class="app-container">
    <el-card shadow="never" class="mb-20">
      <el-form ref="form" :inline="true" :model="lessonParams" label-width="80px" size="mini">
        <el-form-item label="年级">
          <el-select v-model="lessonParams.grade" placeholder="请选择年级" @change="onSearch">
            <el-option v-for="item in gradeList" :key="item.value" :label="item.label" :value="item.value" />
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
        <span class="flex1">{{ title }}的课时列表</span>
        <div>
          <el-button type="primary" size="mini" :disabled="opaList.indexOf('add') === -1 ? true : false" @click="handleCreate">
            新增
          </el-button>
          <el-button type="danger" size="mini" :disabled="opaList.indexOf('delete') === -1 ? true : false" @click="batchDeletion">
            批量删除
          </el-button>
        </div>
      </div>
      <el-table ref="lessonTable" stripe :data="lessonList" tooltip-effect="dark" style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column fixed type="selection" width="55" />
        <el-table-column prop="videoName" label="视频名称" />
        <el-table-column label="年级">
          <template slot-scope="scope">
            {{ gradeShowList[scope.row.gradeOrder].label }}
          </template>
        </el-table-column>
        <el-table-column prop="subjectName" label="科目" />
        <el-table-column prop="lessonSort" label="排序（倒序）" />
        <el-table-column fixed="right" label="操作" width="180" align="center">
          <template slot-scope="scope">
            <el-button size="mini" :disabled="opaList.indexOf('edit') === -1 ? true : false" @click="handleEdit(scope.$index, scope.row)">
              推荐
            </el-button>
            <el-button size="mini" type="danger" :disabled="opaList.indexOf('delete') === -1 ? true : false" @click="handleDelete(scope.$index, scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="lessonParams.total > 0" :total="lessonParams.total" :page.sync="lessonParams.offSet" :limit.sync="lessonParams.offSize" @pagination="getLessonList" />
    </el-card>

    <!--新建弹窗-->
    <el-dialog title="新建" :visible.sync="dialogFormVisible" width="700px" @close="cancelData">
      <el-form ref="dataForm" :model="temp" :rules="rules" label-position="left" label-width="80px" style="margin-left:50px; margin-right: 50px;">
        <el-form-item label="年级" prop="grade">
          <el-select v-model="temp.grade" placeholder="请选择年级" class="input-box" @change="changeGrade">
            <el-option v-for="item in gradeEditList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="视频" prop="semester">
          <el-select v-model="temp.videoId" placeholder="请选择视频" class="input-box">
            <el-option v-for="item in videoList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级" prop="lessonSort">
          <el-input v-model="temp.lessonSort" type="number" placeholder="优先级" class="filter-item input-box" />
          <p class="tips">
            数字越大排得越优先
          </p>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelData">
          取消
        </el-button>
        <el-button type="primary" @click="createData">
          确定
        </el-button>
      </div>
    </el-dialog>
    <!--推荐弹窗-->
    <el-dialog title="推荐" :visible.sync="dialogRecommendFormVisible" width="500px" @close="cancelRecommendData">
      <el-table ref="recommendTable" stripe :data="currentPlatformList" tooltip-effect="dark" style="width: 100%" @selection-change="handleSelectionChangeRecommend">
        <el-table-column fixed type="selection" width="55" />
        <el-table-column prop="name" label="推荐位置" />
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelRecommendData">
          取消
        </el-button>
        <el-button type="primary" @click="createRecommendData">
          确定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination' // 分页
import { opaMixin } from '../../../utils/mixins'
import { common } from './../../../utils/index'
export default {
  name: 'Lesson',
  components: { Pagination },
  filters: {},
  mixins: [opaMixin],
  data () {
    return {
      id: '',
      title: '',
      fullScreenLoading: false,
      lessonParams: {
        courseId: '',
        grade: '',
        total: 0, // 总共条数
        offSet: 0, // 页面
        offSize: 10 // 一页的条数
      },
      gradeList: [{ value: '', label: '全年级' }, { value: 1, label: '一年级' }, { value: 2, label: '二年级' }, { value: 3, label: '三年级' }, { value: 4, label: '四年级' }, { value: 5, label: '五年级' }, { value: 6, label: '六年级' }, { value: 7, label: '七年级' }, { value: 8, label: '八年级' }, { value: 9, label: '九年级' }],
      gradeShowList: [{ value: 0, label: '未指定' }, { value: 1, label: '一年级' }, { value: 2, label: '二年级' }, { value: 3, label: '三年级' }, { value: 4, label: '四年级' }, { value: 5, label: '五年级' }, { value: 6, label: '六年级' }, { value: 7, label: '七年级' }, { value: 8, label: '八年级' }, { value: 9, label: '九年级' }],
      lessonList: [],
      selectArr: [],
      dialogFormVisible: false,
      temp: {
        courseId: '',
        grade: 1,
        lessonSort: 0,
        videoId: ''
      },
      rules: {},
      gradeEditList: common.gradeList,
      videoList: [],
      platformList: [],
      currentPlatformList: [],
      dialogRecommendFormVisible: false,
      currentRecommendList: [],
      lessonId: ''
    }
  },
  computed: {},
  watch: {},
  created () {
    this.id = this.$route.params.id
    this.lessonParams.courseId = this.$route.params.id
    this.title = this.$route.params.title
  },
  async mounted () {
    await this.getOpaList()
    this.$nextTick(() => {
      this.getPlatformList()
      this.getLessonList()
    })
  },
  activated () {
  },
  destroyed () {
  },
  methods: {
    onSearch () {
      this.lessonParams.offSet = 1
      this.getLessonList()
    },
    onReset () {
      this.lessonParams = {
        courseId: '',
        grade: '',
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
      this.videoList = []
      this.getVideoList()
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    resetTemp () {
      this.temp = {
        courseId: '',
        grade: 1,
        lessonSort: 0,
        videoId: ''
      }
    },
    getVideoList (grade) {
      const params = {
        courseId: this.id,
        grade: grade || this.temp.grade
      }
      this.$api.course.getVideoByCourse(params).then((res) => {
        if (res.rcode === 300) {
          const videoList = res.data.list
          videoList.forEach(value => {
            value.value = value.id
            value.label = value.name
          })
          this.videoList = videoList
        }
      })
    },
    changeGrade (val) {
      console.log(val)
      this.getVideoList(val)
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
      this.$confirm('删除已选中的课时，是否继续？', '提示', {
        type: 'warning'
      }).then(() => {
        const ids = []
        this.selectArr.forEach((value) => {
          ids.push(value.id)
        })
        this.delLesson(ids).then((res) => {
          if (res.rcode === 300) {
            this.getLessonList()
            this.selectArr = []
          } else {
            // 错误提示
            this.$message.error(res.message)
          }
        })
      })
    },
    async delLesson (ids) {
      const params = {
        ids
      }
      return await this.$api.course.delLesson(params)
    },
    getLessonList () {
      if (this.opaList.indexOf('list') === -1) { // 权限
        return
      }
      this.fullScreenLoading = true
      this.$nextTick(() => {
        const lessonParams = Object.assign({}, this.lessonParams)
        lessonParams.offSet--
        this.$api.course.getLessonList(lessonParams).then((res) => {
          if (res.rcode === 300) {
            this.lessonParams.total = res.data.totalPages
            this.lessonList = res.data.lessonList
          }
          this.fullScreenLoading = false
        }).catch(() => {

        })
      })
    },
    getPlatformList () {
      this.$api.course.getRecommendPlatform().then((res) => {
        if (res.rcode === 300) {
          this.platformList = res.data.platformList
        }
      })
    },
    handleSelectionChange (val) {
      this.selectArr = val
    },
    handleDelete (index, row) {
      this.$confirm('删除该课时，是否继续？', '提示', {
        type: 'warning'
      }).then(() => {
        this.delLesson([row.id]).then((res) => {
          if (res.rcode === 300) {
            this.lessonList.splice(index, 1)
          } else {
            // 提示错误
            this.$message.error(res.message)
          }
        }).catch((err) => {

        })
      })
    },
    cancelData () {
      this.dialogFormVisible = false
    },
    createData () {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.courseId = this.id
          this.$api.course.updateLesson(this.temp).then((res) => {
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
    handleEdit (index, row) {
      this.dialogRecommendFormVisible = true
      this.currentPlatformList = this.platformList.concat() // 数组深拷贝
      this.lessonId = row.id
      const params = {
        lessonId: row.id
      }
      this.$api.course.getLessonRecommend(params).then(res => {
        if (res.rcode === 300) {
          const list = res.data.list
          const currentRecommendList = []
          if (list.length === 0) {
            return
          }
          list.forEach(value => {
            for (let i = 0, l = this.currentPlatformList.length; i < l; i++) {
              if (this.currentPlatformList[i].id === value) {
                currentRecommendList.push(this.currentPlatformList[i])
                this.$refs.recommendTable.toggleRowSelection(this.currentPlatformList[i], true)
              }
            }
          })
          this.currentRecommendList = currentRecommendList

        }
      })
    },
    cancelRecommendData () {
      this.dialogRecommendFormVisible = false
    },
    handleSelectionChangeRecommend (val) {
      this.currentRecommendList = val
    },
    createRecommendData () {
      const platformId = []
      this.currentRecommendList.forEach((value) => {
        platformId.push(value.id)
      })
      const params = {
        id: this.lessonId,
        platformId
      }
      this.$api.course.lessonRecommend(params).then((res) => {
        if (res.rcode === 300) {
          this.currentRecommendList = []
          this.dialogRecommendFormVisible = false
        } else {
          // 错误提示
          this.$message.error(res.message)
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .tips {
    color: #8492a6; font-size: 13px; line-height: 20px; word-break:break-all;
  }
</style>

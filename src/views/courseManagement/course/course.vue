<template>
  <div v-loading="fullScreenLoading" class="app-container">
    <el-card shadow="never" class="mb-20">
      <el-form ref="form" :inline="true" :model="courseParams" label-width="80px" size="mini">
        <el-form-item label="课程名称">
          <el-input v-model="courseParams.name" placeholder="账号" class="input-box" @change="onSearch" @keyup.enter.native="onSearch" />
        </el-form-item>
        <!--<el-form-item label="年级">
          <el-select v-model="courseParams.grade" placeholder="请选择年级" @change="onSearch">
            <el-option v-for="item in gradeList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>-->
        <el-form-item label="科目">
          <el-select v-model="courseParams.subject" placeholder="请选择科目" @change="onSearch">
            <el-option v-for="item in subjectList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="显示状态">
          <el-select v-model="courseParams.display" placeholder="请选择显示状态" @change="onSearch">
            <el-option v-for="item in showList" :key="item.value" :label="item.label" :value="item.value" />
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
        <span class="flex1">课程列表</span>
        <div>
          <el-button type="primary" size="mini" :disabled="opaList.indexOf('add') === -1 ? true : false" @click="handleCreate">
            新增
          </el-button>
          <el-button type="danger" size="mini" :disabled="opaList.indexOf('delete') === -1 ? true : false" @click="batchDeletion">
            批量删除
          </el-button>
        </div>
      </div>
      <el-table ref="courseTable" stripe :data="courseList" tooltip-effect="dark" style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column fixed type="selection" width="55" />
        <!--<el-table-column label="封面">
          <template slot-scope="scope">
            <img class="prize-pic" :src="scope.row.pic" @click="preview(scope.$index)">
          </template>
        </el-table-column>-->
        <el-table-column prop="name" label="课程名称" />
        <!--<el-table-column label="年级">
          <template slot-scope="scope">
            {{gradeList[scope.row.grade].label}}
          </template>
        </el-table-column>-->
        <el-table-column prop="subjectName" label="科目" />
        <el-table-column label="显示状态">
          <template slot-scope="scope">
            {{ scope.row.display === 1 ? '显示' : '不显示' }}
          </template>
        </el-table-column>
        <el-table-column label="课程类型">
          <template slot-scope="scope">
            {{ courseTypeList[scope.row.courseType].label }}
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="400" align="center">
          <template slot-scope="scope">
            <el-button size="mini" :disabled="opaList.indexOf('edit') === -1 ? true : false" @click="handleEdit(scope.$index, scope.row)">
              编辑
            </el-button>
            <el-button size="mini" :disabled="opaList.indexOf('query') === -1 ? true : false" @click="handleCheckLabel(scope.$index, scope.row)">
              查看标签
            </el-button>
            <el-button size="mini" :disabled="opaList.indexOf('query') === -1 ? true : false" @click="handleCheckLesson(scope.$index, scope.row)">
              查看课时
            </el-button>
            <el-button size="mini" type="danger" :disabled="opaList.indexOf('delete') === -1 ? true : false" @click="handleDelete(scope.$index, scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="courseParams.total > 0" :total="courseParams.total" :page.sync="courseParams.offSet" :limit.sync="courseParams.offSize" @pagination="getCourseList" />
    </el-card>

    <!--新建或编辑弹窗-->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="700px" @close="cancelData">
      <el-form ref="dataForm" :model="temp" :rules="rules" label-position="left" label-width="80px" style="margin-left:50px; margin-right: 50px;">
        <el-form-item label="课程名称" prop="name">
          <el-input v-model="temp.name" placeholder="课程名称" maxlength="50" show-word-limit class="filter-item input-box" />
        </el-form-item>
        <el-form-item label="课程简介" prop="intro">
          <el-input v-model="temp.intro" type="textarea" placeholder="课程简介" maxlength="200" show-word-limit class="filter-item input-box" />
        </el-form-item>
        <!--<el-form-item label="年级" prop="grade">
          <el-select v-model="temp.grade" placeholder="请选择年级" class="input-box">
            <el-option v-for="item in gradeEditList" :key="item.value" :label="item.label" :value="item.value"/>
          </el-select>
        </el-form-item>
        <el-form-item label="学期" prop="semester">
          <el-select v-model="temp.semester" placeholder="请选择学期" class="input-box">
            <el-option v-for="item in semesterEditList" :key="item.value" :label="item.label" :value="item.value"/>
          </el-select>
        </el-form-item>-->
        <el-form-item label="科目" prop="subject">
          <el-select v-model="temp.subject" placeholder="请选择科目" class="input-box">
            <el-option v-for="item in subjectEditList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="课程类型" prop="type">
          <el-select v-model="temp.type" placeholder="请选择课程类型" class="input-box">
            <el-option v-for="item in courseTypeList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="显示状态" prop="display">
          <el-select v-model="temp.display" placeholder="请选择显示状态" class="input-box">
            <el-option v-for="item in showEditList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="封面图片" prop="pic">
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
    <!--标签列表弹窗-->
    <el-dialog title="标签" :visible.sync="dialogLabelVisible" width="600px" @close="cancelLabelData">
      <div class="dialog-footer flex justify-end mb-20">
        <el-button type="primary" size="mini" :disabled="opaList.indexOf('add') === -1 ? true : false" @click="handleCreateLabel">
          新增
        </el-button>
        <el-button type="danger" size="mini" :disabled="opaList.indexOf('delete') === -1 ? true : false" @click="batchDeletionLabel">
          批量删除
        </el-button>
      </div>
      <el-table ref="labelTable" stripe :data="labelList" tooltip-effect="dark" style="width: 100%" @selection-change="handleSelectionChangeLabel">
        <el-table-column fixed type="selection" width="55" />
        <el-table-column prop="name" label="课程名称" />
        <el-table-column prop="priority" label="优先级" />
        <el-table-column fixed="right" label="操作" width="220" align="center">
          <template slot-scope="scope">
            <el-button size="mini" :disabled="opaList.indexOf('edit') === -1 ? true : false" @click="handleEditLabel(scope.$index, scope.row)">
              编辑
            </el-button>
            <el-button size="mini" type="danger" :disabled="opaList.indexOf('delete') === -1 ? true : false" @click="handleDeleteLabel(scope.$index, scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
    <!--新建或编辑标签弹窗-->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogLabelFormVisible" width="700px" @close="cancelLabelEditData">
      <el-form ref="dataLabelForm" :model="labelTemp" :rules="labelRules" label-position="left" label-width="80px" style="margin-left:50px; margin-right: 50px;">
        <el-form-item label="标签名称" prop="name">
          <el-input v-model="labelTemp.name" placeholder="标签名称" class="filter-item input-box" />
        </el-form-item>
        <el-form-item label="标签排序" prop="priority">
          <el-input v-model="labelTemp.priority" type="number" placeholder="标签排序" class="filter-item input-box" />
          <p class="tips">
            数字越大排得越前
          </p>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelLabelEditData">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createLabelData():updateLabelData()">
          确定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination' // 分页
import Upload from '@/components/Upload/singleImage3'
import { opaMixin } from '../../../utils/mixins'
import { common } from './../../../utils/index'
export default {
  name: 'Course',
  components: { Pagination, Upload },
  filters: {},
  mixins: [opaMixin],
  data () {
    return {
      fullScreenLoading: false,
      images: [],
      courseParams: {
        name: '',
        display: '',
        // grade: '',
        subject: '',
        total: 0, // 总共条数
        offSet: 0, // 页面
        offSize: 10 // 一页的条数
      },
      gradeList: [{ value: '', label: '全部' }, { value: 1, label: '一年级' }, { value: 2, label: '二年级' }, { value: 3, label: '三年级' }, { value: 4, label: '四年级' }, { value: 5, label: '五年级' }, { value: 6, label: '六年级' }, { value: 7, label: '七年级' }, { value: 8, label: '八年级' }, { value: 9, label: '九年级' }],
      gradeEditList: common.gradeList,
      subjectList: [{ value: '', label: '全部' }, { value: 1, label: '语文' }, { value: 2, label: '数学' }, { value: 3, label: '英语' }],
      subjectEditList: [{ value: 1, label: '语文' }, { value: 2, label: '数学' }, { value: 3, label: '英语' }],
      courseTypeList: [{ value: 0, label: '未知' }, { value: 1, label: '系统默认' }, { value: 2, label: '其他' }],
      showList: [{ value: '', label: '全部' }, { value: 1, label: '显示' }, { value: 0, label: '不显示' }],
      showEditList: [{ value: 1, label: '显示' }, { value: 0, label: '不显示' }],
      semesterEditList: [{ value: 1, label: '上学期' }, { value: 2, label: '下学期' }],
      courseList: [],
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
        semester: 1,
        subject: 1,
        type: 1,
        display: 1,
        intro: '',
        pic: ''
      },
      selectArr: [],
      rules: {
        name: [
          { required: true, message: '名称不能为空', trigger: 'blur' }
        ],
        /* grade: [
            { required: true, message: '年级不能为空', trigger: 'change' }
          ], */
        semester: [
          { required: true, message: '学期不能为空', trigger: 'change' }
        ],
        subject: [
          { required: true, message: '科目不能为空', trigger: 'change' }
        ],
        display: [
          { required: true, message: '显示状态不能为空', trigger: 'change' }
        ],
        type: [
          { required: true, message: '课程类型不能为空', trigger: 'change' }
        ]
      },
      dialogLabelVisible: false,
      labelList: [],
      selectLabelArr: [],
      courseId: '',
      dialogLabelFormVisible: false,
      labelTemp: {
        courseId: '',
        id: 0,
        name: '',
        priority: 0
      },
      labelRules: {
        name: [
          { required: true, message: '标签名称不能为空', trigger: 'blur' }
        ],
        priority: [
          { required: true, message: '排序不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {},
  watch: {},
  created () {
  },
  async mounted () {
    await this.getOpaList()
    this.$nextTick(() => {
      this.getCourseList()
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
    handleFilter () {
      this.onSearch()
    },
    changeOpen () {
      this.onSearch()
    },
    onSearch () {
      this.courseParams.offSet = 1
      this.getCourseList()
    },
    onReset () {
      this.courseParams = {
        name: '',
        display: '',
        // grade: '',
        subject: '',
        total: 0, // 总共条数
        offSet: 0, // 页面
        offSize: 10 // 一页的条数
      }
      this.onSearch()
    },
    handleSelectionChange (val) {
      this.selectArr = val
    },
    getCourseList () {
      if (this.opaList.indexOf('list') === -1) { // 权限
        return
      }
      this.fullScreenLoading = true
      this.$nextTick(() => {
        const courseParams = Object.assign({}, this.courseParams)
        courseParams.offSet--
        this.$api.course.courseList(courseParams).then((res) => {
          if (res.rcode === 300) {
            this.courseParams.total = res.data.totalPages
            const courseList = res.data.courseList
            this.courseList = courseList
            const images = []
            courseList.forEach((value) => {
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
        // grade: 1,
        // semester: 1,
        subject: 1,
        type: 1,
        display: 1,
        intro: '',
        pic: ''
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
      this.$confirm('删除已选中的课程，是否继续？', '提示', {
        type: 'warning'
      }).then(() => {
        const courseIds = []
        this.selectArr.forEach((value) => {
          courseIds.push(value.id)
        })
        this.delCourse(courseIds).then((res) => {
          if (res.rcode === 300) {
            this.getCourseList()
            this.selectArr = []
          } else {
            // 错误提示
            this.$message.error(res.message)
          }
        })
      })
    },
    async delCourse (ids) {
      const params = {
        ids
      }
      return await this.$api.course.delCourse(params)
    },
    async handleEdit (index, row) {
      const result = await this.$api.course.getCourse({ id: row.id })
      this.temp = Object.assign({}, this.temp, result.data) // copy obj
      this.temp.id = row.id
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleDelete (index, row) {
      this.$confirm('删除该课程，是否继续？', '提示', {
        type: 'warning'
      }).then(() => {
        this.delCourse([row.id]).then((res) => {
          if (res.rcode === 300) {
            this.courseList.splice(index, 1)
          } else {
            // 提示错误
            this.$message.error(res.message)
          }
        }).catch((err) => {

        })
      })
    },
    handleCheckLesson (index, row) {
      this.$router.push({
        path: '/courseManagement/lesson/' + row.id + '/' + row.name
      })
    },
    handleCheckLabel (index, row) {
      this.courseId = row.id
      this.getLabelList(row.id)
      this.dialogLabelVisible = true
    },
    getLabelList (id) {
      const params = {
        courseId: id
      }
      this.$api.course.getCourseLabel(params).then((res) => {
        if (res.rcode === 300) {
          this.labelList = res.data.labelList
        }
      })
    },
    cancelData () {
      this.dialogFormVisible = false
    },
    createData () {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.$api.course.updateCourse(this.temp).then((res) => {
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
          this.$api.course.updateCourse(tempData).then((res) => {
            if (res.rcode === 300) {
              this.getCourseList()
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
    cancelLabelData () {
      this.dialogLabelVisible = false
    },
    handleSelectionChangeLabel (val) {
      this.selectLabelArr = val
    },
    handleCreateLabel () {
      if (this.opaList.indexOf('add') === -1) { // 权限
        return
      }
      this.resetLabelTemp()
      this.dialogStatus = 'create'
      this.dialogLabelFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataLabelForm'].clearValidate()
      })
    },
    resetLabelTemp () {
      this.labelTemp = {
        courseId: '',
        id: 0,
        name: '',
        priority: 0
      }
    },
    batchDeletionLabel () {
      if (this.selectLabelArr.length === 0) {
        // 请先选择要删除的项
        this.$message({
          message: '请先选择要删除的项',
          type: 'warning'
        })
        return
      }
      this.$confirm('删除已选中的课程，是否继续？', '提示', {
        type: 'warning'
      }).then(() => {
        const courseIds = []
        this.selectLabelArr.forEach((value) => {
          courseIds.push(value.id)
        })
        this.delLabel(courseIds).then((res) => {
          if (res.rcode === 300) {
            this.getLabelList(this.courseId)
            this.selectLabelArr = []
          } else {
            // 错误提示
            this.$message.error(res.message)
          }
        })
      })
    },
    async delLabel (ids) {
      const params = {
        ids
      }
      return await this.$api.course.delLabel(params)
    },
    handleEditLabel (index, row) {
      this.labelTemp = Object.assign({}, this.labelTemp, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogLabelFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataLabelForm'].clearValidate()
      })
    },
    handleDeleteLabel (index, row) {
      this.$confirm('删除该标签，是否继续？', '提示', {
        type: 'warning'
      }).then(() => {
        this.delLabel([row.id]).then((res) => {
          if (res.rcode === 300) {
            this.labelList.splice(index, 1)
          } else {
            // 提示错误
            this.$message.error(res.message)
          }
        }).catch((err) => {

        })
      })
    },
    cancelLabelEditData () {
      this.dialogLabelFormVisible = false
    },
    createLabelData () {
      this.$refs['dataLabelForm'].validate((valid) => {
        if (valid) {
          this.labelTemp.courseId = this.courseId
          this.$api.course.updateLabelByCourse(this.labelTemp).then((res) => {
            if (res.rcode === 300) {
              this.dialogLabelFormVisible = false
              this.$notify({
                title: '成功',
                message: '创建成功',
                type: 'success',
                duration: 2000
              })
              // 回到第一页
              this.getLabelList(this.courseId)
            } else {
              // 错误提示
            }
          }).catch(() => {

          })
        }
      })
    },
    updateLabelData () {
      this.$refs['dataLabelForm'].validate((valid) => { // 检查rule
        if (valid) {
          this.labelTemp.courseId = this.courseId
          const tempData = Object.assign({}, this.labelTemp)
          this.$api.course.updateLabelByCourse(tempData).then((res) => {
            if (res.rcode === 300) {
              this.getLabelList(this.courseId)
              this.dialogLabelFormVisible = false
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
    getInputFile (file) {
      this.temp.pic = file
    }
  }
}
</script>

<style lang="scss" scoped>
  .tips {
    color: #8492a6; font-size: 13px; line-height: 20px; word-break:break-all;
  }
  .prize-pic {
    width: 120px;
  }
</style>

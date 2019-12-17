<template>
  <div v-loading="fullScreenLoading" class="app-container">
    <el-card shadow="never" class="mb-20">
      <div slot="header" class="flex flex-pack-justify flex-align-center">
        <span class="flex1">教师带班详情</span>
      </div>
      <el-row type="flex" :gutter="20">
        <el-col :span="2">
          <div class="grid-content grid-content-title">
            教师姓名：
          </div>
        </el-col>
        <el-col :span="10">
          <div class="grid-content">
            {{ teacherData.userName }}
          </div>
        </el-col>
        <el-col :span="2">
          <div class="grid-content grid-content-title">
            教师号码：
          </div>
        </el-col>
        <el-col :span="10">
          <div class="grid-content">
            {{ teacherData.mobile }}
          </div>
        </el-col>
      </el-row>
      <el-row type="flex" :gutter="20">
        <el-col :span="2">
          <div class="grid-content grid-content-title">
            最后登录时间：
          </div>
        </el-col>
        <el-col :span="22">
          <div v-if="teacherData.lastLoginTime > 0" class="grid-content">
            {{ teacherData.lastLoginTime | parseTime('{y}-{m}-{d}') }}
          </div>
          <div v-else class="grid-content">
            无登录记录
          </div>
        </el-col>
      </el-row>
    </el-card>

    <el-card shadow="never">
      <div slot="header">
        <div class="flex flex-pack-justify flex-align-center">
          <span class="flex1">班级列表</span>
          <div>
            <el-button type="primary" size="mini" :disabled="opaList.indexOf('add') === -1 ? true : false" @click="handleAdd">
              新增带班
            </el-button>
          </div>
        </div>
      </div>

      <el-table ref="userTable" stripe :data="classList" tooltip-effect="dark" style="width: 100%" class="mt-20">
        <el-table-column
          prop="className"
          label="班名"
        />
        <el-table-column
          prop="grade"
          label="年级"
          :formatter="gradeFormatter"
        />
        <el-table-column
          prop="subject"
          label="科目"
          :formatter="subjectFormatter"
        />
        <el-table-column
          prop="schoolName"
          label="学校"
        />
        <el-table-column
          prop="role"
          label="角色"
          :formatter="roleFormatter"
        />
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!--<el-button size="mini" @click="handleClassEdit(scope.$index, scope.row)">编辑</el-button>-->
            <el-button size="mini" type="danger" :disabled="opaList.indexOf('delete') === -1 ? true : false" @click="handleClassDelete(scope.$index, scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog title="新增带班" :visible.sync="dialogAddClassFormVisible" width="890px">
      <el-form ref="addClassForm" :model="classTemp" :rules="classRules" label-position="left" label-width="80px" style="margin-left:50px;">
        <el-form-item label="学校" required>
          <el-col :span="5">
            <el-form-item>
              <el-select v-model="classTemp.provinceId" placeholder="请选择省" class="input-box" @change="changeTempProvince">
                <el-option
                  v-for="item in provinceTempList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item>
              <el-select v-model="classTemp.cityId" placeholder="请选择市" class="input-box" @change="changeTempCity">
                <el-option
                  v-for="item in cityTempList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item>
              <el-select v-model="classTemp.townId" placeholder="请选择镇区" class="input-box" @change="changeTempZone">
                <el-option
                  v-for="item in areaTempList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item prop="schoolId">
              <el-select v-model="classTemp.schoolId" placeholder="请选择学校" class="input-box" @change="changeTempSchool">
                <el-option
                  v-for="item in schoolTempList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-form-item>
        <el-form-item label="年级" prop="grade">
          <el-select v-model="classTemp.grade" placeholder="请选择年级" class="input-box" @change="changeTempGrade">
            <el-option
              v-for="item in gradeList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="classTemp.role" placeholder="请选择角色" class="input-box" @change="changeTempRole">
            <el-option
              v-for="item in roleTempList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
              :disabled="item.disabled"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="科目" prop="subject">
          <el-select v-model="classTemp.subject" placeholder="请选择科目" class="input-box" @change="changeTempSubject">
            <el-option
              v-for="item in subjectTempList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
              :disabled="item.disabled"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="可带班级" prop="classId">
          <el-select v-model="classTemp.classId" placeholder="请选择班级" class="input-box">
            <el-option
              v-for="item in classTempList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogAddClassFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="createClassData">
          确定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { parseTime, common } from '../../../utils'
import { opaMixin } from '../../../utils/mixins'
export default {
  name: 'TchClassList',
  components: {},
  filters: {},
  mixins: [opaMixin],
  data () {
    const validateSubject = (rule, value, callback) => {
      if (value === 0 && this.classTemp.role === 2) {
        callback(new Error('任课老师不能选全科'))
      } else {
        callback()
      }
    }
    const validateRole = (rule, value, callback) => {
      if (value === 2 && this.classTemp.subject === 0) {
        callback(new Error('全科只能对应班主任'))
      } else {
        callback()
      }
    }
    return {
      id: '',
      tchName: '',
      fullScreenLoading: false,
      teacherData: {}, // 当前点击的教师资料
      dialogAddClassFormVisible: false,
      classList: [],
      gradeList: [],
      classTemp: {
        teacherId: '',
        provinceId: '',
        cityId: '',
        townId: '',
        schoolId: '',
        grade: '',
        classId: '',
        subject: '',
        role: ''
      },
      classRules: {
        schoolId: [
          { required: true, message: '学校不能为空', trigger: 'change' }
        ],
        classId: [
          { required: true, message: '班级不能为空', trigger: 'change' }
        ],
        grade: [
          { required: true, message: '年级不能为空', trigger: 'change' }
        ],
        subject: [
          { required: true, message: '科目不能为空', trigger: 'change' },
          { trigger: 'change', validator: validateSubject }
        ],
        role: [
          { required: true, message: '角色不能为空', trigger: 'change' },
          { trigger: 'change', validator: validateRole }
        ]
      },
      provinceTempList: [],
      cityTempList: [],
      areaTempList: [],
      schoolTempList: [],
      classTempList: [],
      subjectTempList: [
        { value: 0, label: '全科' },
        { value: 1, label: '语文' },
        { value: 2, label: '数学' },
        { value: 3, label: '英语' },
        { value: 4, label: '体育' }
      ],
      roleTempList: [
        { value: 1, label: '班主任' },
        { value: 2, label: '任课老师' }
      ]
    }
  },
  computed: {},
  watch: {},
  created () {
    this.id = this.$route.params.id
    this.tchName = this.$route.params.title
  },
  async mounted () {
    await this.getOpaList()
    this.$nextTick(() => {
      this.tchDetail()
      this.handleCheck()
      this.getZoneList()
      this.getGrade()
    })
  },
  activated () {
  },
  destroyed () {
  },
  methods: {
    // 过滤科目
    subjectFormatter (row, column) {
      let subject = ''
      if (row.subject === 0) {
        subject = '全科'
      } else if (row.subject === 1) {
        subject = '语文老师'
      } else if (row.subject === 2) {
        subject = '数学老师'
      } else if (row.subject === 3) {
        subject = '英语老师'
      } else {
        subject = '体育老师'
      }
      return subject
    },
    // 过滤年级
    gradeFormatter (row, column) {
      const gradeArr = ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级', '七年级', '八年级', '九年级']
      return gradeArr[row.grade - 1]
    },
    // 角色过滤
    roleFormatter (row, column) {
      let role = ''
      if (row.role === 1) {
        role = '班主任'
      } else {
        role = '任课老师'
      }
      return role
    },
    // 查看教师详情
    async tchDetail () {
      const params = {
        teacherId: this.id
      }
      const res = await this.$api.user.getTeacherDetail(params)
      if (res.rcode === 300) {
        this.teacherData = res.data
      }
    },
    // 查看带班情况
    async handleCheck () {
      if (this.opaList.indexOf('list') === -1) {
        return
      }
      const params = {
        teacherId: this.id
      }
      const res = await this.$api.user.getTeacherClassList(params)
      if (res.rcode === 300) {
        this.classList = res.data.classList
      }
    },
    // 获取省市地方
    async getZoneList (areaType = 1, parentId = 0, table = 0) { // table = 0 表示 是上方搜索框用 table = 1 表示弹出框用
      const params = {
        areaType,
        parentId,
        type: 1
      }
      /* if (areaType === 1) {
          params.type = 1;
        } */
      const res = await this.$api.common.getAreaList(params)
      if (res.rcode === 300) {
        const areaList = res.data.areaList
        areaList.forEach((item) => {
          item.value = item.id
          item.label = item.name
        })
        if (areaType === 1) {
          this.provinceList = areaList
          const areaTempList = areaList.concat()
          areaTempList.splice(0, 1)
          this.provinceTempList = areaTempList
        } else if (areaType === 2 && table === 0) {
          this.cityList = areaList
        } else if (areaType === 2 && table === 1) {
          areaList.splice(0, 1)
          this.cityTempList = areaList
        } else if (areaType === 3 && table === 0) {
          this.areaList = areaList
        } else {
          areaList.splice(0, 1)
          this.areaTempList = areaList
        }
      }
    },
    // 获取学校
    async getSchool (areaId, table = 0) {
      const params = {
        areaId: areaId
      }
      const res = await this.$api.common.getSchoolByArea(params)
      if (res.rcode === 300) {
        const schoolList = res.data.schoolList
        schoolList.forEach((item) => {
          item.value = item.id
          item.label = item.name
        })
        if (table === 0) {
          this.schoolList = schoolList
        } else {
          this.schoolTempList = schoolList
        }
      }
    },
    // 获取年级
    async getGrade () {
      const res = await this.$api.common.getGrade()
      if (res.rcode === 300) {
        const gradeList = res.data.gradeList
        gradeList.forEach((item) => {
          item.value = item.id
          item.label = item.name
        })
        this.gradeList = gradeList
      }
      this.fullScreenLoading = false
    },
    // 获取班级
    async getClassList () {
      if (this.classTemp.grade === '' || this.classTemp.role === '' || this.classTemp.subject === '' || this.classTemp.schoolId === '') {
        return
      }
      const params = {
        grade: this.classTemp.grade,
        role: this.classTemp.role,
        teacherId: this.classTemp.teacherId,
        schoolId: this.classTemp.schoolId,
        subject: this.classTemp.subject
      }
      const res = await this.$api.user.getClassByTeacher(params)
      if (res.rcode === 300) {
        const classList = res.data.classList
        classList.forEach((item) => {
          item.value = item.id
          item.label = item.name
        })
        this.classTempList = classList
      }
    },
    // 选择省后
    changeTempProvince (value) {
      this.clearTempZoneList(2)
      this.getZoneList(2, this.classTemp.provinceId, 1)
      this.getSchool(this.classTemp.provinceId, 1)
    },
    // 选择城市后
    changeTempCity (value) {
      this.clearTempZoneList(3)
      this.getZoneList(3, this.classTemp.cityId, 1)
      this.getSchool(this.classTemp.cityId, 1)
    },
    // 选择镇区后
    changeTempZone (value) {
      this.clearTempZoneList(4)
      this.getSchool(this.classTemp.townId, 1)
    },
    // 选择学校后
    changeTempSchool (value) {
      this.getClassList()
    },
    // 选择角色之后
    changeTempRole (value) {
      this.classTemp.subject = ''
      const subjectItem = this.subjectTempList[0]
      if (value === 1) {
        subjectItem.disabled = false
      } else {
        subjectItem.disabled = true
      }
      this.subjectTempList.splice(0, 1, subjectItem)
      this.getClassList()
    },
    // 选择年级之后
    changeTempGrade () {
      this.getClassList()
    },
    // 选择科目之后
    changeTempSubject (value) {
      this.getClassList()
    },
    // 进行编辑
    async handleEdit (index, row) {
      const params = {
        teacherId: row.id
      }
      const res = await this.$api.user.getTeacherDetail(params)
      if (res.rcode === 300) {
        this.temp = Object.assign({}, res.data, row)
        this.oriMobile = row.mobile
        this.dialogStatus = 'update'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      }
    },
    // 清空地区选项
    clearTempZoneList (listNum) {
      for (let i = 1, l = 6; i < l; i++) {
        if (i === 1 && i >= listNum) {
          this.classTemp.provinceId = ''
        }
        if (i === 2 && i >= listNum) {
          this.classTemp.cityId = ''
          this.cityTempList = []
        }
        if (i === 3 && i >= listNum) {
          this.classTemp.townId = ''
          this.areaTempList = []
        }
        if (i === 4 && i >= listNum) {
          this.classTemp.schoolId = ''
          this.schoolTempList = []
        }
        if (i === 5 && i >= listNum) {
          this.classTemp.classId = ''
          this.classTempList = []
        }
      }
    },
    // 格式化班级模板
    clearClassTemp () {
      this.classTemp = {
        teacherId: '',
        provinceId: '',
        cityId: '',
        townId: '',
        schoolId: '',
        classId: '',
        grade: '',
        subject: '',
        role: ''
      }
    },
    // 新增绑定班级
    handleAdd () {
      // this.temp = Object.assign({}, row);
      this.clearClassTemp()
      this.classTemp.teacherId = this.id
      this.clearTempZoneList(2)
      this.dialogAddClassFormVisible = true
      this.$nextTick(() => {
        this.$refs['addClassForm'].clearValidate()
      })
    },
    // 确定创建绑定班级
    createClassData () {
      this.$refs['addClassForm'].validate((valid) => {
        if (valid) {
          const classData = Object.assign({}, this.classTemp)
          this.$api.user.addTeacherClass(this.classTemp).then((res) => {
            if (res.rcode === 300) {
              this.dialogAddClassFormVisible = false
              this.$notify({
                title: '成功',
                message: '绑定成功',
                type: 'success',
                duration: 2000
              })
              this.handleCheck()
            } else {
              // 失败提示
              this.$message.error(res.message)
            }
          }).catch((err) => {

          })
        }
      })
    },
    handleClassDelete (index, row) {
      this.$confirm('是否删除该班？', '提示', {
        type: 'warning'
      }).then(() => {
        const params = {
          id: row.id
        }
        this.$api.user.delTeacherClass(params).then((res) => {
          if (res.rcode === 300) {
            this.classList.splice(index, 1)
            this.getTchList()
          } else {
            // 失败提示
            this.$message.error(res.message)
          }
        }).catch((err) => {

        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .input-box {
    width: 140px;
  }
  .class-input-box {
    width: 100px;
  }

  .row-bg {
    background: #f2f2f2;
  }
  .grid-content {
    height: 40px;
    line-height: 40px;
    font-size: 14px;

    &.grid-content-title {
      text-align: right;
      font-weight: bold;
    }
  }
</style>

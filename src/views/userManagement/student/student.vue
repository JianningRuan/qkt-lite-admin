<template>
  <div v-loading="fullScreenLoading" class="app-container">
    <el-card shadow="never" class="mb-20">
      <el-form ref="form" :inline="false" :model="userParams" label-width="80px" size="mini">
        <el-form-item label="学生姓名">
          <el-input v-model="userParams.userName" placeholder="学生姓名" class="filter-item input-box" @change="onSearch" @keyup.enter.native="handleFilter" />
        </el-form-item>
        <el-form-item label="学生号码">
          <el-input v-model="userParams.mobile" placeholder="绑定号码" class="filter-item input-box" @change="onSearch" @keyup.enter.native="handleFilter" />
          <el-button type="text" style="padding-bottom: 0; padding-top: 0;" @click="showOrHideForm">
            {{ showMore ? '收起' : '展开' }}<i :class="showMore ? 'el-icon-arrow-up' : 'el-icon-arrow-down'" />
          </el-button>
        </el-form-item>
      </el-form>
      <el-form v-show="showMore" ref="moreForm" :inline="false" :model="userParams" label-width="80px" size="mini">
        <el-form-item label="学校">
          <el-select v-model="userParams.provinceId" clearable placeholder="请选择省" class="input-box" @change="changeProvince">
            <el-option v-for="item in provinceList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <el-select v-model="userParams.cityId" clearable placeholder="请选择市" class="input-box" @change="changeCity">
            <el-option v-for="item in cityList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <el-select v-model="userParams.townId" clearable placeholder="请选择镇区" class="input-box" @change="changeTown">
            <el-option v-for="item in townList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <el-select v-model="userParams.schoolId" clearable placeholder="请选择学校" class="input-box" @change="changeSchool">
            <el-option v-for="item in schoolList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="年级">
          <el-select v-model="userParams.grade" clearable placeholder="请选择年级" class="class-input-box" @change="changeGrade">
            <el-option v-for="item in gradeList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item clearable label="班级">
          <el-select v-model="userParams.classId" placeholder="请选择班级" class="class-input-box" @change="changeClass">
            <el-option v-for="item in classNameList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
      </el-form>
      <el-form :inline="false" label-width="80px" size="mini">
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
        <span class="flex1">学生列表</span>
        <div>
          <el-button type="primary" size="mini" :disabled="opaList.indexOf('add') === -1 ? true : false" @click="handleCreate">
            新增
          </el-button>
          <el-button type="primary" size="mini" :disabled="opaList.indexOf('impl') === -1 ? true : false" @click="uploadExcel">
            导入
          </el-button>
          <el-button type="danger" size="mini" :disabled="opaList.indexOf('delete') === -1 ? true : false" @click="batchDeletion">
            批量删除
          </el-button>
        </div>
      </div>

      <el-table ref="userTable" stripe :data="stuList" tooltip-effect="dark" style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="userName" label="姓名" width="120" />
        <el-table-column prop="mobile" label="手机号码" width="120" />
        <el-table-column prop="grade" label="年级" width="120" :formatter="gradeFormatter" />
        <el-table-column prop="className" label="班级" width="120" />
        <el-table-column prop="schoolName" label="学校" show-overflow-tooltip />
        <el-table-column prop="source" label="来源" />
        <el-table-column label="最后登录日期" width="220" prop="lastLoginTime" :formatter="loginTimeFormatter">
          <!--<template slot-scope="scope">{{scope.row.lastLoginTime | parseTime('{y}-{m}-{d}')}}</template>-->
        </el-table-column>
        <el-table-column label="操作" width="220">
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

      <pagination v-show="userParams.total > 0" :total="userParams.total" :page.sync="userParams.offSet" :limit.sync="userParams.offSize" @pagination="getStuList" />
    </el-card>

    <el-dialog title="导入学生EXCEL" :visible.sync="dialogVisible" width="30%" :before-close="handleClose">
      <div v-loading="excelLoading" element-loading-text="正在导入， 请耐心等候...">
        <upload-excel-component :on-success="handleSuccess" :before-upload="beforeUpload" />
      </div>
      <el-button type="text" @click="downExcel">
        下载学生导入模板
      </el-button>
    </el-dialog>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="890px" @close="cancelData">
      <el-form ref="dataForm" :model="temp" :rules="rules" label-position="left" label-width="80px" style="margin-left:50px;">
        <el-form-item label="学生姓名" prop="userName">
          <el-input v-model="temp.userName" placeholder="学生姓名" class="filter-item input-box" />
        </el-form-item>
        <el-form-item label="学生号码" prop="mobile">
          <el-input v-model="temp.mobile" placeholder="绑定号码" class="filter-item input-box" :disabled="dialogStatus === 'update' ? true : false" />
        </el-form-item>
        <el-form-item label="家长号码" prop="parentMobile">
          <el-row type="flex" style="flex-wrap: wrap;">
            <el-col v-for="(parentMobile, index) in temp.parentMobile" :key="index" :span="5">
              <div class="mobile-input-wrapper">
                <el-input v-model="temp.parentMobile[index]" placeholder="绑定号码" class="filter-item input-box" />
                <a class="mobile-del el-icon-close" @click="clearParentPhone(index)" />
              </div>
            </el-col>
            <el-col :span="1">
              <el-button size="mini" type="primary" icon="el-icon-plus" circle @click="addPhoneInput" />
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="学校" required>
          <el-col :span="5">
            <el-form-item>
              <el-select v-model="temp.provinceId" placeholder="请选择省" class="input-box" @change="changeTempProvince">
                <el-option v-for="item in provinceTempList" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item>
              <el-select v-model="temp.cityId" placeholder="请选择市" class="input-box" @change="changeTempCity">
                <el-option v-for="item in cityTempList" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item>
              <el-select v-model="temp.townId" placeholder="请选择镇区" class="input-box" @change="changeTempTown">
                <el-option v-for="item in townTempList" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item prop="schoolId">
              <el-select v-model="temp.schoolId" placeholder="请选择学校" class="input-box" @change="changeTempSchool">
                <el-option v-for="item in schoolTempList" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-form-item>
        <el-form-item label="年级" prop="grade">
          <el-select v-model="temp.grade" placeholder="请选择年级" class="input-box" @change="changeTempGrade">
            <el-option v-for="item in gradeTempList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="班级" prop="classId">
          <el-select v-model="temp.classId" placeholder="请选择班级" class="input-box">
            <el-option v-for="item in classNameTempList" :key="item.value" :label="item.label" :value="item.value" />
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

    <!--导入失败弹窗-->
    <el-dialog title="导入结果" :visible.sync="dialogExcelErrorVisible" :before-close="handleCloseExcelErrorVisible">
      <div class="mb-20">
        {{ dialogExcelErrorMessage }}
      </div>
      <el-table :data="excelFailedList" height="250" style="width: 100%">
        <el-table-column prop="row" label="错误行数" width="180" />
        <el-table-column prop="errorMsg" label="错误信息" />
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="closeExcelErrorVisible">
          确定
        </el-button>
      </div>
    </el-dialog>
    <!--导入失败弹窗-end-->
  </div>
</template>
<script>
import Pagination from '@/components/Pagination' // 分页
import UploadExcelComponent from '@/components/UploadExcel/index.vue' // 导入excel
import { parseTime, common } from '../../../utils'
import { opaMixin } from '../../../utils/mixins'

export default {
  name: 'StuManagement',
  components: {
    Pagination,
    UploadExcelComponent
  },
  filters: {},
  mixins: [opaMixin],
  data () {
    const validateMobile = (rule, value, callback) => {
      const isMobile = common.isMobile(value)
      if (isMobile) {
        callback()
      } else {
        callback(new Error('含有非电话号码字符'))
      }
    }
    const validateParentMobile = (rule, value, callback) => {
      if (new Set(value).size !== value.length) {
        callback(new Error('含有重复号码'))
        return
      }
      let isMobileNum = 0
      value.forEach((item) => {
        const isMobile = common.isMobile(item)
        if (!isMobile) {
          isMobileNum++
        }
      })
      if (isMobileNum === 0) {
        // 接口判断
        const checkList = []
        value.map((item) => {
          checkList.push(
            new Promise((resolve, reject) => {
              const params = {
                mobile: item,
                role: 2
              }
              this.$api.common.checkMobile(params).then((res) => {
                if (res.rcode === 300) {
                  resolve(res.data)
                } else {
                  reject(res.message)
                }
              }).catch((err) => {

              })
            })
          )
        })
        Promise.all(checkList).then((res) => {
          const errorPhoneArr = []
          res.forEach((result, index) => {
            if (!result.result) {
              errorPhoneArr.push(value[index])
            }
          })
          if (errorPhoneArr.length > 0) {
            callback(new Error(`${errorPhoneArr.join(',')}号码的家长不存在`))
          } else {
            callback()
          }
        }).catch((err) => {

        })
      } else {
        callback(new Error('含有非电话号码字符'))
      }
    }
    const validateGrade = (rule, value, callback) => {
      if (value === 0) {
        callback(new Error('不能选全部'))
      }
      callback()
    }
    const validateClass = (rule, value, callback) => {
      if (value === 0) {
        callback(new Error('不能选全部'))
      }
      callback()
    }
    return {
      showMore: false,
      fullScreenLoading: false,
      dialogVisible: false, // 是否显示上传EXCEL表单弹层
      userParams: {
        userName: '',
        mobile: '',
        provinceId: '',
        cityId: '',
        townId: '',
        schoolId: '',
        grade: '',
        classId: '',
        total: 0, // 总共条数
        offSet: 0, // 页面
        offSize: 10 // 一页的条数
      }, // 搜索条件
      gradeList: [],
      provinceList: [],
      cityList: [],
      townList: [],
      schoolList: [],
      classNameList: [],
      stuList: [], // 用户列表数组
      temp: {
        id: 0,
        pic: '',
        userName: '',
        mobile: null,
        parentMobile: [],
        role: 1,
        provinceId: '',
        cityId: '',
        townId: '',
        schoolId: '',
        schoolName: '',
        grade: '',
        classId: '',
        lastLoginTime: 0
      }, // 用户资料模板
      oriMobile: '', // 修改资料时候记录原本的手机号码以备比较
      rules: {
        userName: [
          { required: true, message: '姓名不能为空', trigger: 'blur' }
        ],
        mobile: [
          { required: true, trigger: 'blur', message: '手机号码不能为空' },
          { trigger: 'blur', validator: validateMobile }
        ],
        parentMobile: [
          { required: true, trigger: 'blur', message: '手机号码不能为空' },
          { trigger: 'blur', validator: validateParentMobile }
        ],
        schoolId: [
          { required: true, message: '学校不能为空', trigger: 'change' }
        ],
        grade: [
          { required: true, trigger: 'change', validator: validateGrade }
        ],
        classId: [
          { required: true, trigger: 'change', validator: validateClass }
        ]
      },
      provinceTempList: [],
      cityTempList: [],
      townTempList: [],
      schoolTempList: [],
      gradeTempList: [],
      classNameTempList: [],
      dialogFormVisible: false, // 是否显示编辑弹层
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '创建'
      },
      delArr: [], // 需删除的项
      imageCropperShow: false,
      imageCropperKey: 0,
      excelTime: '', // 循环导入时监听返回的setInterval
      excelTimeNum: 0, // 计算循环的累计时间
      excelLoading: false,
      dialogExcelErrorVisible: false,
      dialogExcelErrorMessage: '',
      excelFailedList: []
    }
  },
  computed: {},
  watch: {},
  created () {},
  async mounted () {
    await this.getOpaList()
    this.$nextTick(() => {
      this.getOpaList()
      this.getZoneList()
      this.getStuList()
      this.getGradeList()
    })
  },
  activated () {},
  destroyed () {},
  methods: {
    showOrHideForm () {
      const showMore = this.showMore
      this.showMore = !showMore
    },
    // 获取年级
    async getGradeList () {
      const params = {
        type: 1
      }
      const res = await this.$api.common.getGrade(params)
      if (res.rcode === 300) {
        const gradeList = res.data.gradeList
        gradeList.forEach((item) => {
          item.value = item.id
          item.label = item.name
        })
        this.gradeList = gradeList
        const gradeTempList = gradeList.concat()
        gradeTempList.splice(0, 1)
        this.gradeTempList = gradeTempList
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
          this.townList = areaList
        } else {
          areaList.splice(0, 1)
          this.townTempList = areaList
        }
      }
    },
    // 选择省后
    changeProvince (value) {
      if (value === '') {
        this.clearZoneList(2)
        // this.schoolList = [];
      } else {
        this.clearZoneList(2)
        this.getZoneList(2, this.userParams.provinceId)
        if (value !== 0) {
          this.getSchool(this.userParams.provinceId)
        }
      }
      this.$nextTick(() => {
        this.onSearch()
      })
    },
    // 选择城市后
    changeCity (value) {
      if (value === '' || value === 0) {
        this.clearZoneList(3)
        if (value === 0) {
          this.getZoneList(3, this.userParams.cityId)
        }
        if (this.userParams.provinceId !== '' && this.userParams.provinceId !== 0) {
          this.getSchool(this.userParams.provinceId)
        }
      } else {
        this.clearZoneList(3)
        this.getZoneList(3, this.userParams.cityId)
        this.getSchool(this.userParams.cityId)
      }
      this.$nextTick(() => {
        this.onSearch()
      })
    },
    // 选择镇区后
    changeTown (value) {
      this.clearZoneList(4)
      let areaId
      if (this.userParams.townId !== '' && this.userParams.townId !== 0) {
        areaId = this.userParams.townId
      } else if (this.userParams.cityId !== '' && this.userParams.cityId !== 0) {
        areaId = this.userParams.cityId
      } else {
        areaId = this.userParams.provinceId
      }
      if (areaId !== 0 && areaId !== '') {
        this.getSchool(areaId)
      }
      this.$nextTick(() => {
        this.onSearch()
      })
    },
    // 清空地区选项
    clearZoneList (listNum) {
      for (let i = 1, l = 7; i < l; i++) {
        if (i === 1 && i >= listNum) {
          this.userParams.provinceId = ''
        }
        if (i === 2 && i >= listNum) {
          this.userParams.cityId = ''
          this.cityList = []
        }
        if (i === 3 && i >= listNum) {
          this.userParams.townId = ''
          this.townList = []
        }
        if (i === 4 && i >= listNum) {
          this.userParams.schoolId = ''
          this.schoolList = []
        }
        if (i === 5 && i >= listNum) {
          this.userParams.grade = ''
        }
        if (i === 6 && i >= listNum) {
          this.userParams.classId = ''
          this.classNameList = []
        }
      }
    },
    // 获取学校
    async getSchool (areaId, table = 0) { // table = 0 为搜索， 1为编辑
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
    // 选择学校后
    changeSchool () {
      this.clearZoneList(5)
      this.$nextTick(() => {
        this.onSearch()
      })
    },
    // 获取学生列表
    getStuList () {
      if (this.opaList.indexOf('list') === -1) {
        return
      }
      this.fullScreenLoading = true
      this.$nextTick(() => {
        const userParams = Object.assign({}, this.userParams)
        userParams.offSet--
        this.$api.user.getStudentList(userParams).then((res) => {
          if (res.rcode === 300) {
            this.userParams.total = res.data.totalPages
            this.stuList = res.data.userList
          }
          this.changePage()
          this.fullScreenLoading = false
        }).catch((err) => {

        })
      })
    },
    // 过滤年级
    gradeFormatter (row, column) {
      const gradeArr = ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级', '七年级', '八年级', '九年级']
      return gradeArr[row.grade - 1]
    },
    // 过滤最后登录时间
    loginTimeFormatter (row, column) {
      if (row.lastLoginTime === 0) {
        return '无登录记录'
      } else {
        return parseTime(row.lastLoginTime, '{y}-{m}-{d}')
      }
    },
    // 翻页后
    changePage () {
      this.delArr = []
    },
    // 选择年级后
    changeGrade (value) {
      if (this.userParams.schoolId !== '') {
        this.getClassList()
      }
      this.$nextTick(() => {
        this.onSearch()
      })
    },
    // 选择班别后
    changeClass () {
      this.$nextTick(() => {
        this.onSearch()
      })
    },
    // 获取班级列表
    async getClassList () {
      const params = {
        grade: this.userParams.grade,
        schoolId: this.userParams.schoolId
      }
      const res = await this.$api.common.getClassBySchool(params)
      if (res.rcode === 300) {
        const classNameList = res.data.classList
        classNameList.forEach((item) => {
          item.value = item.id
          item.label = item.name
        })
        this.classNameList = classNameList
      }
    },
    handleFilter () {
      this.onSearch()
    },
    // 搜索
    onSearch () {
      this.userParams.offSet = 1
      this.getStuList()
    },
    // 重置
    onReset () {
      this.userParams = {
        userName: '',
        mobile: '',
        provinceId: '',
        cityId: '',
        townId: '',
        schoolId: '',
        grade: '',
        classId: '',
        total: 0, // 总共条数
        offSet: 0, // 页面
        offSize: 10 // 一页的条数
      }
      this.onSearch()
    },
    // 初始化新增内容
    resetTemp () {
      this.temp = {
        id: 0,
        pic: '',
        userName: '',
        mobile: null,
        parentMobile: null,
        role: 1,
        provinceId: '',
        cityId: '',
        townId: '',
        schoolId: '',
        schoolName: '',
        grade: '',
        classId: '',
        lastLoginTime: 0
      }
    },
    // 新增
    handleCreate () {
      this.resetTemp()
      const userParams = Object.assign({}, this.userParams)
      this.temp.provinceId = userParams.provinceId
      if (userParams.provinceId !== '') {
        this.getZoneList(2, userParams.provinceId, 1)
      }
      if (userParams.cityId !== '') {
        this.temp.cityId = userParams.cityId
        this.getZoneList(3, userParams.cityId, 1)
      }
      if (userParams.townId !== '') {
        this.temp.townId = userParams.townId
        this.getZoneList(4, userParams.townId, 1)
      }
      if (userParams.schoolId !== '') {
        this.temp.schoolId = userParams.schoolId
        this.getSchool(userParams.townId, 1)
      }
      this.temp.parentMobile = ['']
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    // 选择省后
    changeTempProvince (value) {
      this.clearTempZoneList(2)
      this.getZoneList(2, this.temp.provinceId, 1)
      this.getSchool(this.temp.provinceId, 1)
    },
    // 选择城市后
    changeTempCity (value) {
      this.clearTempZoneList(3)
      this.getZoneList(3, this.temp.cityId, 1)
      this.getSchool(this.temp.cityId, 1)
    },
    // 选择镇区后
    changeTempTown (value) {
      this.clearTempZoneList(4)
      this.getSchool(this.temp.townId, 1)
    },
    // 选择学校后
    changeTempSchool () {},
    // 选择年级后
    changeTempGrade () {
      if (this.temp.schoolId !== '') {
        this.clearTempZoneList(6)
        this.getClassTempList()
      }
    },
    // 获取班级列表
    async getClassTempList () {
      const params = {
        grade: this.temp.grade,
        schoolId: this.temp.schoolId
      }
      const res = await this.$api.common.getClassBySchool(params)
      if (res.rcode === 300) {
        const classNameList = res.data.classList
        classNameList.forEach((item) => {
          item.value = item.id
          item.label = item.name
        })
        this.classNameTempList = classNameList
      }
    },
    // 清空地区选项
    clearTempZoneList (listNum) {
      for (let i = 1, l = 7; i < l; i++) {
        if (i === 1 && i >= listNum) {
          this.temp.provinceId = ''
        }
        if (i === 2 && i >= listNum) {
          this.temp.cityId = ''
          this.cityTempList = []
        }
        if (i === 3 && i >= listNum) {
          this.temp.townId = ''
          this.townTempList = []
        }
        if (i === 4 && i >= listNum) {
          this.temp.schoolId = ''
          this.schoolTempList = []
        }
        if (i === 5 && i >= listNum) {
          this.temp.grade = ''
        }
        if (i === 6 && i >= listNum) {
          this.temp.classId = ''
          this.classNameTempList = []
        }
      }
    },
    // 确认新增
    createData () {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          // 提交
          this.$api.user.updateStudent(this.temp).then((res) => {
            if (res.rcode === 300) {
              // 提交之后
              // this.stuList.unshift(this.temp)
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
              // 提示错误
            }
          }).catch((err) => {

          })
        }
      })
    },
    handleSelectionChange (val) {
      this.delArr = val
    },
    // 进行编辑
    async handleEdit (index, row) {
      const params = {
        studentId: row.id
      }
      const res = await this.$api.user.getStudentDetail(params)
      if (res.rcode === 300) {
        this.oriMobile = row.mobile
        if (res.data.provinceId === undefined) {
          res.data.provinceId = ''
        }
        if (res.data.cityId === undefined) {
          res.data.cityId = ''
        }
        if (res.data.townId === undefined) {
          res.data.townId = ''
        }
        if (res.data.schoolId === undefined) {
          res.data.schoolId = ''
        }
        if (res.data.classId === undefined) {
          res.data.classId = ''
        }
        this.temp = Object.assign({}, res.data, row) // copy obj
        if (this.temp.provinceId !== '' && this.temp.provinceId !== 0 && this.temp.provinceId !== undefined) {
          this.getZoneList(2, this.temp.provinceId, 1)
        } else {
          this.temp.provinceId = ''
        }
        if (this.temp.cityId !== '' && this.temp.cityId !== 0 && this.temp.cityId !== undefined) {
          this.getZoneList(3, this.temp.cityId, 1)
        } else {
          this.temp.cityId = ''
        }
        if (this.temp.townId !== '' && this.temp.townId !== 0 && this.temp.townId !== undefined) {
          this.getZoneList(4, this.temp.townId, 1)
        } else {
          this.temp.townId = ''
        }
        if (this.temp.schoolId !== '' && this.temp.schoolId !== undefined) {
          let areaId
          if (this.temp.townId !== '') {
            areaId = this.temp.townId
          } else if (this.temp.cityId !== '') {
            areaId = this.temp.cityId
          } else {
            areaId = this.temp.provinceId
          }
          this.getSchool(areaId, 1)
        } else {
          this.temp.schoolId = ''
        }
        if (this.temp.classId !== '' && this.temp.classId !== undefined) {
          this.getClassTempList()
        } else {
          this.temp.classId = ''
        }
        this.dialogStatus = 'update'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      }
    },
    // 修改中清除父母手机号
    clearParentPhone (index) {
      this.temp.parentMobile.splice(index, 1)
    },
    // 增加父母手机输入框
    addPhoneInput () {
      for (const v of this.temp.parentMobile) {
        if (v === '') {
          return
        }
      }
      if (this.temp.parentMobile.length > 3) { // 超过三个就不给增加
        return
      }
      this.temp.parentMobile.push('')
    },
    // 确认修改
    updateData () {
      this.$refs['dataForm'].validate((valid) => { // 检查rule
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          // 提交
          this.$api.user.updateStudent(this.temp).then((res) => {
            if (res.rcode === 300) {
              // 提交之后
              for (const w of this.classNameTempList) {
                if (w.value === this.temp.classId) {
                  this.temp.className = w.name
                  break
                }
              }
              for (const v of this.stuList) {
                if (v.id === tempData.id) {
                  const index = this.stuList.indexOf(v)
                  this.stuList.splice(index, 1, this.temp)
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
    // 取消
    cancelData () {
      this.dialogFormVisible = false
      this.cityTempList = []
      this.townTempList = []
      this.schoolTempList = []
      // this.gradeTempList = [];
      this.classNameTempList = []
    },
    // 单个删除
    handleDelete (index, row) {
      this.$confirm('删除用户将会解除与所有家长的绑定，是否继续？', '提示', {
        type: 'warning'
      }).then(() => {
        this.delStu([row.id]).then((res) => {
          if (res.rcode === 300) {
            this.stuList.splice(index, 1)
          } else {
            // 提示错误
            this.$message.error(res.message)
          }
        }).catch((err) => {

        })
      })
    },
    // 批量删除
    batchDeletion () {
      if (this.delArr.length === 0) {
        // 请先选择要删除的项
        this.$message({
          message: '请先选择要删除的项',
          type: 'warning'
        })
        return
      }
      this.$confirm('删除用户将会解除与所有家长的绑定，是否继续？', '提示', {
        type: 'warning'
      }).then(() => {
        const userIdArr = []
        this.delArr.forEach((value) => {
          userIdArr.push(value.id)
        })
        // let userIds = userIdArr.join(',');
        this.delStu(userIdArr).then((res) => {
          if (res.rcode === 300) {
            this.getStuList()
          } else {
            // 错误提示
            this.$message.error(res.message)
          }
        })
      })
    },
    // 进行学生的删除
    async delStu (ids) {
      const params = {
        ids
      }
      return await this.$api.user.delStudent(params)
    },
    beforeUpload (file) {
      const isLt1M = file.size / 1024 / 1024 < 1

      if (isLt1M) {
        return true
      }

      this.$message({
        message: '请不要上传大小超过1M的文件.',
        type: 'warning'
      })
      return false
    },
    async handleSuccess ({ results, header, rawFile }) {
      this.excelLoading = true
      const tableData = results
      const tableHeader = header
      const formData = new FormData()
      formData.append('file', rawFile)
      const res = await this.$api.user.importStudentExcel(formData)
      if (res.rcode === 300) {
        const key = res.data.key
        this.excelTime = setInterval(() => { // 循环发送接口检测导入是否完成
          this.excelTimeNum += 4000
          if (this.excelTimeNum >= 3600000) {
            clearInterval(this.excelTime)
            this.excelTimeNum = 0
            // 弹窗提示超时
            const message = `导入超时，请重试`
            this.$alert(message, '提示', {
              callback: action => {
                this.handleClose()
              }
            })
            return false
          }
          const params = {
            key: key
          }
          this.$api.user.checkState(params).then((result) => {
            if (result.rcode === 300 && result.data !== null) {
              clearInterval(this.excelTime)
              const excelTimeNum = this.excelTimeNum
              this.excelTimeNum = 0
              const data = result.data
              let message = ''
              if (data.success && data.failedList.length === 0) {
                // 导入成功
                message = `一共导入${data.totalCount}名学生，成功绑定${data.successSCount}名，失败${data.failSCount}名，共耗时${excelTimeNum / 1000}秒。`
                this.$alert(message, '提示', {
                  callback: action => {
                    this.handleClose()
                    // 跳转到首页
                    this.onReset()
                  }
                })
              } else {
                // 导入失败
                this.excelFailedList = data.failedList
                this.dialogExcelErrorMessage = `一共导入${data.totalCount}名学生，成功绑定${data.successSCount}名，失败${data.failSCount}名，共耗时${excelTimeNum / 1000}秒。`
                this.dialogExcelErrorVisible = true
                /* data.failedList.forEach((failed)=>{
                    message += `EXCEL表中第${failed.row}行出现错误：${failed.errorMsg}`;
                  });
                  this.$alert(message, '提示', {
                    callback: action => {
                      this.handleClose()
                    }
                  }) */
              }
            } else {
              // 出错
              console.log('导入出错')
            }
          })
        }, 4000)
      }
    },
    // 弹层关闭
    handleClose () {
      this.excelLoading = false
      this.dialogVisible = false
      clearInterval(this.excelTime)
      this.excelTimeNum = 0
    },
    // 点击打开导入弹层
    uploadExcel () {
      this.dialogVisible = true
    },
    // 关闭导入错误报告弹窗
    closeExcelErrorVisible () {
      this.dialogExcelErrorVisible = false
      this.dialogExcelErrorMessage = ''
      this.handleClose()
      // 跳转到首页
      this.onReset()
    },
    handleCloseExcelErrorVisible (done) {
      done()
      this.handleClose()
    },
    // 下载模板
    downExcel () {
      window.open('http://qtone-qkt.callmesoul.cn/lite/admin/xxt/excel/student.xlsx')
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
  .mobile-input-wrapper {
    width: 140px;
    position: relative;
    .mobile-del {
      position: absolute;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: block;
      text-align: center;
      line-height: 20px;
      right: 5px;
      top: 10px;
      &:hover {
        background: #909399;
        color: #fff;
      }
    }
  }
</style>

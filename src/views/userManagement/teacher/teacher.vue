<template>
  <div v-loading="fullScreenLoading" class="app-container">
    <el-card shadow="never" class="mb-20">
      <el-form ref="form" :inline="false" :model="userParams" label-width="80px" size="mini">
        <el-form-item label="教师姓名">
          <el-input v-model="userParams.userName" placeholder="教师姓名" class="filter-item input-box" @change="onSearch" @keyup.enter.native="handleFilter" />
        </el-form-item>
        <el-form-item label="教师号码">
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
          <el-select v-model="userParams.townId" clearable placeholder="请选择镇区" class="input-box" @change="changeZone">
            <el-option v-for="item in areaList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <el-select v-model="userParams.schoolId" clearable placeholder="请选择学校" class="input-box" @change="changeSchool">
            <el-option v-for="item in schoolList" :key="item.value" :label="item.label" :value="item.value" />
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
        <span class="flex1">教师列表</span>
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

      <el-table ref="userTable" stripe :data="tchList" tooltip-effect="dark" style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="userName" label="姓名" width="120" />
        <el-table-column prop="mobile" label="手机号码" />
        <el-table-column prop="schoolName" label="学校" />
        <el-table-column prop="source" label="来源" />
        <!--<el-table-column label="最后登录时间" prop="lastLoginTime" :formatter="loginTimeFormatter"> -->
        <!--<template slot-scope="scope">{{scope.row.lastLoginTime | parseTime('{y}-{m}-{d}')}}</template>-->
        <!--</el-table-column>-->
        <el-table-column label="操作" width="280">
          <template slot-scope="scope">
            <el-button size="mini" :disabled="opaList.indexOf('edit') === -1 ? true : false" @click="handleEdit(scope.$index, scope.row)">
              编辑
            </el-button>
            <el-button size="mini" :disabled="opaList.indexOf('query') === -1 ? true : false" @click="handleCheckClass(scope.$index, scope.row)">
              查看带班
            </el-button>
            <!--<el-button size="mini" @click="handleCheck(scope.$index, scope.row)" :disabled="opaList.indexOf('query') === -1 ? true : false">查看带班</el-button>
            <el-button size="mini" @click="handleAdd(scope.$index, scope.row)" :disabled="opaList.indexOf('add') === -1 ? true : false">新增带班</el-button>-->
            <el-button size="mini" type="danger" :disabled="opaList.indexOf('delete') === -1 ? true : false" @click="handleDelete(scope.$index, scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="userParams.total > 0" :total="userParams.total" :page.sync="userParams.offSet" :limit.sync="userParams.offSize" @pagination="getTchList" />
    </el-card>

    <el-dialog
      title="导入教师EXCEL"
      :visible.sync="dialogVisible"
      width="30%"
      :before-close="handleClose"
    >
      <div v-loading="excelLoading" element-loading-text="正在导入， 请耐心等候...">
        <upload-excel-component :on-success="handleSuccess" :before-upload="beforeUpload" />
      </div>
      <el-button type="text" @click="downExcel">
        下载教师导入模板
      </el-button>
    </el-dialog>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :model="temp" :rules="rules" label-position="left" label-width="80px" style="margin-left:50px;">
        <el-form-item label="教师姓名" prop="userName">
          <el-input v-model="temp.userName" placeholder="教师姓名" />
        </el-form-item>
        <el-form-item label="教师号码" prop="mobile">
          <el-input v-model="temp.mobile" placeholder="教师号码" :disabled="dialogStatus === 'update' ? true : false" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          确定
        </el-button>
      </div>
    </el-dialog>

    <el-dialog title="查看教师带班情况" :visible.sync="dialogClassFormVisible" width="890px">
      <el-row type="flex" class="row-bg" :gutter="20">
        <el-col :span="4">
          <div class="grid-content grid-content-title">
            教师姓名：
          </div>
        </el-col>
        <el-col :span="6">
          <div class="grid-content">
            {{ teacherData.userName }}
          </div>
        </el-col>
        <el-col :span="4">
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
      <el-row type="flex" class="row-bg" :gutter="20">
        <el-col :span="4">
          <div class="grid-content grid-content-title">
            最后登录时间：
          </div>
        </el-col>
        <el-col :span="6">
          <div v-if="teacherData.lastLoginTime > 0" class="grid-content">
            {{ teacherData.lastLoginTime | parseTime('{y}-{m}-{d}') }}
          </div>
          <div v-else class="grid-content">
            无登录记录
          </div>
        </el-col>
        <el-col :span="4">
          <div class="grid-content grid-content-title">
            操作：
          </div>
        </el-col>
        <el-col :span="10">
          <div class="grid-content">
            <el-button size="mini" @click="handleEdit(teacherIndex, teacherData)">
              编辑
            </el-button>
            <el-button size="mini" @click="handleAdd(teacherIndex, teacherData)">
              新增带班
            </el-button>
            <el-button size="mini" type="danger" @click="handleDelete(teacherIndex, teacherData, true)">
              删除
            </el-button>
          </div>
        </el-col>
      </el-row>
      <el-table ref="userTable" stripe :data="classList" tooltip-effect="dark" style="width: 100%">
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
            <el-button size="mini" type="danger" @click="handleClassDelete(scope.$index, scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

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

    <!--导入失败弹窗-->
    <el-dialog title="导入结果" :visible.sync="dialogExcelErrorVisible" :before-close="handleCloseExcelErrorVisible">
      <div class="mb-20">
        {{ dialogExcelErrorMessage }}
      </div>
      <el-table
        :data="excelFailedList"
        height="250"
        style="width: 100%"
      >
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
  name: 'TchManagement',
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
        if (this.dialogStatus === 'update' && value === this.oriMobile) { // 当是编辑时，同时没有改变手机号
          callback()
          return
        }
        const params = {
          mobile: value,
          role: 0
        }
        this.$api.common.checkMobile(params).then((res) => {
          if (res.rcode === 300) {
            if (res.data.result) {
              callback(new Error('该电话号码的教师已存在'))
            } else {
              callback()
            }
          }
        }).catch((err) => {

        })
      } else {
        callback(new Error('含有非电话号码字符'))
      }
    }
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
        total: 0, // 总共条数
        offSet: 0, // 页面
        offSize: 10 // 一页的条数
      },
      provinceList: [],
      cityList: [],
      areaList: [],
      schoolList: [],
      tchList: [],
      dialogFormVisible: false, // 是否显示编辑弹层
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '创建'
      },
      delArr: [], // 需删除的项
      temp: {
        id: 0,
        userName: '',
        mobile: '',
        lastLoginTime: 0,
        pic: ''
      },
      rules: {
        userName: [
          { required: true, message: '姓名不能为空', trigger: 'blur' }
        ],
        mobile: [
          { required: true, trigger: 'blur', message: '手机号码不能为空' },
          { trigger: 'blur', validator: validateMobile }
        ]
      },
      oriMobile: '',
      dialogClassFormVisible: false,
      teacherIndex: '', // 当前点击的教师位置
      teacherData: {}, // 当前点击的教师资料
      classList: [],
      gradeList: [],
      dialogAddClassFormVisible: false,
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
        { value: 3, label: '英语' }
      ],
      roleTempList: [
        { value: 1, label: '班主任' },
        { value: 2, label: '任课老师' }
      ],
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
      this.getZoneList()
      this.getGrade()
      this.getTchList()
    })
  },
  activated () {},
  destroyed () {},
  methods: {
    showOrHideForm () {
      const showMore = this.showMore
      this.showMore = !showMore
    },
    handleFilter () {
      this.$nextTick(() => {
        this.onSearch()
      })
    },
    // 过滤最后登录时间
    loginTimeFormatter (row, column) {
      if (row.lastLoginTime === 0) {
        return '无登录记录'
      } else {
        return parseTime(row.lastLoginTime, '{y}-{m}-{d}')
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
    // 清空地区选项
    clearZoneList (listNum) {
      for (let i = 1, l = 7; i < l; i++) {
        if (i === 1 && i >= listNum) {
          this.user.provinceId = ''
        }
        if (i === 2 && i >= listNum) {
          this.userParams.cityId = ''
          this.cityList = []
        }
        if (i === 3 && i >= listNum) {
          this.userParams.townId = ''
          this.areaList = []
        }
        if (i === 4 && i >= listNum) {
          this.userParams.schoolId = ''
          this.schoolList = []
        }
        if (i === 5 && i >= listNum) {
          this.userParams.grade = ''
        }
        if (i === 6 && i >= listNum) {
          this.userParams.className = ''
          this.classNameList = []
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

      /* this.clearZoneList(3);
        this.getZoneList(3, this.userParams.cityId);
        let areaId;
        if (this.userParams.cityId !== 0) {
          areaId = this.userParams.cityId
        } else {
          areaId = this.userParams.provinceId
        }
        if (areaId !== 0) {
          this.getSchool(areaId);
        } */
      this.$nextTick(() => {
        this.onSearch()
      })
    },
    // 选择镇区后
    changeZone (value) {
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
    // 选择学校后
    changeSchool () {
      this.$nextTick(() => {
        this.onSearch()
      })
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
    handleSelectionChange (val) {
      this.delArr = val
    },
    // 获取教师列表
    getTchList () {
      if (this.opaList.indexOf('list') === -1) { // 权限
        return
      }
      this.fullScreenLoading = true
      this.$nextTick(() => {
        const userParams = Object.assign({}, this.userParams)
        userParams.offSet--
        this.$api.user.getTeacherList(userParams).then((res) => {
          if (res.rcode === 300) {
            this.tchList = res.data.userList
            this.userParams.total = res.data.totalPages
          }
          this.fullScreenLoading = false
        }).catch((err) => {

        })
      })
    },
    // 格式化教师模板
    clearTemp () {
      this.temp = {
        id: 0,
        userName: '',
        mobile: '',
        lastLoginTime: 0,
        pic: ''
      }
    },
    // 新增
    handleCreate () {
      this.clearTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    // 搜索
    onSearch () {
      this.userParams.offSet = 1
      this.getTchList()
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
        total: 0, // 总共条数
        offSet: 0, // 页面
        offSize: 10 // 一页的条数
      }
      this.onSearch()
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
      this.$confirm('删除用户将会删除所带班级，是否继续？', '提示', {
        type: 'warning'
      }).then(() => {
        const userIdArr = []
        this.delArr.forEach((value) => {
          userIdArr.push(value.id)
        })
        // let userIds = userIdArr.join(',');
        this.delTeacher(userIdArr).then((res) => {
          if (res.rcode === 300) {
            this.getTchList()
          } else {
            // 错误提示
            this.$message.error(res.message)
          }
        }).catch((err) => {

        })
      })
    },
    // 进行学生的删除
    async delTeacher (ids) {
      const params = {
        ids
      }
      return await this.$api.user.delTeacher(params)
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
    // 去查看班级
    handleCheckClass (index, row) {
      this.$router.push({
        path: '/userManagement/tchClassList/' + row.id + '/' + row.userName
      })
    },
    // 确定编辑完成
    updateData () {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          this.updateTeacher().then((res) => {
            if (res.rcode === 300) {
              for (const v of this.tchList) {
                if (tempData.id === v.id) {
                  const index = this.tchList.indexOf(v)
                  this.tchList.splice(index, 1, this.temp)
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
          })
        }
      })
    },
    // 确定创建完成
    createData () {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          this.updateTeacher().then((res) => {
            if (res.rcode === 300) {
              // this.stuList.unshift(this.temp);
              this.dialogFormVisible = false
              this.$notify({
                title: '成功',
                message: '创建成功',
                type: 'success',
                duration: 2000
              })
              // 刷新回到第一页
              this.onSearch()
            } else {
              // 失败提示
              this.$message.error(res.message)
            }
          }).catch((err) => {

          })
        }
      })
    },
    // 教师新增或修改
    async updateTeacher () {
      return await this.$api.user.updateTeacher(this.temp)
    },
    // 单个删除
    handleDelete (index, row, dialog = false) {
      this.$confirm('删除用户将会删除所带班级，是否继续？', '提示', {
        type: 'warning'
      }).then(() => {
        this.delTeacher([row.id]).then((res) => {
          if (res.rcode === 300) {
            this.tchList.splice(index, 1)
            if (dialog) {
              this.dialogClassFormVisible = false
            }
          } else {
            // 失败提示
            this.$message.error(res.message)
          }
        }).catch((err) => {

        })
      })
    },
    // 查看带班情况
    async handleCheck (index, row) {
      this.teacherIndex = index
      this.teacherData = row
      const params = {
        teacherId: row.id
      }
      const res = await this.$api.user.getTeacherClassList(params)
      if (res.rcode === 300) {
        this.classList = res.data.classList
        this.dialogClassFormVisible = true
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
    handleAdd (index, row) {
      this.teacherIndex = index
      this.teacherData = row
      // this.temp = Object.assign({}, row);
      this.clearClassTemp()
      this.classTemp.teacherId = row.id
      this.clearTempZoneList(2)
      this.dialogAddClassFormVisible = true
      this.$nextTick(() => {
        this.$refs['addClassForm'].clearValidate()
      })
    },
    // 过滤科目
    subjectFormatter (row, column) {
      let subject = ''
      if (row.subject === 0) {
        subject = '全科'
      } else if (row.subject === 1) {
        subject = '语文老师'
      } else if (row.subject === 2) {
        subject = '数学老师'
      } else {
        subject = '英语老师'
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
    handleClassEdit () {},
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

              this.getTchList()

              this.handleCheck(this.teacherIndex, this.teacherData)

              /* if (this.dialogClassFormVisible) {
                  for (let v of this.schoolTempList) {
                    if (v.value === classData.schoolId) {
                      classData.schoolName = v.label;
                      break
                    }
                  }
                  for (let v of this.classTempList) {
                    if (v.value === classData.classId) {
                      classData.className = v.label;
                      break
                    }
                  }
                  this.classList.unshift(classData)
                } */
            } else {
              // 失败提示
              this.$message.error(res.message)
            }
          }).catch((err) => {

          })
        }
      })
    },
    // 导入弹层关闭
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
      const res = await this.$api.user.importTeacherExcel(formData)
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
              let message = ``
              if (data.success && data.failedList.length === 0) {
                // 导入成功
                message = `一共导入${data.totalCount}名教师，成功绑定${data.successTCount}名，失败${data.failTCount}名，共耗时${excelTimeNum / 1000}秒。`
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
                this.dialogExcelErrorMessage = `一共导入${data.totalCount}名教师，成功绑定${data.successTCount}名，失败${data.failTCount}名，共耗时${excelTimeNum / 1000}秒。`
                this.dialogExcelErrorVisible = true
              }
            } else {
              // 出错
              console.log('导入出错')
            }
          }).catch((err) => {

          })
        }, 4000)
      }
    },
    // 下载模板
    downExcel () {
      window.open('http://qtone-qkt.callmesoul.cn/lite/admin/xxt/excel/teacher.xlsx')
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

    &.grid-content-title {
      text-align: right;
      font-weight: bold;
    }
  }
</style>

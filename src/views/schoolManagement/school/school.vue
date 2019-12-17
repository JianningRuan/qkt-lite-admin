<template>
  <div v-loading="fullScreenLoading" class="app-container">
    <el-card shadow="never" class="mb-20">
      <el-form ref="form" :inline="false" :model="schoolParams" label-width="80px" size="mini">
        <el-form-item label="学校名称">
          <el-input v-model="schoolParams.schoolName" placeholder="学校名称" class="filter-item input-box" @change="onSearch" @keyup.enter.native="handleFilter" />
        </el-form-item>
        <el-form-item label="地区">
          <el-select v-model="schoolParams.provinceId" placeholder="请选择省" class="input-box" @change="changeProvince">
            <el-option v-for="item in provinceList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <el-select v-model="schoolParams.cityId" placeholder="请选择市" class="input-box" @change="changeCity">
            <el-option v-for="item in cityList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <el-select v-model="schoolParams.townId" placeholder="请选择镇区" class="input-box" @change="changeTown">
            <el-option v-for="item in townList" :key="item.value" :label="item.label" :value="item.value" />
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
        <span class="flex1">学校列表</span>
        <div>
          <el-button type="primary" size="mini" :disabled="opaList.indexOf('add') === -1 ? true : false" @click="handleCreate">
            新增
          </el-button>
          <el-button type="danger" size="mini" :disabled="opaList.indexOf('delete') === -1 ? true : false" @click="batchDeletion">
            批量删除
          </el-button>
        </div>
      </div>

      <el-table ref="schoolTable" stripe :data="schoolList" tooltip-effect="dark" style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="schoolName" label="学校名字" />
        <el-table-column prop="provinceName" label="省" width="120" />
        <el-table-column prop="cityName" label="市" width="120" />
        <el-table-column prop="townName" label="镇区" width="120" />
        <el-table-column label="创建时间" width="220" prop="createTime" :formatter="createTimeFormatter">
          <!--<template slot-scope="scope">{{scope.row.lastLoginTime | parseTime('{y}-{m}-{d}')}}</template>-->
        </el-table-column>
        <el-table-column label="操作" width="320">
          <template slot-scope="scope">
            <el-button size="mini" :disabled="opaList.indexOf('query') === -1 ? true : false" @click="handleCheckClass(scope.$index, scope.row)">
              查看班级
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

      <pagination v-show="schoolParams.total > 0" :total="schoolParams.total" :page.sync="schoolParams.offSet" :limit.sync="schoolParams.offSize" @pagination="getSchoolList" />
    </el-card>

    <!--创建或修改弹窗-->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="890px">
      <el-form ref="dataForm" :model="temp" :rules="rules" label-position="left" label-width="80px" style="margin-left:50px;">
        <el-form-item label="学校名称" prop="schoolName">
          <el-input v-model="temp.schoolName" placeholder="学校名称" class="filter-item input-box" />
        </el-form-item>
        <el-form-item label="地区" required>
          <el-col :span="5">
            <el-form-item prop="provinceId">
              <el-select v-model="temp.provinceId" clearable placeholder="请选择省" class="input-box" @change="changeTempProvince">
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
              <el-select v-model="temp.cityId" clearable placeholder="请选择市" class="input-box" @change="changeTempCity">
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
              <el-select v-model="temp.townId" clearable placeholder="请选择镇区" class="input-box">
                <el-option
                  v-for="item in townTempList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
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
    <!--创建或修改弹窗-end-->
  </div>
</template>

<script>
import Pagination from '@/components/Pagination' // 分页
import { parseTime, common } from '../../../utils'
import { opaMixin } from '../../../utils/mixins'

export default {
  name: 'School',
  components: {
    Pagination
  },
  filters: {},
  mixins: [opaMixin],
  data () {
    return {
      fullScreenLoading: false,
      schoolParams: {
        schoolName: '',
        provinceId: '',
        cityId: '',
        townId: '',
        total: 0, // 总共条数
        offSet: 0, // 页面
        offSize: 10 // 一页的条数
      },
      provinceList: [],
      cityList: [],
      townList: [],
      schoolList: [],
      temp: {
        id: 0,
        schoolName: '',
        provinceId: '',
        cityId: '',
        townId: '',
        createTime: 0
      }, // 用户资料模板
      rules: {
        schoolName: [
          { required: true, message: '学校名字不能为空', trigger: 'blur' }
        ],
        provinceId: [
          { required: true, trigger: 'change', message: '省份不能为空' }
        ]
      },
      provinceTempList: [],
      cityTempList: [],
      townTempList: [],
      dialogFormVisible: false, // 是否显示编辑弹层
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '创建'
      },
      delArr: [] // 需删除的项
    }
  },
  computed: {},
  watch: {},
  created () {},
  async mounted () {
    await this.getOpaList()
    this.$nextTick(() => {
      this.getZoneList()
      this.getSchoolList()
    })
  },
  activated () {
  },
  destroyed () {
  },
  methods: {
    // 获取省市地方
    async getZoneList (areaType = 1, parentId = 0, table = 0) { // table = 0 表示 是上方搜索框用 table = 1 表示弹出框用
      const params = {
        areaType,
        parentId,
        type: 1
      }
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
      this.clearZoneList(2)
      this.getZoneList(2, this.schoolParams.provinceId)
      this.$nextTick(() => {
        this.onSearch()
      })
    },
    // 选择城市后
    changeCity (value) {
      this.clearZoneList(3)
      this.getZoneList(3, this.schoolParams.cityId)
      this.$nextTick(() => {
        this.onSearch()
      })
    },
    // 选择镇区
    changeTown () {
      this.$nextTick(() => {
        this.onSearch()
      })
    },
    // 清空地区选项
    clearZoneList (listNum) {
      for (let i = 1, l = 4; i < l; i++) {
        if (i === 1 && i >= listNum) {
          this.user.provinceId = ''
        }
        if (i === 2 && i >= listNum) {
          this.schoolParams.cityId = ''
          this.cityList = []
        }
        if (i === 3 && i >= listNum) {
          this.schoolParams.townId = ''
          this.townList = []
        }
      }
    },
    // 获取学校
    getSchoolList () {
      if (this.opaList.indexOf('list') === -1) { // 权限
        return
      }
      this.fullScreenLoading = true
      this.$nextTick(() => {
        const schoolParams = Object.assign({}, this.schoolParams)
        schoolParams.offSet--
        if (schoolParams.townId !== '' && schoolParams.townId !== 0) {
          schoolParams.areaId = schoolParams.townId
        } else if (schoolParams.cityId !== '' && schoolParams.cityId !== 0) {
          schoolParams.areaId = schoolParams.cityId
        } else {
          schoolParams.areaId = schoolParams.provinceId
        }
        this.$api.school.getSchoolList(schoolParams).then((res) => {
          if (res.rcode === 300) {
            this.schoolList = res.data.schoolList
            this.schoolParams.total = res.data.totalPages
            this.fullScreenLoading = false
          }
        }).catch((err) => {

        })
      })
    },
    // enter后
    handleFilter () {
      this.onSearch()
    },
    // 搜索
    onSearch () {
      this.schoolParams.offSet = 1
      this.getSchoolList()
    },
    // 重置
    onReset () {
      this.schoolParams = {
        schoolName: '',
        provinceId: '',
        cityId: '',
        townId: '',
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
        schoolName: '',
        provinceId: '',
        cityId: '',
        townId: '',
        createTime: 0
      }
    },
    // 新增
    handleCreate () {
      this.resetTemp()
      const schoolParams = Object.assign({}, this.schoolParams)
      if (schoolParams.provinceId !== '' && schoolParams.provinceId !== 0) {
        this.temp.provinceId = schoolParams.provinceId
        this.getZoneList(2, schoolParams.provinceId, 1)
      }
      if (schoolParams.cityId !== '' && schoolParams.cityId !== 0) {
        this.temp.cityId = schoolParams.cityId
        this.getZoneList(3, schoolParams.cityId, 1)
      }
      if (schoolParams.townId !== '' && schoolParams.townId !== 0) {
        this.temp.townId = schoolParams.townId
        this.getZoneList(4, schoolParams.townId, 1)
      }
      this.temp.parentMobile = ['']
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    // 去查看班级
    handleCheckClass (index, row) {
      this.$router.push({
        path: '/schoolManagement/classList/' + row.id + '/' + row.schoolName
      })
    },
    // 编辑学校
    async handleEdit (index, row) {
      const params = {
        schoolId: row.id
      }
      const res = await this.$api.school.getSchoolDetail(params)
      if (res.rcode === 300) {
        this.temp = Object.assign({}, res.data, row) // copy obj
        if (this.temp.provinceId !== '') {
          this.getZoneList(2, this.temp.provinceId, 1)
        }
        if (this.temp.cityId !== '' && this.temp.cityId !== 0) {
          this.getZoneList(3, this.temp.cityId, 1)
        } else {
          this.temp.cityId = ''
        }
        if (this.temp.townId === 0) {
          this.temp.townId = ''
        }
        this.dialogStatus = 'update'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      }
    },
    // 查看班级
    /* handleCheck(index, row) {

          }, */
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
      this.$confirm('删除学校将会删除其绑定的班级，是否继续？', '提示', {
        type: 'warning'
      }).then(() => {
        const schoolIdArr = []
        this.delArr.forEach((value) => {
          schoolIdArr.push(value.id)
        })
        // let userIds = userIdArr.join(',');
        this.delSchool(schoolIdArr).then((res) => {
          if (res.rcode === 300) {
            this.getSchoolList()
          } else {
            // 错误提示
            this.$message.error(res.message)
          }
        })
      })
    },
    // 单个删除
    handleDelete (index, row) {
      this.$confirm('删除学校将会删除其绑定的班级，是否继续？', '提示', {
        type: 'warning'
      }).then(() => {
        this.delSchool([row.id]).then((res) => {
          if (res.rcode === 300) {
            this.schoolList.splice(index, 1)
          } else {
            // 提示错误
            this.$message.error(res.message)
          }
        }).catch((err) => {

        })
      })
    },
    // 进行学校的删除
    async delSchool (ids) {
      const params = {
        ids
      }
      return await this.$api.school.delSchool(params)
    },
    // 过滤创建时间
    createTimeFormatter (row, column) {
      if (row.createTime === 0) {
        return '无创建记录'
      } else {
        return parseTime(row.createTime, '{y}-{m}-{d}')
      }
    },
    //
    handleSelectionChange (val) {
      this.delArr = val
    },
    // 选择省后
    changeTempProvince (value) {
      this.clearTempZoneList(2)
      this.getZoneList(2, this.temp.provinceId, 1)
    },
    // 选择城市后
    changeTempCity (value) {
      this.clearTempZoneList(3)
      this.getZoneList(3, this.temp.cityId, 1)
    },
    // 清空地区选项
    clearTempZoneList (listNum) {
      for (let i = 1, l = 4; i < l; i++) {
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
      }
    },
    // 确认新增
    createData () {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          let areaId
          if (this.temp.townId !== '') {
            areaId = this.temp.townId
          } else if (this.temp.cityId !== '') {
            areaId = this.temp.cityId
          } else {
            areaId = this.temp.provinceId
          }
          const params = {
            areaId,
            id: this.temp.id,
            schoolName: this.temp.schoolName
          }
          // 提交
          this.$api.school.updateSchool(params).then((res) => {
            if (res.rcode === 300) {
              // 提交之后
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
    // 确认修改
    updateData () {
      this.$refs['dataForm'].validate((valid) => { // 检查rule
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          let areaId
          if (this.temp.townId !== '') {
            areaId = this.temp.townId
          } else if (this.temp.cityId !== '') {
            areaId = this.temp.cityId
          } else {
            areaId = this.temp.provinceId
          }
          const params = {
            areaId,
            id: this.temp.id,
            schoolName: this.temp.schoolName
          }
          // 提交
          this.$api.school.updateSchool(params).then((res) => {
            if (res.rcode === 300) {
              // 提交之后
              for (const w of this.provinceTempList) {
                if (w.value === this.temp.provinceId) {
                  this.temp.provinceName = w.name
                  break
                }
              }
              if (this.temp.cityId === '') {
                this.temp.cityName = ''
              } else {
                for (const w of this.cityTempList) {
                  if (w.value === this.temp.cityId) {
                    this.temp.cityName = w.name
                    break
                  }
                }
              }
              if (this.temp.townId === '') {
                this.temp.townName = ''
              } else {
                for (const w of this.townTempList) {
                  if (w.value === this.temp.townId) {
                    this.temp.townName = w.name
                    break
                  }
                }
              }
              for (const v of this.schoolList) {
                if (v.id === tempData.id) {
                  const index = this.schoolList.indexOf(v)
                  this.schoolList.splice(index, 1, this.temp)
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
    }
  }
}
</script>

<style lang="scss" scoped>
  .input-box {
    width: 140px;
  }
</style>

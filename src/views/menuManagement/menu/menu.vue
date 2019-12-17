<template>
  <div v-loading="fullScreenLoading" class="app-container">
    <el-card shadow="never" class="mb-20">
      <el-form ref="form" :inline="true" :model="menuParams" label-width="80px" size="mini">
        <el-form-item label="菜单姓名">
          <el-input v-model="menuParams.title" placeholder="菜单姓名" class="filter-item input-box" @change="onSearch" @keyup.enter.native="handleFilter" />
        </el-form-item>
        <el-form-item label="审核状态">
          <el-select v-model="menuParams.check" placeholder="请选择菜单审核状态" class="class-input-box" @change="changeShow">
            <el-option v-for="item in showList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="图标">
          <el-select v-model="menuParams.icon" placeholder="请选择图标类型" class="class-input-box" @change="changeIcon">
            <el-option v-for="item in iconList" :key="item.value" :label="item.label" :value="item.value">
              <svg-icon :icon-class="item.value" class-name="disabled" style="color: #8492a6; font-size: 13px" />
              <span style="float: right; font-size: 13px">{{ item.label }}</span>
            </el-option>
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
        <span class="flex1">班级列表</span>
        <div>
          <el-button type="primary" size="mini" :disabled="opaList.indexOf('add') === -1 ? true : false" @click="handleCreate">
            新增
          </el-button>
          <el-button type="danger" size="mini" :disabled="opaList.indexOf('delete') === -1 ? true : false" @click="batchDeletion">
            批量删除
          </el-button>
        </div>
      </div>

      <el-table ref="menuTable" stripe :data="menuList" tooltip-effect="dark" style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column fixed type="selection" width="55" />
        <el-table-column prop="title" label="菜单名称" />
        <el-table-column prop="icon" label="菜单图标" align="center">
          <template slot-scope="scope">
            <svg-icon v-if="scope.row.icon !== null" :icon-class="scope.row.icon" />
            <span>{{ scope.row.icon }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="菜单级别":formatter="typeFormatter" align="center" width="90" />
        <el-table-column prop="parentTitle" label="父级菜单名称" />
        <el-table-column prop="orderNum" label="菜单排序" align="center" width="80" />
        <el-table-column prop="path" label="路由路径" />
        <el-table-column prop="url" label="路径" />
        <!--<el-table-column prop="createTime" label="最后更新时间" :formatter="loginTimeFormatter" width="110"></el-table-column>-->
        <el-table-column prop="check" label="审核状态" align="center" width="90">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.check" type="success" size="mini">
              通过
            </el-tag>
            <el-tag v-else type="info" size="mini">
              不通过
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="280" align="center">
          <template slot-scope="scope">
            <el-button size="mini" :disabled="opaList.indexOf('query') === -1 ? true : false" @click="handleCheckOpa(scope.$index, scope.row)">
              关联操作
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

      <pagination v-show="menuParams.total > 0" :total="menuParams.total" :page.sync="menuParams.offSet" :limit.sync="menuParams.offSize" @pagination="getMenuList" />
    </el-card>

    <!--新建或编辑菜单弹窗-->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="800px" @close="cancelData">
      <el-form ref="dataForm" :model="temp" :rules="rules" label-position="left" label-width="100px" style="margin-left:50px; margin-right: 50px;">
        <el-form-item label="菜单排序">
          <el-input v-model="temp.orderNum" placeholder="菜单排序" type="number" class="filter-item input-box" />
        </el-form-item>
        <el-form-item label="父菜单">
          <el-cascader v-model="selectedOptions" placeholder="请选择父菜单" :show-all-levels="false" :options="canSelectMenuList" :props="{ checkStrictly: true }" style="width: 100%;" @change="handleChange" />
        </el-form-item>
        <el-form-item label="菜单" prop="title">
          <el-input v-model="temp.title" placeholder="菜单" class="filter-item input-box" />
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-select v-model="temp.icon" placeholder="请选择图标类型" style="width: 100%;">
            <el-option v-for="item in selectIconList" :key="item.value" :label="item.label" :value="item.value">
              <svg-icon :icon-class="item.value" />
              <span style="float: right;">{{ item.label }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="路由路径" prop="path">
          <el-input v-model="temp.path" placeholder="路由路径path" class="filter-item input-box" />
        </el-form-item>
        <el-form-item label="菜单路径" prop="url">
          <el-input v-model="temp.url" placeholder="菜单路径" class="filter-item input-box" />
          <p class="tips">
            1. 路由路径不填入'@/views'部分。如：路由路径为'@/views/userManagement/student/student'，则填入'/userManagement/student/student'
          </p>
          <p class="tips">
            2. 一级路由一律填入'/layout/Layout'
          </p>
        </el-form-item>
        <el-form-item label="是否隐藏菜单">
          <el-switch v-model="temp.hidden" />
        </el-form-item>
        <el-form-item label="是否刷新">
          <el-switch v-model="temp.noCache" />
          <p class="tips">
            默认为不刷新。即对页面进行缓存，在切换不同页面的时候不进行更新数据。
          </p>
        </el-form-item>
        <el-form-item label="是否审核通过">
          <el-switch v-model="temp.check" />
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
import router from './../../../router'
import store from './../../../store'
import Pagination from '@/components/Pagination' // 分页
import { parseTime, common } from '../../../utils'
import { opaMixin } from '../../../utils/mixins'

export default {
  name: 'MenuList',
  components: { Pagination },
  filters: {},
  mixins: [opaMixin],
  data () {
    return {
      fullScreenLoading: false,
      menuParams: {
        title: '',
        check: '',
        icon: '',
        total: 0, // 总共条数
        offSet: 0, // 页面
        offSize: 10 // 一页的条数
      },
      menuList: [],
      showList: [{ value: '', label: '所有' }, { value: true, label: '通过' }, { value: false, label: '不通过' }],
      iconList: [{ value: '', label: '所有' }, { value: '404', label: '404' }, { value: 'address', label: 'address' }, { value: 'bug', label: 'bug' }, { value: 'chart', label: 'chart' }, { value: 'clipboard', label: 'clipboard' }, { value: 'component', label: 'component' }, { value: 'dashboard', label: 'dashboard' }, { value: 'documentation', label: 'documentation' }, { value: 'drag', label: 'drag' }, { value: 'edit', label: 'edit' }, { value: 'email', label: 'email' }, { value: 'example', label: 'example' }, { value: 'excel', label: 'excel' }, { value: 'eye', label: 'eye' }, { value: 'form', label: 'form' }, { value: 'guide', label: 'guide' }, { value: 'icon', label: 'icon' }, { value: 'international', label: 'international' }, { value: 'language', label: 'language' }, { value: 'link', label: 'link' }, { value: 'list', label: 'list' }, { value: 'lock', label: 'lock' }, { value: 'message', label: 'message' }, { value: 'money', label: 'money' }, { value: 'nested', label: 'nested' }, { value: 'password', label: 'password' }, { value: 'pdf', label: 'pdf' }, { value: 'people', label: 'people' }, { value: 'peoples', label: 'peoples' }, { value: 'plus', label: 'plus' }, { value: 'qq', label: 'qq' }, { value: 'school', label: 'school' }, { value: 'shopping', label: 'shopping' }, { value: 'size', label: 'size' }, { value: 'star', label: 'star' }, { value: 'tab', label: 'tab' }, { value: 'table', label: 'table' }, { value: 'theme', label: 'theme' }, { value: 'tree', label: 'tree' }, { value: 'user', label: 'user' }, { value: 'wechat', label: 'wechat' }, { value: 'zip', label: 'zip' }],
      selectIconList: [{ value: '404', label: '404' }, { value: 'address', label: 'address' }, { value: 'bug', label: 'bug' }, { value: 'chart', label: 'chart' }, { value: 'clipboard', label: 'clipboard' }, { value: 'component', label: 'component' }, { value: 'dashboard', label: 'dashboard' }, { value: 'documentation', label: 'documentation' }, { value: 'drag', label: 'drag' }, { value: 'edit', label: 'edit' }, { value: 'email', label: 'email' }, { value: 'example', label: 'example' }, { value: 'excel', label: 'excel' }, { value: 'eye', label: 'eye' }, { value: 'form', label: 'form' }, { value: 'guide', label: 'guide' }, { value: 'icon', label: 'icon' }, { value: 'international', label: 'international' }, { value: 'language', label: 'language' }, { value: 'link', label: 'link' }, { value: 'list', label: 'list' }, { value: 'lock', label: 'lock' }, { value: 'message', label: 'message' }, { value: 'money', label: 'money' }, { value: 'nested', label: 'nested' }, { value: 'password', label: 'password' }, { value: 'pdf', label: 'pdf' }, { value: 'people', label: 'people' }, { value: 'peoples', label: 'peoples' }, { value: 'plus', label: 'plus' }, { value: 'qq', label: 'qq' }, { value: 'school', label: 'school' }, { value: 'shopping', label: 'shopping' }, { value: 'size', label: 'size' }, { value: 'star', label: 'star' }, { value: 'tab', label: 'tab' }, { value: 'table', label: 'table' }, { value: 'theme', label: 'theme' }, { value: 'tree', label: 'tree' }, { value: 'user', label: 'user' }, { value: 'wechat', label: 'wechat' }, { value: 'zip', label: 'zip' }],
      temp: {
        id: 0,
        title: '',
        hidden: false, // 路由是否在菜单上隐藏
        check: true, // 是否后台审核通过
        noCache: false, // 切换时是否缓存页面。 true为不缓存
        orderNum: 0,
        icon: '',
        parentId: '',
        path: '',
        url: ''
      },
      dialogFormVisible: false, // 是否显示编辑弹层
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '创建'
      },
      rules: {
        title: [{ required: true, message: '菜单名称不能为空', trigger: 'blur' }],
        icon: [{ required: true, message: '图标不能为空', trigger: 'change' }],
        path: [{ required: true, message: '路由路径不能为空', trigger: 'blur' }],
        url: [{ required: true, message: '菜单地址不能为空', trigger: 'blur' }]
      },
      canSelectMenuList: [],
      selectParentMenuList: [],
      selectedOptions: [],
      delArr: []
    }
  },
  computed: {},
  watch: {},
  created () {},
  async mounted () {
    await this.getOpaList()
    this.$nextTick(() => {
      this.getMenuList()
    })
  },
  activated () {
  },
  destroyed () {
  },
  methods: {
    // 获取菜单列表
    getMenuList () {
      if (this.opaList.indexOf('list') === -1) {
        // return
      }
      this.fullScreenLoading = true
      this.$nextTick(() => {
        const menuParams = Object.assign({}, this.menuParams)
        menuParams.offSet--
        this.$api.menu.getMenuList(menuParams).then((res) => {
          if (res.rcode === 300) {
            this.menuParams.total = res.data.totalPages
            this.menuList = res.data.menuList
          }
          this.fullScreenLoading = false
        }).catch(() => {

        })
      })
    },
    // 输入触发搜索
    handleFilter () {
      this.onSearch()
    },
    // 选择菜单是否显示触发搜索
    changeShow () {
      this.onSearch()
    },
    // 选择图标触发搜索
    changeIcon () {
      this.onSearch()
    },
    // 搜索
    onSearch () {
      this.menuParams.offSet = 1
      this.getMenuList()
    },
    // 重置
    onReset () {
      this.menuParams = {
        title: '',
        check: '',
        icon: '',
        total: 0, // 总共条数
        offSet: 0, // 页面
        offSize: 10 // 一页的条数
      }
      this.onSearch()
    },
    // 重置编辑内容
    resetTemp () {
      this.temp = {
        id: 0,
        title: '',
        hidden: false, // 路由是否在菜单上隐藏
        check: true, // 是否后台审核通过
        noCache: false, // 切换时是否缓存页面。 true为不缓存
        orderNum: 0,
        icon: '',
        parentId: '',
        path: '',
        url: ''
      }
    },
    // 获取菜单树列表
    async getSelectMenuList (menuId = '') {
      const params = {
        menuId
      }
      return await this.$api.menu.getAllMenuTree(params)
    },
    // 创建
    handleCreate () {
      this.resetTemp()
      this.getSelectMenuList().then((res) => {
        if (res.rcode === 300) {
          const menuTreeList = res.data.menuList
          /* menuTreeList = [
                  {id: '1', name: '1', areaType: '大名', time: '2019-02-02',},
                  {id: '2', name: '1-1', areaType: '大名', time: '2019-02-02', parentId: '1'},
                  {id: '3', name: '1-1-1', areaType: '大名', time: '2019-02-02', parentId: '2'},
                  {id: '4', name: '1-2', areaType: '大名', time: '2019-02-02', parentId: '1'},
                  {id: '5', name: '1-2-2', areaType: '大名', time: '2019-02-02', parentId: '4'},
                  {id: '6', name: '1-1-1-1', areaType: '大名', time: '2019-02-02', parentId: '3'},
                  {id: '7', name: '2', areaType: '大名', time: '2019-02-02'}
                ]; */
          menuTreeList.forEach((item) => {
            item.value = item.id
            item.label = item.title
          })
          console.log('a', menuTreeList)
          this.selectParentMenuList = menuTreeList
          this.canSelectMenuList = common.translateDataToTree(menuTreeList)
        }
      })
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
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
      this.$confirm('删除所选角色，是否继续？', '提示', {
        type: 'warning'
      }).then(() => {
        const menuIds = []
        this.delArr.forEach((value) => {
          menuIds.push(value.id)
        })
        this.delMenu(menuIds).then((res) => {
          if (res.rcode === 300) {
            this.getMenuList()
          } else {
            // 错误提示
            this.$message.error(res.message)
          }
        }).catch(() => {})
      })
    },
    // 删除菜单
    async delMenu (ids) {
      const params = {
        ids
      }
      return await this.$api.menu.delMenu(params)
    },
    // 勾选
    handleSelectionChange (val) {
      this.delArr = val
    },
    // 过滤级别
    typeFormatter (row, column) {
      const fontArr = ['一', '二', '三']
      const type = row.type
      return fontArr[type - 1] + '级'
    },
    // 过滤最后更新时间
    loginTimeFormatter (row, column) {
      if (row.createTime === 0) {
        return '无更新记录'
      } else {
        return parseTime(row.createTime, '{y}-{m}-{d}')
      }
    },
    // 去查看菜单关联操作
    handleCheckOpa (index, row) {
      this.$router.push({
        path: '/menuManagement/menuPermission/' + row.id + '/' + row.title
      })
    },
    // 编辑菜单
    async handleEdit (index, row) {
      const params = {
        menuId: row.id
      }
      // let menuDetail = await this.$api.menu.getMenuDetail(params);
      // this.temp = Object.assign({}, this.temp, row); // copy obj
      let parentId = ''

      let res = await this.$api.menu.getMenuDetail(params)
      if (res.rcode === 300) {
        this.temp = Object.assign({}, this.temp, row, res.data) // copy obj
        parentId = res.data.parentId
        this.temp.parentId = res.data.parentId
        /* if (parentId !== '') {
          this.selectedOptions = [res.data.parentId]
        } */
      }

      this.getSelectMenuList(row.id).then((listRes) => {
        if (listRes.rcode === 300) {
          const menuTreeList = listRes.data.menuList
          /* menuTreeList = [
                  {id: '1', name: '1', areaType: '大名', time: '2019-02-02',},
                  {id: '2', name: '1-1', areaType: '大名', time: '2019-02-02', parentId: '1'},
                  {id: '3', name: '1-1-1', areaType: '大名', time: '2019-02-02', parentId: '2'},
                  {id: '4', name: '1-2', areaType: '大名', time: '2019-02-02', parentId: '1'},
                  {id: '5', name: '1-2-2', areaType: '大名', time: '2019-02-02', parentId: '4'},
                  {id: '6', name: '1-1-1-1', areaType: '大名', time: '2019-02-02', parentId: '3'},
                  {id: '7', name: '2', areaType: '大名', time: '2019-02-02'}
                ]; */
          menuTreeList.forEach((item) => {
            item.value = item.id
            item.label = item.title
          })
          this.selectParentMenuList = menuTreeList
          this.canSelectMenuList = common.translateDataToTree(menuTreeList)

          if (this.temp.parentId !== '') {
            this.getParentArr(parentId)
          }
        }
      })
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    // 赋值父菜单ID
    getParentArr (parent) {
      for (let i = 0, l = this.selectParentMenuList.length; i < l; i++) {
        const value = this.selectParentMenuList[i]
        if (value.id === parent) {
          this.selectedOptions.unshift(value.id)
          if (value.parentId !== 0) {
            const detailParams = {
              menuId: value.id
            }
            this.$api.menu.getMenuDetail(detailParams).then((res) => {
              if (res.rcode === 300) {
                this.getParentArr(res.data.parentId)
              }
            })
          }
          break
        }
      }
    },
    // 单个删除
    handleDelete (index, row) {
      this.$confirm('删除该菜单，是否继续？', '提示', {
        type: 'warning'
      }).then(() => {
        this.delMenu([row.id]).then((res) => {
          if (res.rcode === 300) {
            this.getMenuList()
            // this.menuList.splice(index, 1);
          } else {
            // 错误提示
            this.$message.error(res.message)
          }
        }).catch(() => {

        })
      })
    },
    // 关闭弹窗
    cancelData () {
      this.selectedOptions = []
      this.dialogFormVisible = false
    },
    // 选择父菜单
    handleChange (value) {
      const parentId = value[value.length - 1]
      this.temp.parentId = parentId
    },
    // 确认创建
    createData () {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          if (this.temp.parentId === '') {
            this.temp.parentId = 0
          }
          this.$api.menu.updateMenu(this.temp).then((res) => {
            if (res.rcode === 300) {
              this.dialogFormVisible = false
              this.selectedOptions = []
              this.$notify({
                title: '成功',
                message: '创建成功',
                type: 'success',
                duration: 2000
              })
              this.onSearch()
              // 更新菜单路由
              this.getRouter()
            } else {

            }
          }).catch(() => {

          })
        }
      })
    },
    // 确认修改
    updateData () {
      this.$refs['dataForm'].validate((valid) => { // 检查rule
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          if (this.temp.parentId === '') {
            this.temp.parentId = 0
          }
          this.$api.menu.updateMenu(this.temp).then((res) => {
            if (res.rcode === 300) {
              for (const v of this.menuList) {
                if (v.id === tempData.id) {
                  const index = this.menuList.indexOf(v)
                  this.menuList.splice(index, 1, this.temp)
                  break
                }
              }
              this.dialogFormVisible = false
              this.selectedOptions = []
              this.getMenuList()
              this.$notify({
                title: '成功',
                message: '更新成功',
                type: 'success',
                duration: 2000
              })
              this.getRouter()
            } else {

            }
          }).catch(() => {

          })
        }
      })
    },
    // 获取新菜单路由
    getRouter () {
      store.dispatch('GenerateRoutes').then(() => { // 根据roles权限生成可访问的路由表
        router.addRoutes(store.getters.addRouters) // 动态添加可访问路由表
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

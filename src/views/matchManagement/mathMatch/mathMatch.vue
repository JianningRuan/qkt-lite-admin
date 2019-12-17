<template>
  <div v-loading="fullScreenLoading" class="app-container">
    <el-card shadow="never" class="mb-20">
      <el-form ref="form" :inline="true" :model="matchParams" label-width="80px" size="mini">
        <el-form-item label="标题">
          <el-input v-model="matchParams.title" placeholder="标题" @change="onSearch" @keyup.enter.native="handleFilter" />
        </el-form-item>
        <el-form-item label="发布状态">
          <el-select v-model="matchParams.deploy" placeholder="请选择大赛发布状态" @change="changeState">
            <el-option v-for="item in stateList" :key="item.value" :label="item.label" :value="item.value" />
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
        <span class="flex1">大赛列表</span>
        <div>
          <el-button type="primary" size="mini" :disabled="opaList.indexOf('add') === -1 ? true : false" @click="handleCreate">
            新增
          </el-button>
          <el-button type="primary" size="mini" :disabled="opaList.indexOf('verify') === -1 ? true : false" @click="batchOpen">
            批量发布
          </el-button>
          <el-button type="primary" size="mini" :disabled="opaList.indexOf('verify') === -1 ? true : false" @click="batchClose">
            批量停用
          </el-button>
          <el-button type="danger" size="mini" :disabled="opaList.indexOf('delete') === -1 ? true : false" @click="batchDeletion">
            批量删除
          </el-button>
        </div>
      </div>

      <el-table stripe :data="matchList" tooltip-effect="dark" style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column fixed type="selection" width="55" />
        <el-table-column prop="title" label="大赛标题" />
        <!--<el-table-column prop="createTime" label="创建时间" :formatter="createTimeFormatter"></el-table-column>-->
        <el-table-column prop="beginTime" label="开始时间" :formatter="beginTimeFormatter" />
        <el-table-column prop="endTime" label="结束时间" :formatter="endTimeFormatter" />
        <el-table-column prop="deploy" label="发布状态" width="100" align="center">
          <template slot-scope="scope">
            <el-tooltip content="点击改变大赛发布状态" placement="right" effect="light" transition="el-zoom-in-bottom">
              <el-button v-if="scope.row.deploy" type="success" size="mini" plain :disabled="opaList.indexOf('verify') === -1 ? true : false" @click="handleOpen(scope.$index, scope.row)">
                启用
              </el-button>
              <el-button v-else type="info" size="mini" plain :disabled="opaList.indexOf('verify') === -1 ? true : false" @click="handleOpen(scope.$index, scope.row)">
                停用
              </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="280" align="center">
          <template slot-scope="scope">
            <el-button size="mini" :disabled="opaList.indexOf('query') === -1 ? true : false" @click="handleEdit(scope.$index, scope.row)">
              查看详情
            </el-button>
            <el-button size="mini" icon="document" @click="handleCopy(scope.row, $event)">
              复制地址
            </el-button>
            <el-button size="mini" type="danger" :disabled="opaList.indexOf('delete') === -1 ? true : false" @click="handleDelete(scope.$index, scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="matchParams.total > 0" :total="matchParams.total" :page.sync="matchParams.offSet" :limit.sync="matchParams.offSize" @pagination="getMatchList" />
    </el-card>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination' // 分页
import { parseTime } from '../../../utils'
import { opaMixin } from '../../../utils/mixins'
import clip from '@/utils/clipboard' // use clipboard directly

export default {
  name: 'MathMatch',
  components: { Pagination },
  filters: {},
  mixins: [opaMixin],
  data () {
    return {
      fullScreenLoading: false,
      matchParams: {
        title: '',
        deploy: '', // true或者false
        total: 0, // 总共条数
        offSet: 0, // 页面
        offSize: 10 // 一页的条数
      },
      stateList: [{ value: '', label: '所有' }, { value: true, label: '启用' }, { value: false, label: '停用' }], // 状态列表
      matchList: [],
      selectArr: [] // 勾选的列表
    }
  },
  computed: {},
  watch: {},
  created () {
  },
  async mounted () {
    await this.getOpaList()
    this.$nextTick(() => {
      this.getMatchList()
    })
  },
  activated () {
    this.getMatchList()
  },
  destroyed () {
  },
  methods: {
    handleCopy (text, event) {
      const address = `https://forend.uedu100.com/mathcontest/login?userType=1&matchId=${text.id}&mustFull=1`
      clip(address, event)
    },
    // 获取大赛
    getMatchList () {
      if (this.opaList.indexOf('list') === -1) {
        return
      }
      this.fullScreenLoading = true
      this.$nextTick(() => {
        const matchParams = Object.assign({}, this.matchParams)
        matchParams.offSet--
        this.$api.match.getMatchList(matchParams).then((res) => {
          if (res.rcode === 300) {
            this.matchParams.total = res.data.totalPages
            this.matchList = res.data.matchList
          }
          this.fullScreenLoading = false
        }).catch(() => {

        })
      })
    },
    // 搜索时按enter键后
    handleFilter () {
      this.onSearch()
    },
    // 改变状态
    changeState () {
      this.onSearch()
    },
    // 搜索
    onSearch () {
      this.matchParams.offSet = 1
      this.getMatchList()
    },
    // 重置
    onReset () {
      this.matchParams = {
        title: '',
        deploy: '', // true或者false
        total: 0, // 总共条数
        offSet: 0, // 页面
        offSize: 10 // 一页的条数
      }
      this.onSearch()
    },
    // 进入新建
    handleCreate () {
      this.$router.push({
        path: '/matchManagement/mathMatchCreate'
      })
    },
    // 批量发布
    batchOpen () {
      if (this.selectArr.length === 0) {
        // 请先选择要删除的项
        this.$message({
          message: '请先选择要发布的大赛',
          type: 'warning'
        })
        return
      }
      this.$confirm('即将发布选中的大赛，是否继续？', '提示', {
        type: 'warning'
      }).then(() => {
        const ids = []
        this.selectArr.forEach((value) => {
          ids.push(value.id)
        })
        const params = {
          ids,
          state: true
        }
        this.resDeploy(params).then((res) => {
          if (res.rcode === 300) {
            this.getMatchList()
            this.selectArr = []
          }
        })
      })
    },
    // 批量取消发布
    batchClose () {
      if (this.selectArr.length === 0) {
        // 请先选择要删除的项
        this.$message({
          message: '请先选择要停用的大赛',
          type: 'warning'
        })
        return
      }
      this.$confirm('即将停用选中的大赛，是否继续？', '提示', {
        type: 'warning'
      }).then(() => {
        const ids = []
        this.selectArr.forEach((value) => {
          ids.push(value.id)
        })
        const params = {
          ids,
          state: false
        }
        this.resDeploy(params).then((res) => {
          if (res.rcode === 300) {
            this.getMatchList()
            this.selectArr = []
          }
        })
      })
    },
    // 批量删除
    batchDeletion () {
      if (this.selectArr.length === 0) {
        // 请先选择要删除的项
        this.$message({
          message: '请先选择要删除的大赛',
          type: 'warning'
        })
        return
      }
      this.$confirm('即将删除选中的大赛，是否继续？', '提示', {
        type: 'warning'
      }).then(() => {
        const ids = []
        this.selectArr.forEach((value) => {
          ids.push(value.id)
        })
        const params = {
          ids
        }
        this.delMatch(params).then((res) => {
          if (res.rcode === 300) {
            this.getMatchList()
            this.selectArr = []
          } else {
            // 错误提示
            this.$message.error(res.message)
          }
        })
      })
    },
    // 进行大赛的删除
    async delMatch (ids) {
      const params = {
        ids
      }
      return await this.$api.match.delMatch(params)
    },
    // 勾选
    handleSelectionChange (val) {
      this.selectArr = val
    },
    // 过滤最后更新时间
    createTimeFormatter (row, column) {
      if (row.createTime === 0) {
        return '无创建记录'
      } else {
        return parseTime(row.createTime, '{y}-{m}-{d}')
      }
    },
    beginTimeFormatter (row, column) {
      if (row.beginTime === 0) {
        return '无开始时间'
      } else {
        return parseTime(row.beginTime, '{y}-{m}-{d}')
      }
    },
    endTimeFormatter (row, column) {
      if (row.endTime === 0) {
        return '无结束时间'
      } else {
        return parseTime(row.endTime, '{y}-{m}-{d}')
      }
    },
    // 发布
    handleOpen (index, val) {
      this.$confirm('更改大赛状态，是否继续？', '提示', {
        type: 'warning'
      }).then(() => {
        const open = !val.deploy
        const ids = [val.id]
        const params = {
          state: open,
          ids: ids
        }
        this.resDeploy(params).then((res) => {
          if (res.rcode === 300) {
            this.matchList[index].deploy = !val.deploy
          }
        })
      })
    },
    async resDeploy (params) {
      return await this.$api.match.resDeploy(params)
    },
    // 进入详情编辑
    handleEdit (index, row) {
      this.$router.push({
        path: `/matchManagement/matchDetail/${row.id}/${row.title}`
      })
    },
    // 单个删除
    handleDelete (index, row) {
      this.$confirm('删除该大赛，是否继续？', '提示', {
        type: 'warning'
      }).then(() => {
        this.delMatch([row.id]).then((res) => {
          if (res.rcode === 300) {
            this.matchList.splice(index, 1)
          } else {
            // 提示错误
            this.$message.error(res.message)
          }
        }).catch((err) => {

        })
      })
    }
  }
}
</script>

<style scoped>

</style>

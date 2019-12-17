<template>
  <div v-loading="fullScreenLoading" class="app-container">
    <el-card shadow="never" class="mb-20">
      <el-form ref="form" :inline="true" :model="topicParams" label-width="80px" size="mini">
        <el-form-item label="标题">
          <el-input v-model="topicParams.title" placeholder="菜单姓名" class="filter-item input-box" @change="onSearch" @keyup.enter.native="handleFilter" />
        </el-form-item>
        <el-form-item label="话题类型">
          <el-select v-model="topicParams.type" placeholder="请选择话题类型" class="class-input-box" @change="changeShow">
            <el-option v-for="item in typeList" :key="item.value" :label="item.label" :value="item.value" />
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
        <span class="flex1">话题列表</span>
        <div>
          <el-button type="primary" size="mini" :disabled="opaList.indexOf('add') === -1 ? true : false" @click="handleCreate">
            新增
          </el-button>
          <el-button type="danger" size="mini" :disabled="opaList.indexOf('delete') === -1 ? true : false" @click="batchDeletion">
            批量删除
          </el-button>
        </div>
      </div>
      <el-table ref="topicTable" stripe :data="topicList" tooltip-effect="dark" style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column fixed type="selection" width="55" />
        <el-table-column prop="title" label="标题" />
        <el-table-column prop="authorName" label="作者" />
        <el-table-column prop="tabName" label="标签" />
        <el-table-column prop="type" label="类型" :formatter="typeFormatter" />
        <el-table-column prop="join" label="是否可参加" :formatter="joinFormatter" />
        <el-table-column fixed="right" label="操作" width="280" align="center">
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
      <pagination v-show="topicParams.total > 0" :total="topicParams.total" :page.sync="topicParams.offSet" :limit.sync="topicParams.offSize" @pagination="getTopicList" />
    </el-card>
  </div>
</template>

<script>
import { opaMixin } from '../../../utils/mixins'
import Pagination from '@/components/Pagination' // 分页
export default {
  name: 'Topic',
  components: { Pagination },
  filters: {},
  mixins: [opaMixin],
  data () {
    return {
      fullScreenLoading: false,
      topicParams: {
        title: '',
        type: '',
        total: 0, // 总共条数
        offSet: 0, // 页面
        offSize: 10 // 一页的条数
      },
      typeList: [{ value: '', label: '全部' }, { value: 1, label: '非话题' }, { value: 2, label: '话题' }], // 状态列表
      topicList: [],
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
      this.getTopicList()
    })
  },
  activated () {
  },
  destroyed () {
  },
  methods: {
    handleFilter () {
      this.onSearch()
    },
    // 搜索
    onSearch () {
      this.topicParams.offSet = 1
      this.getTopicList()
    },
    // 重置
    onReset () {
      this.topicParams = {
        title: '',
        type: '',
        total: 0, // 总共条数
        offSet: 0, // 页面
        offSize: 10 // 一页的条数
      }
      this.onSearch()
    },
    changeShow () {
      this.onSearch()
    },
    typeFormatter (row, column) {
      if (row.type === 1) {
        return '非话题'
      } else {
        return '话题'
      }
    },
    joinFormatter (row, column) {
      if (row.join) {
        return '可参加'
      } else {
        return '不可参加'
      }
    },
    // 多选
    handleSelectionChange (val) {
      this.selectArr = val
    },
    // 获取列表
    getTopicList () {
      if (this.opaList.indexOf('list') === -1) {
        return
      }
      this.fullScreenLoading = true
      this.$nextTick(() => {
        const topicParams = Object.assign({}, this.topicParams)
        topicParams.offSet--
        this.$api.topic.compustopicList(topicParams).then((res) => {
          if (res.rcode === 300) {
            this.topicParams.total = res.data.totalPages
            this.topicList = res.data.list
          }
          this.fullScreenLoading = false
        }).catch(() => {

        })
      })
    },
    // 创建
    handleCreate () {
      this.$router.push({
        path: '/topicManagement/topicCreate'
      })
    },
    handleEdit (index, row) {
      this.$router.push({
        path: `/topicManagement/topicEdit/${row.id}`
      })
    },
    // 批量删除
    batchDeletion () {
      if (this.selectArr.length === 0) {
        // 请先选择要删除的项
        this.$message({
          message: '请先选择要删除的话题',
          type: 'warning'
        })
        return
      }
      this.$confirm('即将删除选中的话题，是否继续？', '提示', {
        type: 'warning'
      }).then(() => {
        const ids = []
        this.selectArr.forEach((value) => {
          ids.push(value.id)
        })
        const params = {
          ids
        }
        this.delTopic(params).then((res) => {
          if (res.rcode === 300) {
            this.getTopicList()
            this.selectArr = []
          } else {
            // 错误提示
            this.$message.error(res.message)
          }
        })
      })
    },
    // 进行话题的删除
    async delTopic (ids) {
      const params = {
        ids
      }
      return await this.$api.topic.delCompusTopic(params)
    },
    handleDelete (index, row) {
      this.$confirm('删除该话题，是否继续？', '提示', {
        type: 'warning'
      }).then(() => {
        this.delTopic([row.id]).then((res) => {
          if (res.rcode === 300) {
            this.topicList.splice(index, 1)
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

<template>
  <div v-loading="fullScreenLoading" class="app-container">
    <el-card shadow="never" class="mb-20">
      <el-form ref="form" :inline="false" :model="accountParams" label-width="80px" size="mini">
        <el-form-item label="账号">
          <el-input v-model="accountParams.account" placeholder="账号" class="input-box" @change="onSearch" @keyup.enter.native="handleFilter" />
        </el-form-item>
        <el-form-item label="手机号码">
          <el-input v-model="accountParams.mobile" placeholder="绑定号码" class="input-box" @change="onSearch" @keyup.enter.native="handleFilter" />
          <el-button type="text" style="padding-bottom: 0; padding-top: 0;" @click="showOrHideForm">
            {{ showMore ? '收起' : '展开' }}<i :class="showMore ? 'el-icon-arrow-up' : 'el-icon-arrow-down'" />
          </el-button>
        </el-form-item>
      </el-form>
      <el-form v-show="showMore" ref="moreForm" :inline="false" :model="accountParams" label-width="80px" size="mini">
        <el-form-item label="姓名">
          <el-input v-model="accountParams.name" placeholder="姓名" class="input-box" @change="onSearch" @keyup.enter.native="handleFilter" />
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
        <span class="flex1">用户确认开通列表</span>
      </div>

      <el-table ref="accountTable" stripe :data="accountList" tooltip-effect="dark" style="width: 100%">
        <el-table-column prop="account" label="账号" />
        <el-table-column prop="mobile" label="手机号码" />
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="createTime" label="确认开通时间" :formatter="createTimeFormatter" />
        <el-table-column prop="loginTime" label="最近登录时间" :formatter="loginTimeFormatter" />
      </el-table>

      <pagination v-show="accountParams.total > 0" :total="accountParams.total" :page.sync="accountParams.offSet" :limit.sync="accountParams.offSize" @pagination="getAccountList" />
    </el-card>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination' // 分页
import { parseTime, common } from '../../../utils'
import { opaMixin } from '../../../utils/mixins'
export default {
  name: 'Business',
  components: { Pagination },
  filters: {},
  mixins: [opaMixin],
  data () {
    return {
      fullScreenLoading: false,
      showMore: false,
      accountParams: {
        account: '',
        mobile: '',
        name: '',
        total: 100, // 总共条数
        offSet: 0, // 页面
        offSize: 10 // 一页的条数
      }, // 搜索条件
      accountList: [
        { id: 0, account: 'hzy1231', mobile: '134****5626', name: '何志勇', createTime: 1569932756000, loginTime: 1571932756000 },
        { id: 1, account: 'liangsiyu', mobile: '134****1110', name: '梁思瑜', createTime: 1568032756000, loginTime: 1571132756000 },
        { id: 2, account: 'yw1010', mobile: '135****8448', name: '黄耀文', createTime: 1567032756000, loginTime: 1571932756000 },
        { id: 3, account: '13954237732', mobile: '139****7732', name: '余东义', createTime: 1566032756000, loginTime: 1571932756000 },
        { id: 4, account: 'guan', mobile: '134****1119', name: '关迪朗', createTime: 1564032756000, loginTime: 1569532756000 },
        { id: 5, account: 'xiaoyu205', mobile: '136****7475', name: '黎晓瑜', createTime: 1564012756000, loginTime: 1571932756000 },
        { id: 6, account: 'way_huang', mobile: '135****9210', name: '黄俊辉', createTime: 1563832756000, loginTime: 1569932756000 },
        { id: 7, account: 'one_ming', mobile: '138****5071', name: '何一鸣', createTime: 1563032756000, loginTime: 1571832756000 },
        { id: 8, account: 'yueyue', mobile: '134****6039', name: '张月悦', createTime: 1562032756000, loginTime: 1571932756000 },
        { id: 9, account: 'lwx1330545', mobile: '136****0808', name: '李伟雄', createTime: 1561032756000, loginTime: 1569932756000 }
      ]
    }
  },
  computed: {},
  watch: {},
  created () {
  },
  mounted () {
  },
  activated () {
  },
  destroyed () {
  },
  methods: {
    showOrHideForm () {
      const showMore = this.showMore
      this.showMore = !showMore
    },
    handleFilter () {},
    onSearch () {},
    onReset () {},
    getAccountList () {},
    // 过滤最后更新时间
    createTimeFormatter (row, column) {
      if (row.createTime === 0) {
        return '无更新记录'
      } else {
        return parseTime(row.createTime, '{y}-{m}-{d}')
      }
    },
    loginTimeFormatter (row, column) {
      if (row.loginTime === 0) {
        return '无更新记录'
      } else {
        return parseTime(row.loginTime, '{y}-{m}-{d}')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .input-box {
    width: 178px;
  }
</style>

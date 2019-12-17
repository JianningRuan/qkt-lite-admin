<template>
  <div class="dashboard-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>个人资料</span>
        <router-link :to="'/setting/settingPassword'">
          <el-button style="float: right; padding: 3px 0" type="text">
            设置密码
          </el-button>
        </router-link>
      </div>
      <div class="dashboard-text">
        姓名: {{ name }}
      </div>
      <div class="dashboard-text">
        电话号码: {{ mobile }}
      </div>
      <div class="dashboard-text">
        账号: {{ account }}
      </div>
    </el-card>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Dashboard',
  computed: {
    ...mapGetters([
      'name',
      'mobile',
      'account'
    ])
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;
  }
  &-text {
    color: #606266;
    font-size: 16px;
    line-height: 36px;
  }
}
</style>

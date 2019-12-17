<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="4">
        <el-card shadow="hover">
          <div class="flex justify-between flex-align-center">
            <div>学生用户上传模板</div>
            <el-button type="text">
              下载
            </el-button>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover">
          <div class="flex justify-between flex-align-center">
            <div>教师用户上传模板</div>
            <el-button type="text">
              下载
            </el-button>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover">
          <div class="flex justify-between flex-align-center">
            <div>家长用户上传模板</div>
            <el-button type="text">
              下载
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  name: 'UserTemplate',
  components: {},
  filters: {},
  data () {
    return {}
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
  methods: {}
}
</script>

<style lang="scss" scoped>
.button {
  float: right;
}
</style>

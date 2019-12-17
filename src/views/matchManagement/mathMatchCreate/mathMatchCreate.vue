<template>
  <div class="app-container">
    <div class="cont-margin">
      <el-form ref="postForm" :model="postForm" :rules="rules" label-width="120px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="postForm.title" type="text" maxlength="50" show-word-limit />
        </el-form-item>
        <el-form-item prop="matchTime" label="比赛时间">
          <el-date-picker
            v-model="postForm.matchTime"
            type="daterange"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="timestamp"
            @change="handleChange"
          />
        </el-form-item>
        <el-form-item prop="theme" label="主题">
          <el-select v-model="postForm.theme" placeholder="请选择主题">
            <el-option v-for="item in themeList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item prop="banner" label="广告图">
          <Upload v-model="postForm.banner" @input="getInputFile" />
        </el-form-item>
        <el-form-item prop="shareBanner" label="分享页顶图">
          <Upload v-model="postForm.shareBanner" @input="getInputShareFile" />
        </el-form-item>
        <el-form-item prop="url" label="广告图点击地址">
          <el-input v-model="postForm.url" type="text" placeholder="请输入广告图点击地址" />
        </el-form-item>
        <el-form-item prop="content" label="大赛简介">
          <Tinymce ref="content" v-model="postForm.content" :height="200" />
        </el-form-item>
        <el-form-item prop="desc" label="大赛流程描述">
          <Tinymce ref="desc" v-model="postForm.desc" :height="200" />
        </el-form-item>
        <el-form-item prop="activityRule" label="大赛规则">
          <Tinymce ref="activityRule" v-model="postForm.activityRule" :height="200" />
        </el-form-item>
        <el-form-item prop="awardRule" label="评奖规则">
          <Tinymce ref="awardRule" v-model="postForm.awardRule" :height="200" />
        </el-form-item>
      </el-form>
      <div class="dialog-footer">
        <el-button type="primary" size="mini" :disabled="opaList.indexOf('list') === -1 ? true : false" @click="createClassData">
          确定
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import Tinymce from './../../../components/Tinymce'
import Upload from '@/components/Upload/singleImage3'
import { common } from '../../../utils'
import { opaMixin } from '../../../utils/mixins'

export default {
  name: 'MathMatchCreate',
  components: { Tinymce, Upload },
  filters: {},
  mixins: [opaMixin],
  data () {
    return {
      loading: false,
      postForm: {
        status: 'draft',
        id: 0,
        title: '',
        theme: 'default',
        content: '', // 大赛简介
        activityRule: '', // 大赛规则
        awardRule: '', // 评奖规则
        desc: '', // 大赛流程描述
        beginTime: '',
        endTime: '',
        banner: '',
        shareBanner: '',
        url: '',
        matchTime: []
      },
      rules: {
        title: [
          { required: true, message: '标题不能为空', trigger: 'blur' }
        ],
        content: [
          { required: true, message: '大赛简介不能为空', trigger: 'blur' }
        ],
        desc: [
          { required: true, message: '大赛流程描述不能为空', trigger: 'blur' }
        ],
        matchTime: [
          { required: true, message: '大赛时间不能为空', trigger: 'blur' }
        ]
      },
      themeList: common.themeList
    }
  },
  computed: {},
  watch: {},
  created () {},
  async mounted () {
    await this.getOpaList()
  },
  activated () {
  },
  destroyed () {
  },
  methods: {
    handleChange (val) {
      const beginTimes = val[0]
      const beginDay = new Date(beginTimes).toLocaleDateString()
      this.postForm.beginTime = new Date(beginDay).getTime() // 变成0时0分0秒
      const endTimes = val[1]
      const endDay = new Date(endTimes).toLocaleDateString()
      this.postForm.endTime = new Date(endDay + ' 23:59:59').getTime() // 变成23时59分59秒
    },
    createClassData () {
      if (this.postForm.desc.length > 200) {
        this.$message.error('大赛流程描述不能超过200字数')
        return
      }
      this.$refs['postForm'].validate((valid) => {
        if (valid) {
          const view = this.$route
          this.$api.match.updateMatch(this.postForm).then((res) => {
            if (res.rcode === 300) {
              const id = res.data.id
              this.$confirm('大赛创建成功, 是否继续编辑?', '提示', {
                confirmButtonText: '继续编辑',
                cancelButtonText: '返回列表',
                type: 'warning'
              }).then(() => {
                this.$store.dispatch('delVisitedViews', view).then((views) => {
                  this.$router.push({
                    path: `/matchManagement/matchDetail/${id}/${this.postForm.title}`
                  })
                })
              }).catch(() => {
                this.$store.dispatch('delVisitedViews', view).then((views) => {
                  this.$router.push('/matchManagement/mathMatch')
                })
              })
            } else {
              this.$message({
                type: 'error',
                message: res.message
              })
            }
          }).catch(() => {

          })
        }
      })
    },
    getInputFile (file) {
      this.postForm.banner = file
    },
    getInputShareFile (file) {
      this.postForm.shareBanner = file
    }
  }
}
</script>

<style lang="scss" scoped>
  .dialog-footer {
    text-align: right;
  }
  .cont-margin {
    // max-width: 800px;
    margin-left: 100px;
    margin-right: 100px;
  }
</style>

<template>
  <div class="app-container">
    <div class="cont-margin">
      <el-form ref="dataForm" :model="temp" :rules="rules" label-position="left" label-width="100px">
        <el-form-item prop="title" label="话题标题">
          <el-input v-model="temp.title" placeholder="话题标题" type="text" maxlength="40" show-word-limit class="filter-item input-box" />
        </el-form-item>
        <el-form-item prop="authorName" label="话题作者">
          <el-input v-model="temp.authorName" placeholder="话题作者" type="text" maxlength="10" show-word-limit class="filter-item input-box" />
        </el-form-item>
        <el-form-item prop="content" label="话题内容">
          <Tinymce ref="awardRule" v-model="temp.content" :height="300" />
        </el-form-item>
        <el-form-item prop="pic" label="广告图">
          <Upload v-model="temp.pic" @input="getInputFile" />
        </el-form-item>
        <el-form-item prop="join" label="可否参加">
          <el-select v-model="temp.join" placeholder="请选择可否参加">
            <el-option v-for="item in joinList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item prop="tagId" label="话题标签">
          <el-select v-model="temp.tagId" placeholder="请选择话题标签">
            <el-option v-for="item in tagList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item prop="type" label="话题类型">
          <el-select v-model="temp.type" placeholder="请选择话题类型">
            <el-option v-for="item in typeList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item prop="url" label="链接地址">
          <el-input v-model="temp.url" type="text" placeholder="请输入链接地址" />
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
import { opaMixin } from '../../../utils/mixins'
export default {
  name: 'TopicEdit',
  components: { Tinymce, Upload },
  filters: {},
  mixins: [opaMixin],
  data () {
    return {
      loading: false,
      id: '',
      temp: {
        id: 0,
        authorName: '全课通',
        content: '',
        join: false,
        pic: '',
        tagId: '',
        title: '',
        type: 2,
        url: ''
      },
      rules: {
        title: [
          { required: true, message: '标题不能为空', trigger: 'blur' }
        ],
        content: [
          { required: true, message: '话题内容不能为空', trigger: 'blur' }
        ],
        authorName: [
          { required: true, message: '话题作者不能为空', trigger: 'blur' }
        ],
        join: [
          { required: true, message: '话题可否参加不能为空', trigger: 'change' }
        ],
        type: [
          { required: true, message: '话题类型不能为空', trigger: 'change' }
        ],
        pic: [
          { required: true, message: '话题图片不能为空', trigger: 'blur' }
        ],
        url: [
          { required: false, message: '话题地址不能为空', trigger: 'blur' }
        ]
      },
      joinList: [{ value: true, label: '可参加' }, { value: false, label: '不可参加' }],
      typeList: [{ value: 1, label: '非话题' }, { value: 2, label: '话题' }], // 状态列表
      tagList: []
    }
  },
  computed: {},
  watch: {
    'temp.type': function (newVal) {
      console.log(newVal)
      const rules = this.rules
      if (newVal === 1) {
        rules.url[0].required = true
      } else {
        rules.url[0].required = false
      }
      this.rules = rules
    }
  },
  created () {
    this.id = this.$route.params.id
  },
  async mounted () {
    await this.getOpaList()
    this.getTagByType()
    this.getTopicDetail()
  },
  activated () {
  },
  destroyed () {
  },
  methods: {
    getInputFile (file) {
      this.temp.pic = file
    },
    // 获取标签
    getTagByType () {
      const params = {
        type: 2
      }
      this.$api.tag.getTagByType(params).then((res) => {
        if (res.rcode === 300) {
          const tagList = res.data.list
          tagList.forEach((value) => {
            value.value = value.id
            value.label = value.name
          })
          this.tagList = tagList
        }
      })
    },
    getTopicDetail () {
      if (this.opaList.indexOf('list') === -1) {
        return
      }
      const params = {
        id: this.id
      }
      this.$api.topic.getCompusTopic(params).then((res) => {
        if (res.rcode === 300) {
          this.temp = Object.assign(this.temp, res.data)
        }
      })
    },
    createClassData () {
      if (this.temp.content === '') {
        this.$message.error('话题内容不能为空')
        return
      }
      if (this.temp.pic === '') {
        this.$message.error('话题图片不能为空')
        return
      }
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const view = this.$route
          const temp = Object.assign({}, this.temp)
          temp.id = this.id
          this.$api.topic.updateCompusTopic(temp).then((res) => {
            if (res.rcode === 300) {
              this.$notify({
                title: '成功',
                message: '更新成功',
                type: 'success',
                duration: 2000
              })
              this.$store.dispatch('delVisitedViews', view).then((views) => {
                this.$router.push({
                  path: `/topicManagement/topic`
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

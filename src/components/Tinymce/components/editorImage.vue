<template>
  <div class="upload-container">
    <el-button :style="{background:color,borderColor:color}" icon="el-icon-upload" size="mini" type="primary" @click=" dialogVisible=true">
      上传图片
    </el-button>
    <el-dialog :visible.sync="dialogVisible">
      <el-upload
        :multiple="true"
        :file-list="fileUrlList"
        :show-file-list="true"
        :on-remove="handleRemove"
        :before-upload="beforeUpload"
        :http-request="handleUpload"
        class="editor-slide-upload"
        action=""
        list-type="picture-card"
      >
        <el-button size="small" type="primary">
          点击上传
        </el-button>
      </el-upload>
      <el-button @click="dialogVisible = false">
        取 消
      </el-button>
      <el-button type="primary" @click="handleSubmit">
        确 定
      </el-button>
    </el-dialog>
  </div>
</template>

<script>
// import { getToken } from 'api/qiniu'
import wechat from './../../../utils/wechat'

export default {
  name: 'EditorSlideUpload',
  props: {
    color: {
      type: String,
      default: '#1890ff'
    }
  },
  data () {
    return {
      dialogVisible: false,
      listObj: {},
      fileList: [],
      fileUrlList: []
    }
  },
  methods: {
    async handleUpload (even) {
      const file = even.file
      const fileList = []
      fileList.push(file)
      const res = await wechat.upload(fileList, 1, 'backstage') // backstage
      this.fileList.push(res)
      this.fileUrlList = []
      this.fileList.forEach(value => {
        this.fileUrlList.push({
          url: 'http://' + value[0],
          hasSuccess: true
        })
      })
    },

    checkAllSuccess () {
      return Object.keys(this.fileUrlList).every(item => this.fileUrlList[item].hasSuccess)
    },
    handleSubmit () {
      const arr = Object.keys(this.fileUrlList).map(v => this.fileUrlList[v])
      console.log(arr)
      if (!this.checkAllSuccess()) {
        this.$message('请等待所有图片上传成功 或 出现了网络问题，请刷新页面重新上传！')
        return
      }
      this.$emit('successCBK', arr)
      this.listObj = {}
      this.fileList = []
      this.fileUrlList = []
      this.dialogVisible = false
    },
    /* handleSuccess (response, file, fileList) {
      const uid = file.uid
      const objKeyArr = Object.keys(this.listObj)
      for (let i = 0, len = objKeyArr.length; i < len; i++) {
        if (this.listObj[objKeyArr[i]].uid === uid) {
          this.listObj[objKeyArr[i]].url = response.files.file
          this.listObj[objKeyArr[i]].hasSuccess = true
          return
        }
      }
    }, */
    handleRemove (file) {
      console.log(file)
      const uid = file.uid
      console.log(uid)
      const objKeyArr = Object.keys(this.fileUrlList)
      for (let i = 0, len = objKeyArr.length; i < len; i++) {
        console.log(this.fileUrlList[objKeyArr[i]].uid)
        if (this.fileUrlList[objKeyArr[i]].uid === uid) {
          delete this.fileUrlList[objKeyArr[i]]
          return
        }
      }
    },
    beforeUpload (file) {}
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.editor-slide-upload {
  margin-bottom: 20px;
  /deep/ .el-upload--picture-card {
    width: 100%;
  }
}
</style>

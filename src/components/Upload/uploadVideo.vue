<template>
  <div class="upload-container">
    <el-upload
      ref="elUpload"
      :multiple="false"
      :show-file-list="false"
      :before-upload="beforeUploadVideo"
      :on-progress="uploadVideoProcess"
      :http-request="handleUploadElement"
      :limit="1"
      class="video-uploader"
      drag
      action=""
    >
      <template v-if="!inUpdate">
        <i class="el-icon-upload" />
        <div class="el-upload__text">
          将文件拖到此处，或<em>点击上传</em>
        </div>
      </template>
      <el-progress v-else class="video-progress" type="circle" :percentage="percent" />
    </el-upload>
    <!--<video
      v-else
      ref="video"
      class="player"
      controls="controls"
      controlslist="nodownload"
      name="media"
      width="100%"
      :src="value"
    >
      <source :src="value" type="video/mp4">
    </video>-->
  </div>
</template>

<script>
import COS from 'cos-js-sdk-v5' // 腾讯云cos上传sdk
// import { common } from '../../api/common'
export default {
  name: 'UploadVideo',
  components: {},
  filters: {},
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      inUpdate: false,
      percent: 0
    }
  },
  computed: {},
  watch: {
    value (newVal) {
      console.log(newVal)
    }
  },
  created () {
  },
  mounted () {
  },
  activated () {
  },
  destroyed () {
  },
  methods: {
    uploadVideoProcess (event, file, fileList) {
      console.log(event, file, fileList)
    },
    beforeUploadVideo (file) {
      const isLt10M = file.size / 1024 / 1024 < 30
      if (['video/mp4'].indexOf(file.type) === -1) {
        this.$message.error('请上传正确的视频格式')
        return false
      }
      if (!isLt10M) {
        this.$message.error('上传视频大小不能超过10MB哦!')
        return false
      }
    },
    async handleUploadElement (params) {
      this.inUpdate = true
      const self = this
      const res = await this.$api.common.qcloudAuth()

      const cos = new COS({
        getAuthorization: function (options, callback) {
          // 异步获取临时密钥
          const credentials = res.data.data.credentials
          callback({
            TmpSecretId: credentials.tmpSecretId,
            TmpSecretKey: credentials.tmpSecretKey,
            XCosSecurityToken: credentials.sessionToken,
            ExpiredTime: res.data.data.expiredTime
          })
        }
      })
      const file = params.file
      const fileList = []
      fileList.push(file)
      const uploadList = []
      fileList.map((item) => {
        uploadList.push(
          new Promise(async (resolveItem) => {
            // const key = item
            const result = await this.$api.common.qcloud({ fileKey: item.name, folderName: 'video', type: 1 })
            cos.sliceUploadFile({
              Bucket: result.data.bucket,
              Region: result.data.region,
              Key: result.data.bucketKey,
              Body: item,
              onProgress: function (info) {
                self.percent = parseInt(info.percent * 100)
              }
            }, function (err, data) {
              resolveItem(data.Location)
            })
          })
        )
      })
      const results = await Promise.all(uploadList)
      const tempUrl = 'http://' + results[0]
      this.$emit('input', tempUrl)
      self.inUpdate = false
    }
  }
}
</script>

<style scoped lang="scss">
.video-uploader {
  position: relative;
}
  .video-progress {
    position: absolute;
    top: 50%;
    left: 50%;
    margin-top: -63px;
    margin-left: -63px;
  }
  .player {
    width: 100%;
  }
</style>

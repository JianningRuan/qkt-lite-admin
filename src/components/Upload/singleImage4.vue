<template>
  <div class="upload-container">
    <el-upload
      ref="elUpload"
      :multiple="false"
      :show-file-list="false"
      :http-request="handleUploadElement"
      :limit="1"
      class="image-uploader"
      drag
      action=""
    >
      <i class="el-icon-upload" />
      <div class="el-upload__text">
        将文件拖到此处，或<em>点击上传</em>
      </div>
    </el-upload>
    <!--<div class="image-uploader">
      <label tabindex="0" class="el-upload el-upload--text">
        <div class="el-upload-dragger">
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">
            <em>点击上传</em>
          </div>
        </div>
        <input ref="fileSelector" class="el-upload__input" id="file-selector" type="file" @change="handleUpload">
      </label>
    </div>-->

    <!--<div class="image-preview image-app-preview">
      <div v-show="imageUrl.length>1" class="image-preview-wrapper">
        <img :src="imageUrl">
        <div class="image-preview-action">
          <i class="el-icon-delete" @click="rmImage"/>
        </div>
      </div>
    </div>-->
    <div class="image-preview">
      <div v-show="imageUrl.length>1" class="image-preview-wrapper">
        <img :src="imageUrl">
        <!--<div class="image-preview-show">
          <i class="el-icon-search"></i>
        </div>-->

        <div class="image-preview-action flex flex-align-center justify-around">
          <i class="el-icon-search" title="预览" @click="preview" />
          <i class="el-icon-delete" title="删除" @click="rmImage" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// import { getToken } from '@/api/qiniu'
import wechat from './../../utils/wechat'

import COS from 'cos-js-sdk-v5' // 腾讯云cos上传sdk
import { common } from '@/api/common'

export default {
  name: 'SingleImageUpload3',
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      fileList: [],

      tempUrl: '',
      dataObj: { token: '', key: '' }
    }
  },
  computed: {
    imageUrl () {
      if (this.value === null) {
        return ''
      } else {
        return this.value
      }
    }
  },
  mounted () {},
  methods: {
    rmImage () {
      this.$refs.elUpload.clearFiles()
      // this.$refs.fileSelector.value = '';
      this.emitInput('')
    },
    emitInput (val) {
      this.$emit('input', val)
    },
    handleImageSuccess (file) {
      this.emitInput(file.files.file)
    },
    async handleUpload (even) {
      const file = even.target.files[0]
      const fileList = []
      fileList.push(file)
      const res = await wechat.upload(fileList, 1, 'backstage') // backstage
      this.tempUrl = 'http://' + res[0]
      this.emitInput(this.tempUrl)
      this.$refs.elUpload.clearFiles()
    },
    async handleUploadElement (even) {
      const file = even.file
      const fileList = []
      fileList.push(file)
      const res = await wechat.upload(fileList, 1, 'backstage') // backstage
      this.tempUrl = 'http://' + res[0]
      this.emitInput(this.tempUrl)
      this.$refs.elUpload.clearFiles()
    },
    // 预览
    preview () {
      this.$imagePreview({
        images: [this.imageUrl],
        index: 0
      })
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  @import "~@/styles/mixin.scss";
  .upload-container {
    width: 100%;
    position: relative;
    @include clearfix;
    .image-uploader {
      // width: 35%;
      width: 200px;
      height: 200px;
      float: left;
      position: relative;

      #file-selector {
        width: 200px;
        height: 200px;
        display: block;
        position: absolute;
        top: 0;
        left: 0;
      }
    }
    .image-preview {
      width: 200px;
      height: 200px;
      position: relative;
      border: 1px dashed #d9d9d9;
      float: left;
      margin-left: 40px;
      .image-preview-wrapper {
        position: relative;
        width: 100%;
        height: 100%;
        img {
          width: 100%;
          height: 100%;
        }
      }
      .image-preview-action {
        position: absolute;
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
        text-align: center;
        color: #fff;
        opacity: 0;
        font-size: 20px;
        background-color: rgba(0, 0, 0, .5);
        transition: opacity .3s;
        cursor: pointer;
        line-height: 200px;
        .el-icon-delete {
          font-size: 36px;
        }
        .el-icon-search {
          font-size: 36px;
        }
        &:hover {
          opacity: 1;
        }
      }

      .image-preview-show {
        z-index: 30;
        position: absolute;
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
        text-align: center;
        color: #fff;
        opacity: 0;
        font-size: 20px;
        background-color: rgba(0, 0, 0, .5);
        transition: opacity .3s;
        cursor: pointer;
        line-height: 200px;
        .el-icon-delete {
          font-size: 36px;
        }
        &:hover {
          opacity: 1;
        }
      }
    }
    .image-app-preview {
      width: 320px;
      height: 180px;
      position: relative;
      border: 1px dashed #d9d9d9;
      float: left;
      margin-left: 50px;
      .app-fake-conver {
        height: 44px;
        position: absolute;
        width: 100%; // background: rgba(0, 0, 0, .1);
        text-align: center;
        line-height: 64px;
        color: #fff;
      }
    }
  }
</style>

<template>
  <div class="tinymce-editor">
    <editor
      v-model="myValue"
      :init="init"
      :disabled="disabled"
      @onClick="onClick"
    />
    <el-upload
      id="upload"
      ref="imageUpload"
      multiple
      action="//jsonplaceholder.typicode.com/posts/"
      :on-success="insertImage"
      style="display:block"
    >
      11111
    </el-upload>
  </div>
</template>

<script>
import tinymce from 'tinymce/tinymce'
import Editor from '@tinymce/tinymce-vue'
import 'tinymce/themes/silver/theme'
import 'tinymce/plugins/image'
import 'tinymce/plugins/media'
import 'tinymce/plugins/table'
import 'tinymce/plugins/lists'
import 'tinymce/plugins/contextmenu'
import 'tinymce/plugins/wordcount'
import 'tinymce/plugins/colorpicker'
import 'tinymce/plugins/textcolor'

import 'tinymce/plugins/advlist'
import 'tinymce/plugins/paste'
import 'tinymce/plugins/preview'
import 'tinymce/plugins/fullscreen'
export default {
  name: 'TinymceEditor',
  filters: {},
  components: {
    'editor': Editor
  },
  props: {
    // 传入一个value，使组件支持v-model绑定
    value: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    plugins: {
      type: [String, Array],
      default: 'lists image media table wordcount advlist paste preview fullscreen'
    },
    toolbar: {
      type: [String, Array],
      default: 'fontselect fontsizeselect forecolor backcolor bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | imageUpload quicklink h2 h3 blockquote table numlist bullist preview fullscreen'
    }
  },
  data () {
    return {
      // 初始化配置
      init: {
        language_url: '/static/tinymce/langs/zh_CN.js',
        language: 'zh_CN',
        skin_url: '/static/tinymce/skins/ui/oxide',
        height: 300,
        browser_spellcheck: true, // 拼写检查
        branding: false, // 去水印
        // elementpath: false,  //禁用编辑器底部的状态栏
        statusbar: false, // 隐藏编辑器底部的状态栏
        paste_data_images: true, // 允许粘贴图像
        menubar: false, // 隐藏最上方menu
        plugins: this.plugins,
        toolbar: this.toolbar,
        // 此处为图片上传处理函数，这个直接用了base64的图片形式上传图片，
        // 如需ajax上传可参考https://www.tiny.cloud/docs/configure/file-image-upload/#images_upload_handler
        images_upload_handler: (blobInfo, success, failure) => {
          const img = 'data:image/jpeg;base64,' + blobInfo.base64()
          success(img)
        },
        setup: (editor) => {
          editor.ui.registry.addButton('imageUpload', {
            // text: '插入图片',
            tooltip: '插入图片',
            icon: 'image',
            onAction: () => {
              const upload = this.$refs.imageUpload
              document.getElementsByClassName('el-upload__input')[0].click()
            }
          })
        }
      },
      myValue: this.value
    }
  },
  computed: {},
  watch: {
    value (newValue) {
      this.myValue = newValue
    },
    myValue (newValue) {
      this.$emit('input', newValue)
    }
  },
  created () {
  },
  activated () {
  },
  destroyed () {
  },
  mounted () {
    tinymce.init({})
  },
  methods: {
    // 插入图片至编辑器
    insertImage (res, file) {
      const src = '' // 图片存储地址
      tinymce.execCommand('mceInsertContent', false, `<img src=${src}>`)
    },
    // 添加相关的事件，可用的事件参照文档=> https://github.com/tinymce/tinymce-vue => All available events
    // 需要什么事件可以自己增加
    onClick (e) {
      this.$emit('onClick', e, tinymce)
    },
    // 可以添加一些自己的自定义事件，如清空内容
    clear () {
      this.myValue = ''
    }
  }
}

</script>
<style scoped></style>

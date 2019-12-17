<template>
  <div class="app-container">
    <div class="password-box">
      <el-form ref="passwordForm" :model="passwordTemp" :rules="passwordRules" class="password-form" label-position="left" label-width="80px">
        <el-form-item label="旧密码" prop="oldPassword">
          <el-input v-model="passwordTemp.oldPassword" name="oldPassword" :type="passwordType.oldPassword" placeholder="旧密码">
            <i slot="suffix" class="el-input__icon" :class="passwordType.oldPassword === 'password' ? 'el-icon-view' : 'el-icon-ali-hide'" @click="changePass('oldPassword')" />
          </el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="nowPassword">
          <el-input v-model="passwordTemp.nowPassword" name="nowPassword" :type="passwordType.nowPassword" auto-complete="on" placeholder="新密码">
            <i slot="suffix" class="el-input__icon" :class="passwordType.nowPassword === 'password' ? 'el-icon-view' : 'el-icon-ali-hide'" @click="changePass('nowPassword')" />
          </el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="resPassword">
          <el-input v-model="passwordTemp.resPassword" name="resPassword" :type="passwordType.resPassword" auto-complete="on" placeholder="确认密码">
            <i slot="suffix" class="el-input__icon" :class="passwordType.resPassword === 'password' ? 'el-icon-view' : 'el-icon-ali-hide'" @click="changePass('resPassword')" />
          </el-input>
        </el-form-item>
      </el-form>
      <el-button :loading="loading" type="primary" style="float: right;" @click.native.prevent="handleLogin">
        确定
      </el-button>
    </div>
  </div>
</template>

<script>
import { common } from '../../../utils'
export default {
  name: 'SettingPassword',
  components: {},
  filters: {},
  data () {
    const validatePassword = (rule, value, callback) => {
      if (value.length < 6 || value.length > 20) {
        callback(new Error('密码只能在6-20位数之间'))
        return
      }
      const isPassword = common.isPasswd(value)
      if (isPassword) {
        callback()
      } else {
        callback(new Error('密码不符合规范'))
      }
    }
    const validateRePassword = (rule, value, callback) => {
      if (value === this.passwordTemp.nowPassword) {
        callback()
      } else {
        callback(new Error('与密码不一致'))
      }
    }
    return {
      passwordTemp: {
        oldPassword: '',
        nowPassword: '',
        resPassword: ''
      },
      passwordType: {
        oldPassword: 'password',
        nowPassword: 'password',
        resPassword: 'password'
      },
      passwordRules: {
        oldPassword: [
          { required: true, message: '旧密码不能为空', trigger: 'blur' }
        ],
        nowPassword: [
          { required: true, message: '新密码不能为空', trigger: 'blur' },
          { trigger: 'blur', validator: validatePassword }
        ],
        resPassword: [
          { required: true, message: '确认密码不能为空', trigger: 'blur' },
          { trigger: 'blur', validator: validateRePassword }
        ]
      },
      loading: false
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
    // 密码框明码还是暗码切换
    changePass (value) {
      if (this.passwordType[value] === 'password') {
        this.passwordType[value] = 'text'
      } else {
        this.passwordType[value] = 'password'
      }
    },
    // 重置密码设置
    reactTemp () {
      this.passwordTemp = {
        oldPassword: '',
        nowPassword: '',
        resPassword: ''
      }
    },
    // 确认设置
    handleLogin () {
      this.$refs['passwordForm'].validate((valid) => { // 检查rule
        if (valid) {
          const passwordTempData = Object.assign({}, this.passwordTemp)
          this.$api.home.resMyPassWord(passwordTempData).then((res) => {
            if (res.rcode === 300) {
              this.reactTemp()
              this.$notify({
                title: '成功',
                message: '设置成功',
                type: 'success',
                duration: 3000
              })
              const view = this.$route
              this.$store.dispatch('delVisitedViews', view).then((views) => {
                this.$router.push({
                  path: `/`
                })
              })
            } else {
              this.$message.error(res.message)
            }
          }).catch(() => {
            // 失败提示

          })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .password-box {
    width: 560px;
    margin: 80px auto 0 auto;
    border: 1px solid #DCDFE6;
    padding: 50px;
    border-radius: 10px;
  }
</style>

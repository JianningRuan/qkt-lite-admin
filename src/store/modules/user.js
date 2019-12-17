import { login } from '@/api/login'
import { home } from '../../api/home'
import { getToken, setToken, removeToken } from '@/utils/auth'

const user = {
  state: {
    token: getToken(),
    name: '',
    account: '',
    mobile: '',
    roles: []
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_NAME: (state, name) => {
      state.name = name
    },
    SET_ACCOUNT: (state, account) => {
      state.account = account
    },
    SET_MOBILE: (state, mobile) => {
      state.mobile = mobile
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    }
  },

  actions: {
    // 登录
    Login ({ commit }, userInfo) {
      const username = userInfo.username.trim()
      return new Promise((resolve, reject) => {
        login.login(username, userInfo.password).then(response => {
          const data = response.data
          setToken(data.access_token)
          commit('SET_TOKEN', data.access_token)
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 获取用户信息
    GetInfo ({ commit, state }) {
      return new Promise((resolve, reject) => {
        login.getMyUserInfo().then(response => {
          const data = response.data
          /* const roleArr = ['admin']
          commit('SET_ROLES', roleArr);
          if (data.roles && data.roles.length > 0) { // 验证返回的roles是否是一个非空数组
            commit('SET_ROLES', data.roles)
          } else {
            reject('getInfo: roles must be a non-null array !')
          } */
          commit('SET_NAME', data.name)
          commit('SET_ACCOUNT', data.account)
          commit('SET_MOBILE', data.mobile)
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 登出
    LogOut ({ commit, state }) {
      return new Promise((resolve, reject) => {
        const params = {
          access_token: state.token
        }
        login.logout(params).then((res) => {
          if (res.rcode === 300) {
            commit('SET_TOKEN', '')
            // commit('SET_ROLES', []);
            commit('SET_NAME', '')
            commit('SET_ACCOUNT', '')
            commit('SET_MOBILE', '')
            removeToken()
            resolve()
          }
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 前端 登出
    FedLogOut ({ commit }) {
      return new Promise(resolve => {
        commit('SET_NAME', '')
        commit('SET_ACCOUNT', '')
        commit('SET_MOBILE', '')
        commit('SET_TOKEN', '')
        removeToken()
        resolve()
      })
    }
  }
}

export default user

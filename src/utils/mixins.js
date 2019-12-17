import store from '../store'
import { getToken } from '@/utils/auth'
export const opaMixin = {
  data () {
    return {
      opaList: [] // 操作权限列表
    }
  },
  created () {},
  mounted () {},
  methods: {
    // 获取操作权限
    async getOpaList () {
      this.fullScreenLoading = true
      const res = await this.getPermission()
      this.opaList = res.data
      // this.opaList = ['list', 'query', 'add', 'edit', 'delete'];
      // return res.data;
    },
    getPermission () {
      const params = {
        access_token: getToken(),
        menuId: store.getters.menuId
      }
      return new Promise((resolve, reject) => {
        this.$api.common.getPermission(params).then((res) => {
          if (res.rcode === 300) {
            resolve(res)
          } else {
            reject(res)
          }
        })
      })
    }
  }
}

export const adrOpaMixin = {
  data () {
    return {
      opaList: [] // 操作权限列表
    }
  },
  created () {},
  mounted () {
    // this.getOpaList();
  },
  methods: {
    // 获取操作权限
    async getOpaList () {
      const res = await this.getPermission()
      this.opaList = res.data
      // this.opaList = ['list', 'query', 'add', 'edit', 'delete'];
    },
    getPermission () {
      const params = {
        access_token: getToken(),
        menuId: store.getters.menuId
      }
      return new Promise((resolve, reject) => {
        this.$api.common.getPermission(params).then((res) => {
          if (res.rcode === 300) {
            resolve(res)
          } else {
            reject(res)
          }
        })
      })
    }
  }
}

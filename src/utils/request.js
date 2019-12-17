import axios from 'axios'
import { Message, MessageBox } from 'element-ui'
import store from '../store'
import qs from 'qs'
import { getToken } from '@/utils/auth'

// 创建axios实例
const service = axios.create({
  baseURL: process.env.BASE_API // api 的 base_url   process.env.BASE_API  http://192.168.1.29:8999/mockjsdata/42
  // timeout: 5000 // 请求超时时间
})

// request拦截器
service.interceptors.request.use(
  config => {
    if (store.getters.token) {
      config.headers['Authorization'] = 'Bearer ' + getToken()
      // config.headers.Authorization = 'Bearer ' + getToken();
      config.headers['access_token'] = getToken() // 让每个请求携带自定义token 请根据实际情况自行修改
    }
    return config
  },
  error => {
    // Do something with request error
    console.log(error) // for debug
    Promise.reject(error)
  }
)

// response 拦截器
service.interceptors.response.use(
  response => {
    /**
     * code为非20000是抛错 可结合自己业务进行修改
     */
    const res = response.data

    /* if (res.rcode === 300) {
      return response.data
    } else {

    } */
    if (response.config && response.config.responseType === 'blob') {
      return response
    }
    if (response.config && response.config.responseType === 'arraybuffer') {
      return response
    }

    if (res.rcode !== 300) {
      console.log(response, res)
      if (res.rcode === 405) {
        MessageBox.confirm(
          '你已被登出，可以取消继续留在该页面，或者重新登录',
          '确定登出',
          {
            confirmButtonText: '重新登录',
            cancelButtonText: '取消',
            type: 'warning'
          }
        ).then(() => {
          store.dispatch('FedLogOut').then(() => {
            location.reload() // 为了重新实例化vue-router对象 避免bug
          })
        })
      } else {
        Message({
          message: res.message,
          type: 'error',
          duration: 5 * 1000
        })
      }

      return Promise.reject('error')
    } else {
      return response.data
    }
  },
  error => {
    console.log('err' + error) // for debug
    console.log(error.response)
    const response = error.response
    if (response.status === 401) {
      MessageBox.alert(
        '你已被登出，请重新登录',
        '温馨提示',
        {
          confirmButtonText: '重新登录',
          showClose: false,
          type: 'warning'
        }
      ).then(() => {
        store.dispatch('FedLogOut').then(() => {
          location.reload() // 为了重新实例化vue-router对象 避免bug
        })
      })
    } else {
      Message({
        message: '系统错误，请稍后再试',
        type: 'error',
        duration: 5 * 1000
      })
    }
    return Promise.reject(error)
  }
)

export default service

/**
 * 封装get请求
 * @param url
 * @param data
 * @returns {Promise}
 */
export function get (url, params) {
  return new Promise((resolve, reject) => {
    /* if (store.getters.token) {
      if (params) {
        params.access_token = getToken();
      } else {
        params = {
          access_token: getToken()
        }
      }
    } */
    service.get(url, { params: params }).then((response) => {
      resolve(response) // .data
    }).catch((err) => {
      reject(err)
    })
  })
}

/**
 * 封装post请求
 * @param url
 * @param data
 * @returns {Promise}
 */
export function post (url, data = {}) {
  return new Promise((resolve, reject) => {
    service.post(url, data, { headers: {
      'Content-Type': 'application/json; charset=UTF-8'
    } }).then(response => {
      resolve(response) // .data
    }, err => {
      reject(err)
    })
  })
}

/**
 * 封装post文件上传请求
 * @param url
 * @param data
 * @returns {Promise}
 */
export function postFile (url, data = {}) {
  return new Promise((resolve, reject) => {
    service.post(url, data, { headers: {
      'Content-Type': 'multipart/form-data'
    } }).then(response => {
      resolve(response)
    }, err => {
      reject(err)
    })
  })
}

export function getDown (url, params) {
  return new Promise((resolve, reject) => {
    service.get(url, { params: params, responseType: 'blob' }).then((response) => {
      resolve(response) // .data
    }).catch((err) => {
      reject(err)
    })
  })
}

export function postDown (url, data = {}) {
  return new Promise((resolve, reject) => {
    service.post(url, data, {
      headers: {
        'Content-Type': 'application/json; charset=UTF-8'
      },
      responseType: 'blob'
    }).then((response) => {
      resolve(response) // .data
    }).catch((err) => {
      reject(err)
    })
  })
}

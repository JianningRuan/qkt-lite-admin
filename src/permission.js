import router from './router'
import store from './store'
import NProgress from 'nprogress' // Progress 进度条
import 'nprogress/nprogress.css'// Progress 进度条样式
import { Message } from 'element-ui'
import { getToken } from '@/utils/auth' // 验权

const whiteList = ['/login'] // 不重定向白名单
router.beforeEach((to, from, next) => {
  NProgress.start()
  if (getToken()) {
    if (to.path === '/login') {
      next({ path: '/' })
      NProgress.done() // if current page is dashboard will not trigger	afterEach hook, so manually handle it
    } else {
      if (store.getters.account === '') {
        store.dispatch('GetInfo').then(res => { // 拉取用户信息
          // const roles = ['admin']; // note: roles must be a array! such as: ['editor','develop']
          store.dispatch('GenerateRoutes').then(() => {
            router.addRoutes(store.getters.addRouters) // 动态添加可访问路由表
            next({ ...to, replace: true }) // hack方法 确保addRoutes已完成 ,set the replace: true so the navigation will not leave a history record
          })
          // next()
        }).catch((err) => {
          store.dispatch('FedLogOut').then(() => {
            Message.error(err || '验证失败，请重新登录')
            next({ path: '/' })
          })
        })
      } else {
        next()
      }
    }
  } else {
    if (whiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      // next(`/login?redirect=${to.path}`); // 否则全部重定向到登录页
      next('/login')
      NProgress.done()
    }
  }
})

router.afterEach((to, from) => {
  const name = to.name
  const menuList = store.getters.menuList
  for (let i = 0, l = menuList.length; i < l; i++) {
    if (menuList[i].name === name) {
      store.dispatch('GetMenuId', menuList[i].id)
      break
    }
  }
  NProgress.done() // 结束Progress
})

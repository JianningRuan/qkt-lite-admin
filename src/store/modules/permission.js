import { asyncRouterMap, constantRouterMap, menuList } from './../../router'
import { home } from '../../api/home'
import { common } from '../../utils'
import Layout from '@/views/layout/Layout'

/**
 * 通过meta.role判断是否与当前用户权限匹配
 * @param roles
 * @param route
 */
function hasPermission (roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.indexOf(role) >= 0)
  } else {
    return true
  }
}

/**
 * 递归过滤异步路由表，返回符合用户角色权限的路由表
 * @param asyncRouterMap
 * @param roles
 */
function filterAsyncRouter (asyncRouterMap, roles) {
  const accessedRouters = asyncRouterMap.filter(route => {
    if (hasPermission(roles, route)) {
      if (route.children && route.children.length) {
        route.children = filterAsyncRouter(route.children, roles)
      }
      return true
    }
    return false
  })
  return accessedRouters
}

// 构建路由
function createAsyncRouter (routerList) {
  let redirectArr = [] // 存放redirect的信息合集

  function getRedirect (value) {
    if (value.children && value.children.length > 0) {
      redirectArr.push(value.children[0].name)
      getRedirect(value.children[0])
    } else {

    }
  }

  // 遍历组建路由的redirect
  function forEachRouter (routerItem) {
    routerItem.forEach((value) => { // 遍历元素，如果有子元素的则进入
      if (value.children && value.children.length > 0) {
        redirectArr = redirectArr.slice(0, value.type - 1) // 根据当前路由的type来确认当前的redirectArr位置，把多余的信息去除
        redirectArr.push(value.name)
        getRedirect(value)

        // value.redirectArr = redirectArr;
        value.redirect = '/' + redirectArr.join('/')

        const children = value.children
        value.children = forEachRouter(children)
      }
    })
    return routerItem
  }

  // 先组装路由信息
  routerList.forEach((value) => {
    if (value.type === 1) {
      value.component = Layout
    } else {
      value.component = () => import('@/views' + value.url)
    }
    value.meta = {
      title: value.title,
      icon: value.icon,
      noCache: value.noCache
    }
    const pathIndexOf = value.path.indexOf('/') // 设定路由的name与path一致。 但是一级路由和部分子路由含有'/'，需去除
    const path = value.path
    if (pathIndexOf === -1) {
      value.name = value.path
    } else if (pathIndexOf === 0) {
      value.name = path.substr(1)
    } else {
      value.name = path.substr(0, pathIndexOf)
    }
  })
  // 通过parentI转化成多元数组
  let newRouterList = common.translateDataToTree(routerList)
  // 组装redirect
  newRouterList = forEachRouter(newRouterList)

  const noRouter = { path: '*', redirect: '/404', hidden: true }
  newRouterList.push(noRouter)
  return newRouterList
}

const permission = {
  state: {
    routers: constantRouterMap,
    addRouters: [],
    menuList: [],
    menuId: ''
  },
  mutations: {
    SET_ROUTERS: (state, routers) => {
      state.addRouters = routers
      state.routers = constantRouterMap.concat(routers)
    },
    SET_MENU_LIST: (state, menuList) => {
      state.menuList = menuList
    },
    SET_MENU_ID: (state, menuId) => {
      state.menuId = menuId
    }
  },
  actions: {
    GenerateRoutes ({ commit }) {
      return new Promise((resolve, reject) => {
        home.getMyMenu().then((response) => {
          let routerList = response.data.menuList
          // routerList = menuList; // 虚拟数据
          routerList = createAsyncRouter(routerList)
          commit('SET_ROUTERS', routerList)
          commit('SET_MENU_LIST', response.data.menuList)
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },
    updateRoutes ({ commit }, data) {
      return new Promise(resolve => {
        commit('SET_ROUTERS', data)
        resolve()
      })
    },
    GetMenuId ({ commit }, data) {
      return new Promise(resolve => {
        commit('SET_MENU_ID', data)
        resolve()
      })
    }
  }
}

export default permission

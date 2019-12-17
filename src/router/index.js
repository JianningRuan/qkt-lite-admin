import Vue from 'vue'
import Router from 'vue-router'

/* Layout */
import Layout from '@/views/layout/Layout'

// in development-env not use lazy-loading, because lazy-loading too many pages will cause webpack hot update too slow. so only in production use lazy-loading;
// detail: https://panjiachen.github.io/vue-element-admin-site/#/lazy-loading

Vue.use(Router)

/**
* hidden: true                   if `hidden:true` will not show in the sidebar(default is false)
* alwaysShow: true               if set true, will always show the root menu, whatever its child routes length
*                                if not set alwaysShow, only more than one route under the children
*                                it will becomes nested mode, otherwise not show the root menu
* redirect: noredirect           if `redirect:noredirect` will no redirect in the breadcrumb
* name:'router-name'             the name is used by <keep-alive> (must set!!!)
* meta : {
    title: 'title'               the name show in submenu and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar,
  }
**/
export const constantRouterMap = [
  { path: '/login', component: () => import('@/views/login/index'), hidden: true },
  { path: '/404', component: () => import('@/views/404'), hidden: true },
  {
    path: '/',
    component: Layout,
    redirect: 'dashboard',
    children: [{
      path: 'dashboard',
      name: 'dashboard',
      component: () => import('@/views/dashboard/index'),
      meta: { title: '控制台', icon: 'dashboard', noCache: true }
    }]
  },
  {
    path: '/setting',
    component: Layout,
    redirect: '/setting/settingPassword',
    name: 'setting',
    meta: {
      title: '设置',
      icon: 'setting'
    },
    hidden: false,
    children: [
      {
        path: 'settingPassword',
        name: 'settingPassword',
        component: () => import('@/views/setting/settingPassword/settingPassword'),
        meta: {
          title: '密码设置',
          icon: 'setting'
        },
        hidden: false
      }
    ]
  }
]

export default new Router({
  // mode: 'history', //后端支持可开
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRouterMap
})

export const asyncRouterMap = [
  {
    path: '/userManagement',
    component: Layout,
    redirect: '/userManagement/stuManagement',
    name: 'userManagement',
    meta: {
      title: '用户管理',
      icon: 'peoples',
      roles: ['admin', 'editor']
    },
    // alwaysShow: true,
    children: [
      {
        path: 'stuManagement',
        name: 'stuManagement',
        component: () => import('@/views/userManagement/student/student'),
        meta: {
          title: '学生管理',
          icon: 'peoples',
          roles: ['admin', 'editor']
        }
      },
      {
        path: 'tchManagement',
        name: 'tchManagement',
        component: () => import('@/views/userManagement/teacher/teacher'),
        meta: {
          title: '教师管理',
          icon: 'peoples',
          roles: ['admin', 'editor']
        }
      },
      {
        path: 'parentManagement',
        name: 'parentManagement',
        component: () => import('@/views/userManagement/parent/parent'),
        meta: {
          title: '家长管理',
          icon: 'peoples',
          roles: ['admin', 'editor']
        }
      }
      /* {
        path: 'userTemplate',
        name: 'userTemplate',
        component: () => import('@/views/userManagement/userTemplate/userTemplate'),
        meta: {
          title: '用户模板下载',
          icon: 'excel',
          roles: ['admin', 'editor']
        }
      } */
    ]
  },
  {
    path: '/schoolManagement',
    component: Layout,
    redirect: '/schoolManagement/school',
    name: 'schoolManagement',
    meta: {
      title: '学校班级管理',
      icon: 'school'
    },
    children: [
      {
        path: 'school',
        component: () => import('@/views/schoolManagement/school/school'),
        name: 'school',
        meta: { title: '学校管理', icon: 'school' }
      },
      {
        path: 'classList/:id(\\d+)/:title',
        component: () => import('@/views/schoolManagement/classList/classList'),
        name: 'classList',
        meta: { title: '班级列表', noCache: true },
        hidden: true
      }
    ]
  },
  {
    path: '/addressManagement',
    component: Layout,
    redirect: '/addressManagement/address',
    name: 'addressManagement',
    meta: {
      title: '地区管理',
      icon: 'address'
    },
    // alwaysShow: true,
    children: [
      {
        path: 'addressList',
        component: () => import('@/views/addressManagement/address/address'),
        name: 'addressList',
        meta: { title: '地区管理', icon: 'address' }
      }
    ]
  },
  {
    path: '/roleManagement',
    component: Layout,
    redirect: '/roleManagement/role',
    name: 'roleManagement',
    meta: {
      title: '角色管理',
      icon: 'user'
    },
    // alwaysShow: true,
    children: [
      {
        path: 'role',
        component: () => import('@/views/roleManagement/role/role'),
        name: 'role',
        meta: {
          title: '角色管理',
          icon: 'user'
        }
      },
      {
        path: 'rolePermission/:id(\\d+)/:title',
        component: () => import('@/views/roleManagement/rolePermission/rolePermission'),
        name: 'rolePermission',
        meta: {
          title: '角色权限管理',
          icon: 'user',
          noCache: true
        },
        hidden: true
      }
    ]
  },
  {
    path: '/accountManagement',
    component: Layout,
    redirect: '/accountManagement/account',
    name: 'accountManagement',
    meta: {
      title: '账号管理',
      icon: 'form'
    },
    children: [
      {
        path: 'account',
        component: () => import('@/views/accountManagement/account/account'),
        name: 'account',
        meta: {
          title: '账号管理',
          icon: 'form'
        }
      },
      {
        path: 'accountAreaPermission/:id(\\d+)/:title',
        component: () => import('@/views/accountManagement/accountAreaPermission/accountAreaPermission'),
        name: 'accountAreaPermission',
        meta: {
          title: '账号地区/学校授权',
          icon: 'form',
          noCache: true
        },
        hidden: true
      },
      {
        path: 'accountRolePermission/:id(\\d+)/:title',
        component: () => import('@/views/accountManagement/accountRolePermission/accountRolePermission'),
        name: 'accountRolePermission',
        meta: {
          title: '账号角色授权',
          icon: 'form',
          noCache: true
        },
        hidden: true
      }
    ]
  },
  {
    path: '/menuManagement',
    component: Layout,
    redirect: '/menuManagement/menu',
    name: 'menuManagement',
    meta: {
      title: '菜单管理',
      icon: 'list'
    },
    children: [
      {
        path: 'menuList',
        component: () => import('@/views/menuManagement/menu/menu'),
        name: 'menuList',
        meta: {
          title: '菜单管理',
          icon: 'list'
        }
      },
      {
        path: 'menuPermission/:id(\\d+)/:title',
        component: () => import('@/views/menuManagement/menuPermission/menuPermission'),
        name: 'menuPermission',
        meta: {
          title: '菜单关联操作',
          icon: 'list',
          noCache: true
        },
        hidden: true
      }
    ]
  },
  { path: '*', redirect: '/404', hidden: true }
]

export const menuList = [
  {
    id: 1,
    parentId: 0,
    icon: 'peoples',
    path: '/userManagement',
    title: '用户管理',
    type: 1,
    url: '/layout/Layout',
    hidden: false,
    noCache: false
  },
  {
    id: 2,
    path: 'stuManagement',
    parentId: 1,
    icon: 'peoples',
    title: '学生管理',
    type: 2,
    url: '/userManagement/student/student',
    hidden: false,
    noCache: false
  },
  {
    id: 3,
    parentId: 1,
    icon: 'peoples',
    path: 'tchManagement',
    title: '教师管理',
    type: 2,
    url: '/userManagement/teacher/teacher',
    hidden: false,
    noCache: false
  },
  {
    id: 4,
    parentId: 1,
    icon: 'peoples',
    path: 'parentManagement',
    title: '家长管理',
    type: 2,
    url: '/userManagement/parent/parent',
    hidden: false,
    noCache: false
  },
  {
    id: 22,
    parentId: 1,
    icon: 'peoples',
    path: 'tchClassList/:id(\\d+)/:title',
    title: '教师班级查看',
    type: 2,
    url: '/userManagement/tchClassList/tchClassList',
    hidden: true,
    noCache: true
  },
  {
    id: 5,
    parentId: 0,
    icon: 'school',
    path: '/schoolManagement',
    title: '学校班级管理',
    type: 1,
    url: '/layout/Layout',
    hidden: false,
    noCache: false
  },
  {
    id: 6,
    parentId: 5,
    icon: 'school',
    path: 'school',
    title: '学校管理',
    type: 2,
    url: '/schoolManagement/school/school',
    hidden: false,
    noCache: false
  },
  {
    id: 7,
    parentId: 5,
    icon: 'school',
    path: 'classList/:id(\\d+)/:title',
    title: '班级列表',
    type: 2,
    url: '/schoolManagement/classList/classList',
    hidden: true,
    noCache: true
  },
  {
    id: 8,
    parentId: 0,
    icon: 'address',
    path: '/addressManagement',
    title: '地区管理',
    type: 1,
    url: '/layout/Layout',
    hidden: false,
    noCache: false
  },
  {
    id: 9,
    parentId: 8,
    icon: 'address',
    path: 'addressList',
    title: '地区管理',
    type: 2,
    url: '/addressManagement/address/address',
    hidden: false,
    noCache: false
  },
  {
    id: 10,
    parentId: 0,
    icon: 'user',
    path: '/roleManagement',
    title: '角色管理',
    type: 1,
    url: '/layout/Layout',
    hidden: false,
    noCache: false
  },
  {
    id: 11,
    parentId: 10,
    icon: 'user',
    path: 'role',
    title: '角色管理',
    type: 2,
    url: '/roleManagement/role/role',
    hidden: false,
    noCache: false
  },
  {
    id: 12,
    parentId: 10,
    icon: 'user',
    path: 'rolePermission/:id(\\d+)/:title',
    title: '角色权限管理',
    type: 2,
    url: '/roleManagement/rolePermission/rolePermission',
    hidden: true,
    noCache: true
  },
  {
    id: 13,
    parentId: 0,
    icon: 'form',
    path: '/accountManagement',
    title: '账号管理',
    type: 1,
    url: '/layout/Layout',
    hidden: false,
    noCache: false
  },
  {
    id: 14,
    parentId: 13,
    icon: 'form',
    path: 'account',
    title: '账号管理',
    type: 2,
    url: '/accountManagement/account/account',
    hidden: false,
    noCache: false
  },
  {
    id: 15,
    parentId: 13,
    icon: 'form',
    path: 'accountAreaPermission/:id(\\d+)/:title',
    title: '账号地区/学校授权',
    type: 2,
    url: '/accountManagement/accountAreaPermission/accountAreaPermission',
    hidden: true,
    noCache: true
  },
  {
    id: 16,
    parentId: 13,
    icon: 'form',
    path: 'accountRolePermission/:id(\\d+)/:title',
    title: '账号角色授权',
    type: 2,
    url: '/accountManagement/accountRolePermission/accountRolePermission',
    hidden: true,
    noCache: true
  },
  {
    id: 17,
    parentId: 0,
    icon: 'list',
    path: '/menuManagement',
    title: '菜单管理',
    type: 1,
    url: '/layout/Layout',
    hidden: false,
    noCache: false
  },
  {
    id: 18,
    parentId: 17,
    icon: 'list',
    path: 'menuList',
    title: '菜单管理',
    type: 2,
    url: '/menuManagement/menu/menu',
    hidden: false,
    noCache: false
  },
  {
    id: 19,
    parentId: 17,
    icon: 'list',
    path: 'menuPermission/:id(\\d+)/:title',
    title: '菜单关联操作',
    type: 2,
    url: '/menuManagement/menuPermission/menuPermission',
    hidden: true,
    noCache: true
  },
  {
    id: 23,
    parentId: 0,
    icon: 'form',
    path: '/matchManagement',
    title: '大赛管理',
    type: 1,
    url: '/layout/Layout',
    hidden: false,
    noCache: false
  },
  {
    id: 24,
    parentId: 23,
    icon: 'form',
    path: 'mathMatch',
    title: '口算大赛管理',
    type: 2,
    url: '/matchManagement/mathMatch/mathMatch',
    hidden: false,
    noCache: false
  },
  {
    id: 25,
    parentId: 23,
    icon: 'form',
    path: 'matchDetail/:id(\\d+)/:title',
    title: '口算大赛详情',
    type: 2,
    url: '/matchManagement/mathMatchDetail/mathMatchDetail',
    hidden: true,
    noCache: true
  },
  {
    id: 26,
    parentId: 23,
    icon: 'form',
    path: 'mathMatchCreate',
    title: '口算大赛创建',
    type: 2,
    url: '/matchManagement/mathMatchCreate/mathMatchCreate',
    hidden: true,
    noCache: true
  },
  {
    id: 27,
    parentId: 23,
    icon: 'form',
    path: 'mathMatchZoneList/:id(\\d+)/:title',
    title: '口算大赛场次列表',
    type: 2,
    url: '/matchManagement/mathMatchZoneList/mathMatchLevelList',
    hidden: true,
    noCache: true
  },
  {
    id: 28,
    parentId: 23,
    icon: 'form',
    path: 'mathMatchZoneDetail/:id(\\d+)/:title/:levelId',
    title: '口算大赛场次详情',
    type: 2,
    url: '/matchManagement/mathMatchZoneDetail/mathMatchLevelDetail',
    hidden: true,
    noCache: true
  },
  {
    id: 29,
    parentId: 23,
    icon: 'form',
    path: 'mathMatchEdit/:id(\\d+)',
    title: '口算大赛编辑',
    type: 2,
    url: '/matchManagement/mathMatchEdit/mathMatchEdit',
    hidden: true,
    noCache: true
  },
  {
    id: 30,
    parentId: 23,
    icon: 'form',
    path: 'mathMatchStatistics',
    title: '口算大赛-数据汇总',
    type: 2,
    url: '/matchManagement/mathMatchStatistics/mathMatchStatistics',
    hidden: false,
    noCache: false
  },
  {
    id: 31,
    parentId: 23,
    icon: 'form',
    path: 'mathMatchCountStatistic',
    title: '口算大赛-活跃数据统计',
    type: 2,
    url: '/matchManagement/mathMatchCountStatistic/mathMatchCountStatistic',
    hidden: false,
    noCache: false
  },
  {
    id: 32,
    parentId: 23,
    icon: 'form',
    path: 'mathMatchUserStatisticList',
    title: '口算大赛-用户参赛明细',
    type: 2,
    url: '/matchManagement/mathMatchUserStatisticList/mathMatchUserStatisticList',
    hidden: false,
    noCache: false
  },
  {
    id: 33,
    parentId: 23,
    icon: 'form',
    path: 'mathMatchPreview/:id(\\d+)',
    title: '口算大赛预览',
    type: 2,
    url: '/matchManagement/mathMatchPreview/mathMatchPreview',
    hidden: true,
    noCache: true
  },
  {
    id: 34,
    parentId: 23,
    icon: 'form',
    path: 'mathMatchRulePreview/:id(\\d+)',
    title: '口算大赛规则预览',
    type: 2,
    url: '/matchManagement/mathMatchPreview/mathMatchRulePreview',
    hidden: true,
    noCache: true
  },
  {
    id: 35,
    parentId: 0,
    icon: 'form',
    path: '/topicManagement',
    title: '话题管理',
    type: 1,
    url: '/layout/Layout',
    hidden: false,
    noCache: false
  },
  {
    id: 36,
    parentId: 35,
    icon: 'form',
    path: 'topic',
    title: '话题管理',
    type: 2,
    url: '/topicManagement/topic/topic',
    hidden: false,
    noCache: false
  },
  {
    id: 37,
    parentId: 35,
    icon: 'form',
    path: 'topicCreate',
    title: '话题创建',
    type: 2,
    url: '/topicManagement/topicCreate/topicCreate',
    hidden: true,
    noCache: true
  },
  {
    id: 38,
    parentId: 35,
    icon: 'form',
    path: 'topicEdit/:id(\\d+)',
    title: '话题编辑',
    type: 2,
    url: '/topicManagement/topicEdit/topicEdit',
    hidden: true,
    noCache: true
  },
  {
    id: 39,
    parentId: 0,
    icon: 'form',
    path: '/tagManagement',
    title: '标签管理',
    type: 1,
    url: '/layout/Layout',
    hidden: false,
    noCache: false
  },
  {
    id: 40,
    parentId: 39,
    icon: 'form',
    path: 'tag',
    title: '标签管理',
    type: 2,
    url: '/tagManagement/tag/tag',
    hidden: false,
    noCache: false
  },
  {
    id: 41,
    parentId: 0,
    icon: 'form',
    path: '/courseManagement',
    title: '课程管理',
    type: 1,
    url: '/layout/Layout',
    hidden: false,
    noCache: false
  },
  {
    id: 42,
    parentId: 41,
    icon: 'form',
    path: 'course',
    title: '课程管理',
    type: 2,
    url: '/courseManagement/course/course',
    hidden: false,
    noCache: false
  },
  {
    id: 43,
    parentId: 41,
    icon: 'form',
    path: 'lesson/:id(\\d+)/:title',
    title: '课时管理',
    type: 2,
    url: '/courseManagement/lesson/lesson',
    hidden: true,
    noCache: true
  },
  {
    id: 44,
    parentId: 41,
    icon: 'form',
    path: 'video',
    title: '课程管理',
    type: 2,
    url: '/courseManagement/video/video',
    hidden: false,
    noCache: false
  },
  {
    id: 45,
    parentId: 0,
    icon: 'form',
    path: '/summaryManagement',
    title: '评论管理',
    type: 1,
    url: '/layout/Layout',
    hidden: false,
    noCache: false
  },
  {
    id: 46,
    parentId: 45,
    icon: 'form',
    path: 'summary',
    title: '评论管理',
    type: 2,
    url: '/summaryManagement/summary/summary',
    hidden: false,
    noCache: false
  },
  {
    id: 47,
    parentId: 0,
    icon: 'form',
    path: '/bannerManagement',
    title: '广告管理',
    type: 1,
    url: 'layout/Layout',
    hidden: false,
    noCache: false
  },
  {
    id: 48,
    parentId: 47,
    icon: 'form',
    path: 'banner',
    title: '广告管理',
    type: 1,
    url: '/bannerManagement/banner/banner',
    hidden: false,
    noCache: false
  }
]

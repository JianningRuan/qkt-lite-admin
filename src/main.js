import Vue from 'vue'
import 'babel-polyfill'
import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import '@/styles/index.scss' // global css

import App from './App'
import router from './router'
import store from './store'

import api from './api/index'

import VueImageSwipe from 'vue-image-swipe'
import 'vue-image-swipe/dist/vue-image-swipe.css'

import '@/icons' // icon
import '@/permission' // permission control

import * as filters from './filters'
Vue.prototype.$api = api
Vue.use(VueImageSwipe) // global filters

Vue.use(ElementUI)

// register global utility filters.
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})

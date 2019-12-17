<template>
  <el-scrollbar wrap-class="scrollbar-wrapper">
    <el-menu
      mode="vertical"
      :show-timeout="200"
      :default-active="$route.path"
      :collapse="isCollapse"
      background-color="#304156"
      text-color="#bfcbd9"
      active-text-color="#409EFF"
      @open="handleOpen"
      @close="handleClose"
    >
      <sidebar-item v-for="route in permission_routers" :key="route.name" :item="route" :base-path="route.path" />
    </el-menu>
  </el-scrollbar>
</template>

<script>
// import router from './../../../../router'
// import store from './../../../../store'
import { mapGetters } from 'vuex'
import SidebarItem from './SidebarItem'

export default {
  components: { SidebarItem },
  computed: {
    ...mapGetters([
      'permission_routers',
      'addRouters',
      'sidebar'
    ]),
    isCollapse () {
      return !this.sidebar.opened
    }
  },
  watch: {},
  mounted () {},
  methods: {
    handleOpen (key, keyPath) {},
    handleClose (key, keyPath) {}
  }
}
</script>

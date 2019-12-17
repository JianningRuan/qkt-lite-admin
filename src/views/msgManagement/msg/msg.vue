<template>
  <div v-loading="fullScreenLoading" class="app-container"></div>
</template>

<script>
  import Pagination from '@/components/Pagination' // 分页
  import { opaMixin } from '../../../utils/mixins'
  export default {
    name: 'msg',
    mixins: [opaMixin],
    data() {
      return {
        fullScreenLoading: false
      }
    },
    components: { Pagination },
    created() {
    },
    mounted() {
    },
    activated() {
    },
    destroyed() {
    },
    watch: {},
    computed: {},
    filters: {},
    methods: {}
  }
</script>

<style scoped></style>

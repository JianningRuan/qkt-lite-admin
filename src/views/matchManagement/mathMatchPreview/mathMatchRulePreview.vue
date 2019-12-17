<template>
  <div v-loading="fullScreenLoading" class="main-theme" :class="match.theme + '-theme'">
    <div class="rule">
      <div class="banner">
        <img src="@/assets/images/rule/banner.png">
      </div>
      <nav>
        <a :class="tabIndex === 1 ? 'router-link-active': ''" @click="showTab(1)" />
        <a :class="tabIndex === 2 ? 'router-link-active': ''" @click="showTab(2)" />
      </nav>
      <div v-show="tabIndex === 1" class="rule-index">
        <div class="rule-msg" v-html="match.activityRule" />
        <!--<img src="@/assets/images/rule/rule_01.png">
        <img src="@/assets/images/rule/rule_02.png">
        <img src="@/assets/images/rule/rule_03.png">
        <img src="@/assets/images/rule/rule_04.png">
        <img src="@/assets/images/rule/rule_05.png">
        <img src="@/assets/images/rule/rule_06.png">-->
      </div>
      <div v-show="tabIndex === 2" class="rule-award">
        <div class="rule-award-msg" v-html="match.awardRule" />
        <!--<img src="@/assets/images/rule/prize_01.png">
        <img src="@/assets/images/rule/prize_02.png">
        <img src="@/assets/images/rule/prize_03.png">-->
      </div>
      <div class="indicate text-center">
        <div>活动最终解释权由全课通所有</div>
        <div>客服咨询：19806817236</div>
      </div>
    </div>
  </div>
</template>

<script>
import { opaMixin } from '../../../utils/mixins'
export default {
  name: 'MathMatchRulePreview',
  components: {},
  filters: {},
  mixins: [opaMixin],
  data () {
    return {
      fullScreenLoading: false,
      id: '',
      tabIndex: 1,
      match: {
        id: 0,
        title: '',
        theme: 'default',
        content: '', // 大赛简介
        activityRule: '', // 大赛规则
        awardRule: '', // 评奖规则
        desc: '', // 大赛流程描述
        beginTime: '',
        endTime: '',
        banner: '',
        url: ''
      }
    }
  },
  computed: {},
  watch: {},
  async created () {
    this.id = this.$route.params.id
    await this.getOpaList()
    // 获取比赛信息
    await this.getMatchInfo()
  },
  mounted () {
  },
  activated () {
  },
  destroyed () {
  },
  methods: {
    showTab (val) {
      this.tabIndex = val
    },
    // 获取比赛信息
    async getMatchInfo () {
      this.fullScreenLoading = true
      const matchRes = await this.$api.match.getMatchDetail({ id: this.id })
      if (matchRes && matchRes.rcode === 300) {
        this.match = matchRes.data
      }
      this.fullScreenLoading = false
    }
  }
}
</script>

<style lang="scss" scoped src="./mathMatchRulePreview.scss"></style>
<style scoped lang="scss" src="./../../../assets/themes/default-theme.scss"></style>

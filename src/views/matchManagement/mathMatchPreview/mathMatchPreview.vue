<template>
  <div v-loading="fullScreenLoading" class="main-theme" :class="match.theme + '-theme'">
    <div class="home" :class="{'flex flex-v':tabActive!==0}">
      <div class="banner">
        <img :src="match.banner">
      </div>
      <div class="nav">
        <a :class="{'active':tabActive===0}" />
        <a :class="{'active':tabActive===1}" />
        <a :class="{'active':tabActive===2}" />
        <a :class="{'active':tabActive===3}" />
      </div>
      <!--index-->
      <template>
        <div class="home-index">
          <div class="dsjj" v-html="match.content" />
          <div class="hdlc">
            <div v-if="levelList" class="tips">
              {{ match.title }}分为
              <template v-for="(level,index) in levelList">
                <span v-if="index!=(levelList.length-1)">{{ level.name }}<span v-if="index!=(levelList.length-2)">、</span></span>
                <span v-else>和{{ level.name }}</span>
              </template>
              {{ levelList.length===1?'一':levelList.length===2?'二':levelList.length===3?'三':levelList.length===4?'四':levelList.length===5?'五':'N个' }}
              个阶段进行
            </div>
            <div class="time-list">
              <div v-for="level in levelList" class="time-item flex flex-align-center">
                <div class="key">
                  {{ level.name }}时间:
                </div>
                <div class="val flex1">
                  {{ level.startDate | dateFormat('MM月DD日') }}--{{ level.endDate | dateFormat('MM月DD日') }}({{ level.day }}天)
                </div>
              </div>
            </div>
          </div>
          <div class="jpsz">
            <div class="jpsz-list flex">
              <div v-for="(prize,index) in prizeList" class="jpsz-item flex1">
                <div class="cover">
                  <img :src="prize.pic">
                  <div class="tag">
                    {{ index+1 }}名
                  </div>
                </div>
                <div class="name">
                  {{ prize.name }}
                </div>
                <div class="prize-name">
                  {{ prize.awardName }}
                </div>
              </div>
            </div>
          </div>
          <div class="pre flex flex-align-center">
            <span class="pre-title">{{ currentLevel.name }}</span>
            <div class="pre-warp">
              <div class="drsc">
                <span>{{ currentLevel.name }}:</span>以班级为单位进行比赛，共50题，成绩≥85分的同学晋级复赛。
              </div>
              <div class="tips">
                {{ currentLevel.name }}赛区开始倒计时：
              </div>
              <div class="countdown">
                <span v-for="(item,index) in countdown.day" :key="index+'day'" class="countdown-item">{{ item }}</span>
                <span>天</span>
                <span v-for="(item,index) in countdown.hours" :key="index+'hours'" class="countdown-item">{{ item }}</span>
                <span>:</span>
                <span v-for="(item,index) in countdown.min" :key="index+'min'" class="countdown-item">{{ item }}</span>
                <span>:</span>
                <span v-for="(item,index) in countdown.second" :key="index+'second'" class="countdown-item">{{ item }}</span>
              </div>
              <a class="operate">
                <!--初赛-->
                <template>进入初赛</template>
                <img class="hand" src="./../../../assets/images/home/hand.png">
              </a>
            </div>
          </div>
        </div>
      </template>
      <!--<div class="my-rank flex flex-align-center">
        <div class="my-rank-item flex1 text-center">我的最高分:<span class="val"><span class="yel">96</span>分</span></div>
        <div class="my-rank-item flex1 text-center">班级排名:<span class="val">第<span class="yel">96</span>名</span></div>
        <div class="my-rank-item flex1 text-center">初赛排名:<span class="val">第<span class="yel">96</span>名</span></div>
      </div>-->
      <div class="fixed-nav">
        <a class="fixed-nav-item">
          <img src="@/assets/images/home/home-icon.png">
        </a>
        <a class="fixed-nav-item" @click="goMatchRulePreview">
          <img src="@/assets/images/home/rule-icon.png">
        </a>
        <a class="fixed-nav-item">
          <img src="@/assets/images/home/share-icon.png">
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { opaMixin } from '../../../utils/mixins'
export default {
  name: 'MathMatchPreview',
  components: {},
  filters: {},
  mixins: [opaMixin],
  data () {
    return {
      id: '',
      title: '',
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
      },
      levelList: [],
      currentLevel: {},
      zoneId: '',
      prizeList: [],
      fullScreenLoading: false,

      tabActive: 0,
      type: 1,
      countdown: {
        day: [0, 1],
        hours: [0, 1],
        min: [0, 1],
        second: [0, 1]
      },
      countdownDate: ''
    }
  },
  computed: {},
  watch: {},
  async created () {
    this.id = this.$route.params.id
    // this.title = this.$route.params.title;
    await this.getOpaList()
    // 获取比赛信息
    await this.getMatchInfo()
    // 获取比赛场次信息
    await this.getMatchLevel()
    // 获取比赛奖品信息
    await this.getMatchPrize()

    /* 倒计时 */
    this.setCountDown()
    setInterval(() => {
      const now = dayjs()
      if (this.countdownDate !== '' && now > dayjs(this.countdownDate)) {
        // this.$router.go(0);
      } else {
        this.setCountDown()
      }
    }, 1000)
  },
  mounted () {
  },
  activated () {
  },
  destroyed () {
  },
  methods: {
    // 设置倒计时
    setCountDown () {
      const now = dayjs()
      let startDate
      if (now > dayjs(this.currentLevel.startTime)) {
        /* 已经开始 倒计时为结束时间 */
        startDate = this.currentLevel.endDate
        this.countdownDate = this.currentLevel.endTime
      } else {
        /* 未开始 倒计时为初赛开始时间 */
        startDate = this.currentLevel.startTime
        this.countdownDate = this.currentLevel.startTime
      }
      startDate = dayjs(startDate)
      const day = startDate.diff(now, 'day') // 233
      if (day.toString().length > 1) {
        this.countdown.day = day.toString().split('')
      } else {
        this.countdown.day[0] = 0
        this.countdown.day[1] = day
      }
      const hours = (startDate.diff(now, 'hours') - (24 * day)) // 233
      if (hours.toString().length > 1) {
        this.countdown.hours = hours.toString().split('')
      } else {
        this.countdown.hours[0] = 0
        this.countdown.hours[1] = hours
      }
      const min = (startDate.diff(now, 'minute') - ((24 * day + hours) * 60)) // 233
      if (min.toString().length > 1) {
        this.countdown.min = min.toString().split('')
      } else {
        this.countdown.min[0] = 0
        this.countdown.min[1] = min
      }
      const second = (startDate.diff(now, 'second') - (((24 * day + hours) * 60 + min) * 60)) // 233
      if (second.toString().length > 1) {
        this.countdown.second = second.toString().split('')
      } else {
        this.countdown.second[0] = 0
        this.countdown.second[1] = second
      }
    },
    // 获取比赛信息
    async getMatchInfo () {
      this.fullScreenLoading = true
      const matchRes = await this.$api.match.getMatchDetail({ id: this.id })
      if (matchRes && matchRes.rcode === 300) {
        this.match = matchRes.data
      }
      this.fullScreenLoading = false
    },
    // 获取比赛场次信息
    async getMatchLevel () {
      const matchLevRes = await this.$api.match.getLevelList({ matchId: this.id })
      if (matchLevRes && matchLevRes.rcode === 300) {
        if (matchLevRes.data.levelList.length > 0) {
          for (const item of matchLevRes.data.levelList) {
            const level = await this.$api.match.getZoneList({ levelId: item.id })
            const levelItem = level.data.zoneList[0]
            this.zoneId = levelItem.id
            this.currentLevel = levelItem
            // 设置每个场次的天数
            item.startDate = levelItem.startTime
            item.endDate = levelItem.endTime
            item.day = dayjs(levelItem.endTime).diff(dayjs(levelItem.startTime), 'day')
          }
        }
        this.levelList = matchLevRes.data.levelList
      }
    },
    // 获取比赛奖品信息
    async getMatchPrize () {
      const prizeRes = await this.$api.match.getZonPrizeList({ zoneId: this.zoneId })
      if (prizeRes && prizeRes.rcode === 300) {
        this.prizeList = prizeRes.data.prizeList
      }
    },
    goMatchRulePreview () {
      this.$router.push({
        path: `/matchManagement/mathMatchRulePreview/${this.id}`
      })
    }
  }
}
</script>
<style scoped lang="scss" src="./mathMatchPreview.scss"></style>
<style scoped lang="scss" src="./../../../assets/themes/default-theme.scss"></style>

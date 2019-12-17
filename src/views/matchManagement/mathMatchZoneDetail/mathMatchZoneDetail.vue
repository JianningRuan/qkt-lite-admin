<template>
  <div v-loading="fullScreenLoading" class="app-container">
    <el-card shadow="never">
      <div slot="header">
        赛区资料
      </div>
      <el-row type="flex" :gutter="20">
        <el-col :span="3">
          <div class="grid-content grid-content-title">
            赛区名称：
          </div>
        </el-col>
        <el-col :span="9">
          <div class="grid-content">
            {{ zoneData.name }}
          </div>
        </el-col>
        <el-col :span="3">
          <div class="grid-content grid-content-title">
            答题时间：
          </div>
        </el-col>
        <el-col :span="9">
          <div class="grid-content">
            {{ zoneData.answerDuration }}秒
          </div>
        </el-col>
      </el-row>
      <el-row type="flex" :gutter="20">
        <el-col :span="3">
          <div class="grid-content grid-content-title">
            开始时间：
          </div>
        </el-col>
        <el-col :span="9">
          <div class="grid-content">
            {{ zoneData.startTime | parseTime('{y}-{m}-{d}') }}
          </div>
        </el-col>
        <el-col :span="3">
          <div class="grid-content grid-content-title">
            结束时间：
          </div>
        </el-col>
        <el-col :span="9">
          <div class="grid-content">
            {{ zoneData.endTime | parseTime('{y}-{m}-{d}') }}
          </div>
        </el-col>
      </el-row>
      <el-row type="flex" :gutter="20">
        <el-col :span="3">
          <div class="grid-content grid-content-title">
            获奖单位：
          </div>
        </el-col>
        <el-col :span="9">
          <div v-if="zoneData && zoneData.awardsType" class="grid-content">
            {{ typeOptions[zoneData.awardsType - 1].label }}
          </div>
        </el-col>
        <el-col :span="3">
          <div class="grid-content grid-content-title">
            晋级/获奖人数：
          </div>
        </el-col>
        <el-col :span="9">
          <div class="grid-content">
            {{ zoneData.successCount }}
          </div>
        </el-col>
      </el-row>
      <el-row type="flex" :gutter="20">
        <el-col :span="3">
          <div class="grid-content grid-content-title">
            可挑战次数：
          </div>
        </el-col>
        <el-col :span="9">
          <div class="grid-content">
            {{ zoneData.challengeCount }}
          </div>
        </el-col>

        <el-col :span="3">
          <div class="grid-content grid-content-title">
            额外增加的挑战次数：
          </div>
        </el-col>
        <el-col :span="9">
          <div class="grid-content">
            {{ zoneData.extraChallenge }}
          </div>
        </el-col>
      </el-row>
      <el-row type="flex" :gutter="20">
        <el-col :span="3">
          <div class="grid-content grid-content-title">
            是否发送晋级短信：
          </div>
        </el-col>
        <el-col :span="9">
          <div class="grid-content">
            {{ zoneData.sendMessage ? '是' : '否' }}
          </div>
        </el-col>
        <el-col :span="3">
          <div class="grid-content grid-content-title">
            是否发送晋级公众号消息：
          </div>
        </el-col>
        <el-col :span="9">
          <div class="grid-content">
            {{ zoneData.sendWechat ? '是' : '否' }}
          </div>
        </el-col>
      </el-row>
      <el-row type="flex" :gutter="20">
        <el-col :span="3">
          <div class="grid-content grid-content-title">
            赛区描述：
          </div>
        </el-col>
        <el-col :span="21">
          <div class="grid-content">
            {{ zoneData.desc }}
          </div>
        </el-col>
      </el-row>
      <el-row type="flex" :gutter="20">
        <el-col :span="3">
          <div class="grid-content grid-content-title">
            参数资格说明：
          </div>
        </el-col>
        <el-col :span="21">
          <div class="grid-content">
            {{ zoneData.qualification }}
          </div>
        </el-col>
      </el-row>
    </el-card>

    <el-tabs v-model="activeName" type="card" class="mt-20">
      <el-tab-pane label="年级组" name="first">
        <el-card>
          <div slot="header" class="flex flex-pack-justify flex-align-center">
            <span class="flex1">年级组</span>
            <el-button type="primary" size="mini" :disabled="opaList.indexOf('add') === -1 ? true : false" @click="handleCreateGroup">
              新增年级组
            </el-button>
          </div>
          <el-table stripe :data="groupList" tooltip-effect="dark" style="width: 100%">
            <el-table-column label="年级组" prop="groupName" />
            <el-table-column label="年级组所含年级" prop="gradeOption" :formatter="groupFormatter" />
            <el-table-column label="操作" width="280" align="center">
              <template slot-scope="scope">
                <!--<el-button size="mini" :disabled="opaList.indexOf('edit') === -1 ? true : false" @click="handleEditGroup(scope.$index, scope.row)">
                  编辑
                </el-button>-->
                <el-button size="mini" type="danger" :disabled="opaList.indexOf('delete') === -1 ? true : false" @click="handleDeleteGroup(scope.$index, scope.row)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>
      <el-tab-pane label="题目" name="second">
        <el-card>
          <div slot="header" class="flex flex-pack-justify flex-align-center">
            <span class="flex1">题目</span>
            <el-button type="primary" size="mini" :disabled="opaList.indexOf('add') === -1 ? true : false" @click="handleCreateQuestion">
              新增题目
            </el-button>
          </div>
          <el-table ref="questionTable" stripe :data="questionList" tooltip-effect="dark" style="width: 100%">
            <el-table-column label="年级" prop="grade" :formatter="gradeFormatter" />
            <el-table-column label="题目数量" prop="count" />
            <el-table-column label="每题分值" prop="score" />
            <el-table-column label="易中难各占比例" prop="percent" />
            <el-table-column label="高年级题目占比" prop="heightGradePercent" :formatter="heightGradeFormatter" />
            <el-table-column label="操作" width="280" align="center">
              <template slot-scope="scope">
                <el-button size="mini" :disabled="opaList.indexOf('edit') === -1 ? true : false" @click="handleEditQuestion(scope.$index, scope.row)">
                  编辑
                </el-button>
                <el-button size="mini" type="danger" :disabled="opaList.indexOf('delete') === -1 ? true : false" @click="handleDeleteQuestion(scope.$index, scope.row)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>
      <el-tab-pane label="区域/学校" name="third">
        <el-row :gutter="40">
          <el-col :span="12">
            <el-card shadow="never">
              <div slot="header" class="flex flex-pack-justify flex-align-center">
                <span class="flex1">区域</span>
                <el-button type="primary" size="mini" :disabled="opaList.indexOf('add') === -1 ? true : false" @click="handleCreateArea">
                  添加区域
                </el-button>
              </div>
              <el-table ref="areaTable" stripe :data="areaList" tooltip-effect="dark" max-height="500" style="width: 100%">
                <el-table-column prop="name" label="区域" />
                <el-table-column label="操作" align="center">
                  <template slot-scope="scope">
                    <el-button size="mini" type="danger" :disabled="opaList.indexOf('delete') === -1 ? true : false" @click="handleDeleteArea(scope.$index, scope.row)">
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card shadow="never">
              <div slot="header" class="flex flex-pack-justify flex-align-center">
                <span class="flex1">学校</span>
                <el-button type="primary" size="mini" :disabled="opaList.indexOf('add') === -1 ? true : false" @click="handleCreateSchool">
                  添加学校
                </el-button>
              </div>
              <el-table ref="schoolTable" stripe :data="schoolList" tooltip-effect="dark" max-height="500" style="width: 100%">
                <el-table-column prop="name" label="学校" />
                <el-table-column label="操作" align="center">
                  <template slot-scope="scope">
                    <el-button size="mini" type="danger" :disabled="opaList.indexOf('delete') === -1 ? true : false" @click="handleDeleteSchool(scope.$index, scope.row)">
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>
      <el-tab-pane label="奖项" name="fourth">
        <el-card shadow="never">
          <div slot="header" class="flex flex-pack-justify flex-align-center">
            <span class="flex1">奖项</span>
            <el-button type="primary" size="mini" :disabled="opaList.indexOf('add') === -1 ? true : false" @click="handleCreatePrize">
              添加奖项
            </el-button>
          </div>
          <el-table ref="prizeTable" stripe :data="prizeList" tooltip-effect="dark" style="width: 100%">
            <el-table-column prop="orderNo" label="序号" />
            <el-table-column prop="name" label="奖项名称" />
            <el-table-column prop="count" label="获奖人数" />
            <el-table-column prop="awardName" label="奖品名称" />
            <el-table-column prop="pic" label="奖品图片">
              <template slot-scope="scope">
                <img class="prize-pic" :src="scope.row.pic" @click="preview(scope.$index)">
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center">
              <template slot-scope="scope">
                <el-button size="mini" :disabled="opaList.indexOf('edit') === -1 ? true : false" @click="handleEditPrize(scope.$index, scope.row)">
                  编辑
                </el-button>
                <el-button size="mini" type="danger" :disabled="opaList.indexOf('delete') === -1 ? true : false" @click="handleDeletePrize(scope.$index, scope.row)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <!--创建或编辑年级组弹窗-->
    <el-dialog :title="textMap[dialogGroupStatus]" :visible.sync="dialogGroupFormVisible" width="700px" @close="cancelGroupData">
      <el-form ref="groupForm" :model="groupTemp" :rules="groupRules" label-position="left" label-width="120px" style="margin-left:50px; margin-right: 50px;">
        <el-form-item label="年级组名称" prop="groupName">
          <el-input v-model="groupTemp.groupName" type="text" placeholder="年级组名称" maxlength="50" show-word-limit />
        </el-form-item>
        <el-form-item label="年级范围" prop="gradeOption">
          <el-select v-model="groupTemp.gradeOption" multiple placeholder="请选择">
            <el-option
              v-for="item in gradeOption"
              :key="item.value"
              :label="item.label"
              :value="item.value"
              :disabled="item.disabled"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelGroupData">
          取消
        </el-button>
        <el-button type="primary" @click="dialogGroupStatus==='create'?createGroupData():updateGroupData()">
          确定
        </el-button>
      </div>
    </el-dialog>
    <!--创建或编辑年级组弹窗-end-->
    <!--创建或编辑题目弹窗-->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="700px" @close="cancelData">
      <el-form ref="questionForm" :model="questionTemp" :rules="questionRules" label-position="left" label-width="120px" style="margin-left:50px; margin-right: 50px;">
        <el-form-item label="年级" prop="grade">
          <el-select v-model="questionTemp.grade" placeholder="请选择">
            <el-option
              v-for="item in gradeList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="题目数量" prop="count">
          <el-input v-model="questionTemp.count" type="number" placeholder="题目数量" />
        </el-form-item>
        <el-form-item label="每题分值" prop="score">
          <el-input v-model="questionTemp.score" type="number" placeholder="每题分值" />
        </el-form-item>
        <el-form-item label="易中难各占比例" prop="percent">
          <el-input v-model="questionTemp.percent" placeholder="易中难各占比例" />
          <p class="tips">
            (提示：逗号隔开,默认百分比。例子：20,30,50)
          </p>
        </el-form-item>
        <el-form-item label="高年级题目占比" prop="heightGradePercent">
          <el-input v-model="questionTemp.heightGradePercent" type="number" placeholder="高年级题目占比" />
          <p class="tips">
            (提示：选填，默认百分百，填数字。例子：100)
          </p>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelData">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          确定
        </el-button>
      </div>
    </el-dialog>
    <!--创建或编辑题目弹窗-end-->

    <!--添加区域弹窗-->
    <el-dialog title="添加区域" :visible.sync="dialogAreaFormVisible" width="700px" @close="cancelAreaData">
      <div v-loading="areaLoading" style="max-height: 400px; overflow: auto;">
        <!--<el-tree
          ref="areaTree"
          :data="canSelectAreaList"
          show-checkbox
          check-strictly
          node-key="id"
          :props="defaultProps">
        </el-tree>-->

        <el-tree
          ref="areaTree"
          :data="canSelectAreaList"
          :props="props"
          lazy
          node-key="id"
          :filter-node-method="filterNode"
          show-checkbox
          check-strictly
          :load="loadNode"
          :expand-on-click-node="false"
          @check-change="handleNodeAreaClick"
        />
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelAreaData">
          取消
        </el-button>
        <el-button type="primary" @click="updateAreaData">
          确定
        </el-button>
      </div>
    </el-dialog>
    <!--添加区域弹窗-end-->
    <!--添加学校弹窗-->
    <el-dialog title="添加学校" :visible.sync="dialogSchoolFormVisible" width="700px">
      <div style="max-height: 300px; overflow: auto; margin-bottom: 20px;">
        <el-tree
          ref="schoolAreaTree"
          :data="canSelectSchoolAreaList"
          :props="props"
          lazy
          node-key="id"
          :filter-node-method="filterNode"
          :load="loadNode"
          :expand-on-click-node="false"
          highlight-current
          @node-click="handleNodeClick"
        />
      </div>
      <!--<el-form>
        <el-form-item label="选择地区">
          <el-cascader
            placeholder="请选择地区"
            :change-on-select="true"
            :props="schoolProps"
            :options="canSelectSchoolAreaList"
            style="width: 100%;"
            @active-item-change="handleItemChange"
            @change="handleChange"
            >
          </el-cascader>
        </el-form-item>
      </el-form>-->
      <el-table ref="schoolTable" stripe border :data="canSelectSchoolList" tooltip-effect="dark" max-height="400" style="width: 100%">
        <el-table-column prop="name" label="学校名称" />
        <el-table-column label="操作" align="center">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="handleSchoolAdd(scope.$index, scope.row)">
              添加
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
    <!--添加学校弹窗-end-->

    <!--添加奖项弹窗-->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogPrizeFormVisible" width="700px" @close="cancelPrizeData">
      <el-form ref="prizeForm" :model="prizeTemp" :rules="prizeRules" label-position="left" label-width="120px" style="margin-left:50px; margin-right: 50px;">
        <el-form-item label="排序号" prop="orderNo">
          <el-input v-model="prizeTemp.orderNo" type="number" placeholder="排序号" />
        </el-form-item>
        <el-form-item label="奖项名称" prop="name">
          <el-input v-model="prizeTemp.name" placeholder="奖项名称" maxlength="30" show-word-limit />
        </el-form-item>
        <el-form-item label="获奖人数" prop="count">
          <el-input v-model="prizeTemp.count" type="number" placeholder="获奖人数" />
        </el-form-item>
        <el-form-item label="奖品名称" prop="awardName">
          <el-input v-model="prizeTemp.awardName" placeholder="奖品名称" />
        </el-form-item>
        <el-form-item label="奖品图片" prop="pic">
          <Upload v-model="prizeTemp.pic" @input="getInputFile" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelPrizeData">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createPrizeData():updatePrizeData()">
          确定
        </el-button>
      </div>
    </el-dialog>
    <!--添加奖项弹窗-end-->
  </div>
</template>

<script>
import { common } from '../../../utils'
import { opaMixin } from '../../../utils/mixins'
import Upload from '@/components/Upload/singleImage3'
export default {
  name: 'MathMatchLevelDetail',
  components: { Upload },
  filters: {
    dayFormatter (value) {
      const day = value / 1000 / 60 / 60 / 24
      return day + '天'
    }
  },
  mixins: [opaMixin],
  data () {
    const validatorNum = (rule, value, callback) => {
      if (value < 1) {
        callback(new Error('请填入大于0的数字'))
      } else {
        callback()
      }
    }
    const validatorPercent = (rule, value, callback) => {
      const percentArr = value.split(',')
      if (percentArr.length !== 3) {
        callback(new Error('请按照规范填写'))
      } else {
        const percentGrade = parseInt(percentArr[0]) + parseInt(percentArr[1]) + parseInt(percentArr[2])
        if (percentGrade === 100) {
          callback()
        } else {
          callback(new Error('易中难各占比例不符合规范'))
        }
      }
    }
    const validatorGroup = (rule, value, callback) => {
      const arrLength = value.length
      if (arrLength === 0) {
        callback(new Error('请选择年级'))
      } else {
        callback()
      }
    }
    return {
      fullScreenLoading: false,
      images: [],
      id: '',
      levelId: '',
      title: '',
      zoneData: {},
      activeName: 'first',
      typeOptions: [{
        value: 1,
        label: '班级'
      }, {
        value: 2,
        label: '年级'
      }, {
        value: 3,
        label: '年级组'
      }],

      gradeOption: [
        { value: 1, label: '一年级' },
        { value: 2, label: '二年级' },
        { value: 3, label: '三年级' },
        { value: 4, label: '四年级' },
        { value: 5, label: '五年级' },
        { value: 6, label: '六年级' },
        { value: 7, label: '七年级' },
        { value: 8, label: '八年级' },
        { value: 9, label: '九年级' }
      ],
      groupList: [],
      groupTemp: {
        id: 0,
        zoneId: '',
        groupName: '',
        gradeOption: [],
        oriGradeOption: []
      },
      dialogGroupStatus: '',
      dialogGroupFormVisible: false,
      groupRules: {
        groupName: [
          { required: true, message: '年级组名称不能为空', trigger: 'blur' }
        ],
        gradeOption: [
          { required: true, message: '年级范围不能为空', trigger: 'blur' },
          { trigger: 'change', validator: validatorGroup }
        ]
      },

      questionList: [], // 题目列表
      selectArr: [],
      textMap: {
        update: '编辑',
        create: '创建'
      },
      dialogStatus: '',
      dialogFormVisible: false,
      questionTemp: {
        id: '',
        zoneId: '',
        grade: '',
        count: '',
        score: '',
        percent: '',
        heightGradePercent: 100
      },
      questionRules: {
        grade: [
          { required: true, message: '年级不能为空', trigger: 'change' }
        ],
        count: [
          { required: true, message: '题目数量不能为空', trigger: 'blur' },
          { trigger: 'blur', validator: validatorNum }
        ],
        score: [
          { required: true, message: '每题分值不能为空', trigger: 'blur' },
          { trigger: 'blur', validator: validatorNum }
        ],
        percent: [
          { required: true, message: '易中难各占比例不能为空', trigger: 'blur' },
          { trigger: 'blur', validator: validatorPercent }
        ]
      },
      gradeList: common.gradeList,

      areaList: [], // 赛区区域列表
      schoolList: [], // 赛区学校列表
      dialogAreaFormVisible: false,
      areaTemp: {
        areaId: '',
        levelId: '',
        zoneId: ''
      },
      canSelectAreaList: [],
      isFirst: true, // 是否第一次调用区域列表
      node: '',
      resolve: '',
      areaLoading: false,
      props: {
        label: 'label',
        children: 'children',
        isLeaf: 'leaf'
      },
      dialogSchoolFormVisible: false,
      canSelectSchoolAreaList: [],
      schoolProps: {
        value: 'value',
        children: 'children'
      },
      canSelectSchoolList: [],

      prizeList: [], // 赛区奖项列表
      dialogPrizeFormVisible: false,
      prizeTemp: {
        id: 0,
        zoneId: '',
        orderNo: '',
        name: '',
        count: '',
        awardName: '',
        pic: ''
      },
      prizeRules: {
        orderNo: [
          { required: true, message: '排序号不能为空', trigger: 'blur' },
          { trigger: 'blur', validator: validatorNum }
        ],
        name: [
          { required: true, message: '奖项名称不能为空', trigger: 'blur' }
        ],
        count: [
          { required: true, message: '获奖人数不能为空', trigger: 'blur' },
          { trigger: 'blur', validator: validatorNum }
        ],
        awardName: [
          { required: true, message: '奖品名称不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {},
  watch: {},
  created () {
    this.id = this.$route.params.id
    this.title = this.$route.params.title
    this.levelId = this.$route.params.levelId
  },
  async mounted () {
    await this.getOpaList()
    this.$nextTick(() => {
      this.fullScreenLoading = false
      this.getZoneDetail()
      this.getZoneGroupList()
      this.getZonQuestionList()
      this.getZoneAreaList()
      this.getZonPrizeList()
    })
  },
  activated () {
  },
  destroyed () {
  },
  methods: {
    preview (index) {
      this.$imagePreview({
        images: this.images,
        index: index
      })
    },
    groupFormatter (val) {
      const group = []
      val.gradeOption.forEach((value) => {
        const grade = common.gradeList[value - 1]
        group.push(grade.label)
      })
      return group.join(', ')
    },
    gradeFormatter (val) {
      const grade = common.gradeList[val.grade - 1]
      return grade.label
    },
    heightGradeFormatter (val) {
      if (val.heightGradePercent !== undefined && val.heightGradePercent !== '') {
        return val.heightGradePercent + '%'
      } else {
        return val.heightGradePercent
      }
    },
    // 获取赛区资料
    getZoneDetail () {
      if (this.opaList.indexOf('list') === -1) {
        return
      }
      const params = {
        id: this.id
      }
      this.$api.match.getZoneDetail(params).then((res) => {
        if (res.rcode === 300) {
          this.zoneData = res.data
        }
      })
    },
    // 获取赛区年级组
    getZoneGroupList () {
      if (this.opaList.indexOf('list') === -1) {
        return
      }
      const params = {
        zoneId: this.id
      }
      this.$api.match.getZoneGroupList(params).then((res) => {
        if (res.rcode === 300) {
          this.groupList = res.data.groupList
          if (this.groupList.length !== 0) {
            this.groupList.forEach((value) => {
              value.gradeOption.forEach((item) => {
                this.gradeOption[item - 1].disabled = true
              })
            })
          }
        }
      }).catch(() => {})
    },
    // 获取赛区题目
    getZonQuestionList () {
      if (this.opaList.indexOf('list') === -1) {
        return
      }
      const params = {
        zoneId: this.id
      }
      this.$api.match.getZonQuestionList(params).then((res) => {
        if (res.rcode === 300) {
          this.questionList = res.data.questionList
        }
      })
    },
    // 获取赛区区域和学校
    getZoneAreaList () {
      if (this.opaList.indexOf('list') === -1) {
        return
      }
      const params = {
        zoneId: this.id
      }
      this.$api.match.getZoneAreaList(params).then((res) => {
        if (res.rcode === 300) {
          this.areaList = res.data.areaList
          this.schoolList = res.data.schoolList
        }
      })
    },
    // 获取赛区的奖项
    getZonPrizeList () {
      if (this.opaList.indexOf('list') === -1) {
        return
      }
      const params = {
        zoneId: this.id
      }
      this.$api.match.getZonPrizeList(params).then((res) => {
        if (res.rcode === 300) {
          const prizeList = res.data.prizeList
          this.prizeList = prizeList
          const images = []
          prizeList.forEach((value) => {
            images.push(value.pic)
          })
          this.images = images
        }
      })
    },
    // 创建新群组
    handleCreateGroup () {
      this.resetGroupTemp()
      this.dialogGroupStatus = 'create'
      this.dialogGroupFormVisible = true
      this.$nextTick(() => {
        this.$refs['groupForm'].clearValidate()
      })
    },
    // 重置年级组模板
    resetGroupTemp () {
      this.groupTemp = {
        id: 0,
        zoneId: '',
        groupName: '',
        gradeOption: [],
        oriGradeOption: []
      }
    },
    // 创建题目
    handleCreateQuestion () {
      /* if (this.opaList.indexOf('add') === -1) { // 权限
          return
        } */
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['questionForm'].clearValidate()
      })
    },
    // 重置模板
    resetTemp () {
      this.questionTemp = {
        id: '',
        zoneId: '',
        grade: '',
        count: '',
        score: '',
        percent: '',
        heightGradePercent: 100
      }
    },
    // 编辑年级组
    handleEditGroup (index, row) {
      this.groupTemp = Object.assign({}, this.groupTemp, row) // copy obj
      this.dialogGroupStatus = 'update'
      this.dialogGroupFormVisible = true
      this.$nextTick(() => {
        this.$refs['groupForm'].clearValidate()
      })
      this.groupTemp.gradeOption.forEach((value) => {
        this.gradeOption[value - 1].disabled = false
      })
    },
    // 删除年级组
    handleDeleteGroup (index, row) {
      this.$confirm('删除该年级组，是否继续？', '提示', {
        type: 'warning'
      }).then(() => {
        this.delZoneGroup(row.id).then((res) => {
          if (res.rcode === 300) {
            this.groupList.splice(index, 1)
            row.gradeOption.forEach(value => {
              this.gradeOption[value - 1].disabled = false
            })
          } else {
            // 提示错误
            this.$message.error(res.message)
          }
        }).catch((err) => {})
      }).catch((err) => {})
    },
    async delZoneGroup (id) {
      const params = {
        id
      }
      return await this.$api.match.delZoneGroup(params)
    },
    // 确认创建年级组
    createGroupData () {
      this.$refs['groupForm'].validate((valid) => {
        if (valid) {
          this.groupTemp.zoneId = this.id
          this.$api.match.updateGroup(this.groupTemp).then((res) => {
            if (res.rcode === 300) {
              this.dialogGroupFormVisible = false
              this.$notify({
                title: '成功',
                message: '创建成功',
                type: 'success',
                duration: 2000
              })
              this.getZoneGroupList()
            } else {
              // 错误提示
            }
          }).catch(() => {})
        }
      })
    },
    // 确认更新年级组
    updateGroupData () {
      this.$refs['groupForm'].validate((valid) => { // 检查rule
        if (valid) {
          this.groupTemp.zoneId = this.id
          this.groupTemp.oriGradeOption = this.groupTemp.gradeOption
          const tempData = Object.assign({}, this.groupTemp)
          this.$api.match.updateGroup(this.groupTemp).then((res) => {
            if (res.rcode === 300) {
              for (const v of this.groupList) {
                if (v.id === tempData.id) {
                  const index = this.groupList.indexOf(v)
                  this.groupList.splice(index, 1, this.groupTemp)
                  break
                }
              }
              this.groupTemp.gradeOption.forEach((value) => {
                this.gradeOption[value - 1].disabled = true
              })
              this.dialogGroupFormVisible = false
              this.$notify({
                title: '成功',
                message: '更新成功',
                type: 'success',
                duration: 2000
              })
            } else {
              // 失败提示
              this.$message.error(res.message)
            }
          }).catch((err) => {})
        }
      })
    },
    //
    cancelGroupData () {
      this.dialogGroupFormVisible = false
      this.groupTemp.oriGradeOption.forEach((value) => {
        this.gradeOption[value - 1].disabled = true
      })
    },
    // 删除题目
    async delZoneQuestion (ids) {
      const params = {
        id: ids
      }
      return await this.$api.match.delZoneQuestion(params)
    },
    // 进行编辑
    handleEditQuestion (index, row) {
      this.questionTemp = Object.assign({}, this.questionTemp, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['questionForm'].clearValidate()
      })
    },
    // 单项删除题目
    handleDeleteQuestion (index, row) {
      this.$confirm('删除该题目，是否继续？', '提示', {
        type: 'warning'
      }).then(() => {
        this.delZoneQuestion(row.id).then((res) => {
          if (res.rcode === 300) {
            this.questionList.splice(index, 1)
          } else {
            // 提示错误
            this.$message.error(res.message)
          }
        }).catch((err) => {})
      }).catch((err) => {})
    },
    cancelData () {
      this.dialogFormVisible = false
    },
    // 确认新建题目
    createData () {
      this.$refs['questionForm'].validate((valid) => {
        if (valid) {
          this.questionTemp.zoneId = this.id
          this.$api.match.updateQuestion(this.questionTemp).then((res) => {
            if (res.rcode === 300) {
              this.dialogFormVisible = false
              this.$notify({
                title: '成功',
                message: '创建成功',
                type: 'success',
                duration: 2000
              })
              this.getZonQuestionList()
            } else {
              // 错误提示
            }
          }).catch(() => {})
        }
      })
    },
    // 确认更新题目
    updateData () {
      this.$refs['questionForm'].validate((valid) => { // 检查rule
        if (valid) {
          this.questionTemp.zoneId = this.id
          const tempData = Object.assign({}, this.questionTemp)
          this.$api.match.updateQuestion(this.questionTemp).then((res) => {
            if (res.rcode === 300) {
              for (const v of this.questionList) {
                if (v.id === tempData.id) {
                  const index = this.questionList.indexOf(v)
                  this.questionList.splice(index, 1, this.questionTemp)
                  break
                }
              }
              this.dialogFormVisible = false
              this.$notify({
                title: '成功',
                message: '更新成功',
                type: 'success',
                duration: 2000
              })
            } else {
              // 失败提示
              this.$message.error(res.message)
            }
          }).catch((err) => {})
        }
      })
    },
    // 添加区域
    handleCreateArea () {
      this.dialogAreaFormVisible = true
      // this.getSelectArea(1);
    },
    // 懒加载区域
    loadNode (node, resolve) {
      if (this.isFirst) {
        this.node = node
        this.resolve = resolve
        this.areaLoading = true
        this.isFirst = false
      }
      /* this.$nextTick(()=>{
          if (this.opaList.indexOf('list') === -1) { // 权限
            return false
          }
        }); */
      let params
      if (node.level === 0) {
        params = {
          parentId: 0
        }
      } else {
        params = {
          parentId: node.data.id
        }
      }
      this.$api.address.getAreaList(params).then((res) => {
        if (res.rcode === 300) {
          const areaList = res.data.areaList
          areaList.forEach((value) => {
            value.label = value.name
          })
          this.areaLoading = false
          return resolve(areaList)
        }
      })
    },
    filterNode (value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    },
    // 添加学校
    handleCreateSchool () {
      this.dialogSchoolFormVisible = true
      /* let params = {
          parentId: 0
        };
        this.$api.address.getAreaList(params).then((res)=>{
          if (res.rcode === 300) {
            let areaList = res.data.areaList;
            areaList.forEach((value)=>{
              value.label = value.name;
              value.value = value.id;
              value.children = [];
            });
            console.log(areaList)
            this.canSelectSchoolAreaList = areaList
          }
        }) */
    },
    handleDeleteArea (index, row) {
      this.$confirm('删除该地区，是否继续？', '提示', {
        type: 'warning'
      }).then(() => {
        const params = {
          cityCode: row.cityCode,
          zoneId: parseInt(this.id)
        }
        this.$api.match.delZoneArea(params).then((res) => {
          if (res.rcode === 300) {
            this.areaList.splice(index, 1)
          } else {
            // 提示错误
            this.$message.error(res.message)
          }
        }).catch((err) => {

        })
      }).catch((err) => {})
    },
    // 删除学校
    handleDeleteSchool (index, row) {
      this.$confirm('删除该地区，是否继续？', '提示', {
        type: 'warning'
      }).then(() => {
        const params = {
          schoolId: row.schoolId,
          zoneId: parseInt(this.id)
        }
        this.$api.match.delZoneSchool(params).then((res) => {
          if (res.rcode === 300) {
            this.schoolList.splice(index, 1)
          } else {
            // 提示错误
            this.$message.error(res.message)
          }
        }).catch((err) => {

        })
      }).catch((err) => {})
    },
    handleNodeAreaClick (data, isChange, hasClickChildren) {
      if (isChange) {
        this.$refs.areaTree.setCheckedKeys([data.id])
      }
    },
    cancelAreaData () {
      this.dialogAreaFormVisible = false
      this.$refs.areaTree.setCheckedKeys([])
    },
    // 确认添加区域
    updateAreaData () {
      const keys = this.$refs.areaTree.getCheckedKeys()
      if (keys.length === 0) {
        // 请先选择要删除的项
        this.$message({
          message: '请先选择要添加的项',
          type: 'warning'
        })
        return
      }
      const params = {
        areaId: keys[0],
        levelId: parseInt(this.levelId),
        zoneId: parseInt(this.id)
      }
      this.$api.match.addZoneArea(params).then((res) => {
        if (res.rcode === 300) {
          this.dialogAreaFormVisible = false
          this.getZoneAreaList()
          this.$notify({
            title: '成功',
            message: '授权成功',
            type: 'success',
            duration: 2000
          })
        } else {
          this.dialogAreaFormVisible = false
        }
        this.$refs.areaTree.setCheckedKeys([])
      }).catch(() => {
        this.dialogAreaFormVisible = false
        this.$refs.areaTree.setCheckedKeys([])
      })
    },
    handleNodeClick (data, node, item) {
      const params = {
        areaId: data.id
      }
      this.$api.common.getSchoolByArea(params).then((res) => {
        if (res.rcode === 300) {
          const schoolList = res.data.schoolList
          schoolList.forEach((item) => {
            item.value = item.id
            item.label = item.name
          })
          this.canSelectSchoolList = schoolList
        }
      })
    },
    // 添加学校
    handleSchoolAdd (index, row) {
      this.$confirm('添加该学校，是否继续？', '提示', {
        type: 'warning'
      }).then(() => {
        const params = {
          schoolId: row.id,
          levelId: parseInt(this.levelId),
          zoneId: parseInt(this.id)
        }
        this.$api.match.addZoneArea(params).then((res) => {
          if (res.rcode === 300) {
            this.dialogSchoolFormVisible = false
            this.getZoneAreaList()
            this.$notify({
              title: '成功',
              message: '授权成功',
              type: 'success',
              duration: 2000
            })
          } else {
            // this.dialogSchoolFormVisible = false;
          }
        }).catch(() => {
          // this.dialogSchoolFormVisible = false;
        })
      })
    },
    handleItemChange (val) {
      console.log('val', val)
    },
    handleChange (value) {
      console.log('value', value)
    },
    // 添加赛区题目
    handleCreatePrize () {
      /* if (this.opaList.indexOf('add') === -1) { // 权限
          return
        } */
      this.resetPrizeTemp()
      this.dialogStatus = 'create'
      this.dialogPrizeFormVisible = true
      this.$nextTick(() => {
        this.$refs['prizeForm'].clearValidate()
      })
    },
    // 重置模板
    resetPrizeTemp () {
      this.prizeTemp = {
        id: 0,
        zoneId: '',
        orderNo: '',
        name: '',
        count: '',
        awardName: '',
        pic: ''
      }
    },
    cancelPrizeData () {
      this.dialogPrizeFormVisible = false
    },
    // 确认添加奖项
    createPrizeData () {
      this.$refs['prizeForm'].validate((valid) => {
        if (valid) {
          this.prizeTemp.zoneId = parseInt(this.id)
          this.$api.match.updatePrize(this.prizeTemp).then((res) => {
            if (res.rcode === 300) {
              this.dialogPrizeFormVisible = false
              this.$notify({
                title: '成功',
                message: '创建成功',
                type: 'success',
                duration: 2000
              })
              this.getZonPrizeList()
            } else {
              // 错误提示
            }
          }).catch(() => {})
        }
      })
    },
    // 确认更新
    updatePrizeData () {
      this.$refs['prizeForm'].validate((valid) => { // 检查rule
        if (valid) {
          this.prizeTemp.zoneId = parseInt(this.id)
          const tempData = Object.assign({}, this.prizeTemp)
          this.$api.match.updatePrize(this.prizeTemp).then((res) => {
            if (res.rcode === 300) {
              for (const v of this.prizeList) {
                if (v.id === tempData.id) {
                  const index = this.prizeList.indexOf(v)
                  this.prizeList.splice(index, 1, this.prizeTemp)
                  break
                }
              }
              this.dialogPrizeFormVisible = false
              this.$notify({
                title: '成功',
                message: '更新成功',
                type: 'success',
                duration: 2000
              })
            } else {
              // 失败提示
              this.$message.error(res.message)
            }
          }).catch((err) => {

          })
        }
      })
    },
    // 编辑奖项
    handleEditPrize (index, row) {
      this.prizeTemp = Object.assign({}, this.prizeTemp, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogPrizeFormVisible = true
      this.$nextTick(() => {
        this.$refs['prizeForm'].clearValidate()
      })
    },
    // 单项删除奖项
    handleDeletePrize (index, row) {
      this.$confirm('删除该奖项，是否继续？', '提示', {
        type: 'warning'
      }).then(() => {
        const params = {
          id: row.id
        }
        this.$api.match.delZonePrize(params).then((res) => {
          if (res.rcode === 300) {
            this.prizeList.splice(index, 1)
          } else {
            // 提示错误
            this.$message.error(res.message)
          }
        }).catch((err) => {})
      })
    },
    getInputFile (file) {
      this.prizeTemp.pic = file
    }
  }

}
</script>

<style lang="scss" scoped>
  .input-box {
    width: 140px;
  }
  .class-input-box {
    width: 100px;
  }

  .row-bg {
    background: #f2f2f2;
  }
  .grid-content {
    height: 40px;
    line-height: 40px;
    font-size: 14px;

    &.grid-content-title {
      text-align: right;
      font-weight: bold;
    }
  }

  .tips {
    color: #8492a6; font-size: 13px; line-height: 20px; word-break:break-all;
  }
  .prize-pic {
    width: 120px;
  }
</style>

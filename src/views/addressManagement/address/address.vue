<template>
  <div class="app-container">
    <el-card shadow="never" class="mb-20">
      <el-form ref="form" :inline="true" label-width="80px" size="mini">
        <el-form-item label="规范类型">
          <el-select v-model="canonical" placeholder="请选择规范类型" @change="onSearch">
            <el-option v-for="item in canonicalSearchList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="mini" @click="onSearch">
            搜索
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <div slot="header" class="flex flex-pack-justify flex-align-center">
        <span class="flex1">地区列表</span>
        <div>
          <el-button type="primary" size="mini" :disabled="opaList.indexOf('add') === -1 ? true : false" @click="handleCreate">
            新增省
          </el-button>
        </div>
      </div>
      <div v-loading="fullScreenLoading" style="width: 800px;">
        <el-tree
          ref="tree"
          :data="addressArr"
          :props="props"
          lazy
          node-key="id"
          :default-expanded-keys="defaultExpandedKeys"
          :filter-node-method="filterNode"
          :load="loadNode"
          :expand-on-click-node="false"
          @node-click="handleNodeClick"
          @node-expand="nodeExpand"
          @node-collapse="nodeCollapse"
        >
          <span slot-scope="{ node, data }" class="custom-tree-node">
            <span>{{ node.label }}</span>
            <span>
              <a v-if="data.areaType !== 3" class="adr-btn" :disabled="opaList.indexOf('add') === -1 ? true : false" @click="() => append(data)">新增</a>
              <a class="adr-btn" :disabled="opaList.indexOf('edit') === -1 ? true : false" @click="() => change(node, data)">修改</a>
              <!--<el-button v-if="data.areaType !== 3" type="text" size="small" @click="() => append(data)">新增</el-button>
              <el-button type="text" size="small" @click="() => change(node, data)">修改</el-button>-->
              <!--<el-button
                type="text"
                size="small"
                @click="() => remove(node, data)">
                删除
              </el-button>-->
            </span>
          </span>
        </el-tree>
      </div>
    </el-card>
    <!--新建或编辑弹窗-->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="500px" @close="cancelData">
      <el-form ref="dataForm" :model="temp" :rules="rules" label-position="left" label-width="80px" style="margin-left:50px; margin-right: 50px;">
        <el-form-item label="地区名称" prop="areaName">
          <el-input v-model="temp.areaName" placeholder="地区名称" class="filter-item input-box" />
        </el-form-item>
        <el-form-item label="是否规范" prop="canonical">
          <el-select v-model="temp.canonical" placeholder="请选择是否规范" class="input-box">
            <el-option v-for="item in canonicalList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
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
  </div>
</template>

<script>
import { adrOpaMixin } from '../../../utils/mixins'

export default {
  name: 'AddressList',
  components: {},
  filters: {},
  mixins: [adrOpaMixin],
  data () {
    return {
      props: {
        label: 'label',
        children: 'children',
        isLeaf: 'leaf'
      },
      addressArr: [],
      node: '',
      resolve: '',
      isFirst: true,
      defaultExpandedKeys: [],
      provinceName: '',
      fullScreenLoading: false, // 是否显示loading
      canonical: '',
      temp: {
        areaName: '',
        areaType: 1,
        canonical: true,
        id: 0,
        parentId: 0
      },
      rules: {
        areaName: [
          { required: true, message: '地区名称不能为空', trigger: 'blur' }
        ],
        canonical: [
          { required: true, message: '规范不能为空', trigger: 'change' }
        ]
      },
      canonicalSearchList: [{ value: '', label: '全部' }, { value: true, label: '规范' }, { value: false, label: '不规范' }],
      canonicalList: [{ value: true, label: '规范' }, { value: false, label: '不规范' }],
      dialogFormVisible: false, // 是否显示编辑弹层
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '创建'
      },
      currentData: ''
    }
  },
  computed: {},
  watch: {},
  created () {},
  mounted () {},
  activated () {
  },
  destroyed () {
  },
  methods: {
    filterNode (value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    },
    async getAreaList (parentId = 0) {
      const params = {
        parentId
      }
      const res = await this.$api.address.getAreaList(params)
      if (res.rcode === 300) {
        const areaList = res.data.areaList
        areaList.forEach((value) => {
          value.label = value.name
        })
        this.addressArr = areaList
      }
    },
    loadNode (node, resolve) {
      if (this.isFirst) {
        this.getOpaList()
        this.node = node
        this.resolve = resolve
        this.fullScreenLoading = true
        this.isFirst = false
      }
      this.$nextTick(() => {
        if (this.opaList.indexOf('list') === -1) { // 权限

        }
      })

      let params
      if (node.level === 0) {
        params = {
          parentId: 0,
          canonical: this.canonical
        }
      } else {
        params = {
          parentId: node.data.id,
          canonical: this.canonical
        }
      }
      this.$api.address.getAreaList(params).then((res) => {
        if (res.rcode === 300) {
          const areaList = res.data.areaList
          areaList.forEach((value) => {
            value.label = value.name
          })
          this.fullScreenLoading = false
          return resolve(areaList)
        }
      })
    },
    // 点击
    handleNodeClick (data) {},
    // 展开树触发
    nodeExpand (data) {
      const id = data.id
      if (this.defaultExpandedKeys.indexOf(id) === -1) {
        this.defaultExpandedKeys.push(id)
      }
    },
    // 关闭树触发
    nodeCollapse (data) {
      const id = data.id
      const index = this.defaultExpandedKeys.indexOf(id)
      if (index > -1) {
        this.defaultExpandedKeys.splice(index, 1)
      }
    },
    resetTemp () {
      this.temp = {
        areaName: '',
        areaType: 1,
        canonical: true,
        id: 0,
        parentId: 0
      }
    },
    // 新增
    append (data) {
      /* if (this.opaList.indexOf('add') === -1) { // 权限
        return
      } */
      this.resetTemp()
      this.currentData = data
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })

      /* this.$prompt('请输入地区名字', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(({ value }) => {
        const params = {
          areaName: value,
          areaType: data.areaType + 1,
          id: 0,
          parentId: data.id
        }
        this.$api.address.updateArea(params).then((res) => {
          if (res.rcode === 300) {
            this.$message({
              type: 'success',
              message: '新增成功'
            })
            this.node.childNodes = [] // 这里把子节点清空，是因为再次调用 loadNode 的时候会往 childNodes 里 push 节点，所以会有节点重复的情况。
            this.loadNode(this.node, this.resolve)
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '取消输入'
        })
      }) */
    },
    /* setDataToTree(treeData,pId,respData){
        for(var i=0;i<treeData.length;i++) {
          var td = treeData[i];
          if(td.id===pId) {
            treeData[i].children=treeData[i].children.concat(respData);
            return;
          }else{
            this.setDataToTree(td.children, pId, respData);
          }
        }
      }, */
    // 修改
    change (node, data) {
      /* if (this.opaList.indexOf('edit') === -1) { // 权限
       return
     } */
      this.resetTemp()
      this.currentData = data
      this.temp.areaName = this.currentData.name
      this.temp.areaType = this.currentData.areaType
      this.temp.parentId = this.currentData.parentId
      this.temp.id = this.currentData.id
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })

      /* this.$prompt('请输入地区名字', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: data.label
      }).then(({ value }) => {
        const params = {
          areaName: value,
          areaType: data.areaType,
          id: data.id,
          parentId: data.parentId
        }
        this.$api.address.updateArea(params).then((res) => {
          if (res.rcode === 300) {
            this.$message({
              type: 'success',
              message: '修改成功'
            })
            this.node.childNodes = [] // 这里把子节点清空，是因为再次调用 loadNode 的时候会往 childNodes 里 push 节点，所以会有节点重复的情况。
            this.loadNode(this.node, this.resolve)
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '取消输入'
        })
      }) */
    },
    // 新增省
    handleCreate () {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })

      /* if (this.provinceName === '') {
        // 提示空
        this.$message({
          type: 'warning',
          message: '请先输入省份名称'
        })
        return
      }
      const params = {
        areaName: this.provinceName,
        areaType: 1,
        id: 0,
        parentId: 0
      }
      this.$api.address.updateArea(params).then((res) => {
        if (res.rcode === 300) {
          this.$message({
            type: 'success',
            message: '新增成功'
          })
          this.node.childNodes = [] // 这里把子节点清空，是因为再次调用 loadNode 的时候会往 childNodes 里 push 节点，所以会有节点重复的情况。
          this.loadNode(this.node, this.resolve)
          this.provinceName = ''
        }
      }) */

      /* this.$prompt('请输入地区名字', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        }).then(({ value }) => {
          let params = {
            areaName: value,
            areaType: 1,
            id: 0,
            parentId: 0
          };
          this.$api.address.updateArea(params).then((res)=>{
            if (res.rcode === 300) {
              this.$message({
                type: 'success',
                message: '新增成功'
              });
              this.node.childNodes = []; // 这里把子节点清空，是因为再次调用 loadNode 的时候会往 childNodes 里 push 节点，所以会有节点重复的情况。
              this.loadNode(this.node, this.resolve)
            }
          });

        }).catch(() => {
          this.$message({
            type: 'info',
            message: '取消输入'
          });
        }); */
    },
    cancelData () {
      this.dialogFormVisible = false
    },
    createData () {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.areaType = this.currentData.areaType + 1 || 1
          this.temp.parentId = this.currentData.id || 0
          this.$api.address.updateArea(this.temp).then((res) => {
            if (res.rcode === 300) {
              this.dialogFormVisible = false
              this.$message({
                type: 'success',
                message: '新增成功'
              })
              this.node.childNodes = [] // 这里把子节点清空，是因为再次调用 loadNode 的时候会往 childNodes 里 push 节点，所以会有节点重复的情况。
              this.loadNode(this.node, this.resolve)
            }
          })
        }
      })
    },
    updateData () {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.areaType = this.currentData.areaType
          this.temp.parentId = this.currentData.parentId
          this.temp.id = this.currentData.id
          this.$api.address.updateArea(this.temp).then((res) => {
            if (res.rcode === 300) {
              this.dialogFormVisible = false
              this.$message({
                type: 'success',
                message: '修改成功'
              })
              this.node.childNodes = [] // 这里把子节点清空，是因为再次调用 loadNode 的时候会往 childNodes 里 push 节点，所以会有节点重复的情况。
              this.loadNode(this.node, this.resolve)
            }
          })
        }
      })
    },
    onSearch () {
      this.node.childNodes = [] // 这里把子节点清空，是因为再次调用 loadNode 的时候会往 childNodes 里 push 节点，所以会有节点重复的情况。
      this.loadNode(this.node, this.resolve)
    }
  }
}
</script>

<style lang="scss" scoped>
  .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 16px;
    padding-right: 8px;
  }
  .adr-btn {
    font-size: 15px;
    color: #409EFF;
    padding-left: 15px;
    padding-right: 15px;
  }
</style>

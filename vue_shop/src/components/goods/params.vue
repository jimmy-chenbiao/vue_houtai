<template>
  <div>
    <!--         面包屑导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
<!--    卡片视图区-->
    <el-card>
<!--      警告区-->
      <el-alert show-icon
        title="注意:只允许为第三级分类设置相关参数！"
        type="warning" :closable="false">
      </el-alert>
<!--      选择商品区域-->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类:</span>
<!--          选择商品分类的级联选择框-->
          <el-cascader v-model="selectedCateKeys" :options="catelist" :props="cateProps" expandTrigger="hover" @change="handleChange">
          </el-cascader>
        </el-col>
      </el-row>
<!--       tab页签区域-->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
<!--        添加动态参数的面板-->
        <el-tab-pane label="动态参数" name="many">
          <el-button size="mini" type="primary" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加参数</el-button>
<!--          动态参数表格-->
          <el-table :data="manyTableData" border stripe>
<!--                 这是展开行-->
                 <el-table-column type="expand">
                        <template slot-scope="scope">
<!--                          循环渲染tag标签-->
                           <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i, scope.row)">
                                 {{item}}
                           </el-tag>
<!--                          这是输入文本框-->
                          <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small"
                                    @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)">
                          </el-input>
<!--                          添加按钮-->
                          <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                        </template>
                 </el-table-column>
<!--            索引列-->
                 <el-table-column type="index">
                 </el-table-column>
                 <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                 <el-table-column label="操作">
                   <template slot-scope="scope">
                     <el-button type="primary" icon="el-icon-edit" size="mini" @click="shouEditDialog(scope.row.attr_id)">编辑</el-button>
                     <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(scope.row.attr_id)">删除</el-button>
                   </template>
                 </el-table-column>
          </el-table>
        </el-tab-pane>
<!--        添加静态属性的面板-->
        <el-tab-pane label="静态属性" name="only">
          <el-button size="mini" type="primary" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加属性</el-button>
          <!--          静态属性表格-->
          <el-table :data="onlyTableData" border stripe>
            <!--                 这是展开行-->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!--                          循环渲染tag标签-->
                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i, scope.row)">
                  {{item}}
                </el-tag>
                <!--                          这是输入文本框-->
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small"
                          @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)">
                </el-input>
                <!--                          添加按钮-->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!--            索引列-->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="shouEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
<!--    对话框-->
    <el-dialog :title="'添加' + titleText" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addParams">确 定</el-button>
  </span>
    </el-dialog>
<!--修改参数对话框-->
    <el-dialog :title="'修改' + titleText" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px" >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editParams">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      catelist: [],
      // 级联选择框的配置对象
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 级联选择框绑定的数组
      selectedCateKeys: [],
      // 被激活的页签的名称
      activeName: 'many',
      // 动态属性的数据
      manyTableData: [],
      // 静态属性的数据
      onlyTableData: [],
      // 对话框的显示与隐藏
      addDialogVisible: false,
      // 添加参数的表单数据对象
      addForm: {},
      // 添加表单的验证规则
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      // 控制修改对话框的显示与隐藏
      editDialogVisible: false,
      editForm: {}
    }
  },
  created() {
    this.getCatrList()
  },
  methods: {
    // 获取所有商品分类列表
    async getCatrList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('获取商品分类失败')
      this.catelist = res.data
    },
    handleChange() {
      this.getParamsData()
    },
    // Tab 页签点击事件的处理函数
    handleTabClick() {
      // console.log(this.activeName)
      this.getParamsData()
    },

    // 获取参数的数据列表
    async getParamsData() {
      // console.log(this.selectedKeys)
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
      }
      // 证明选中的是三级分类
      // console.log(this.selectedCateKeys)
      // 根据所选分类的Id，和当前所处的面板，获取对应的参数
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: this.activeName } })
      if (res.meta.status !== 200) return this.$message.error('获取参数列表失败')
      // console.log(res.data)
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 控制文本框的显示与隐藏
        item.inputVisible = false
        item.inputValue = ''
      })
      console.log(res.data)
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮，添加参数
    addParams() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 201) return this.$message.error('添加参数失败')
        this.$message.success('添加参数成功')
        this.addDialogVisible = false
        this.getParamsData()
      })
    },
    // 点击按钮显示修改的对话框
    async shouEditDialog(attrId) {
      // 查询当前参数的信息
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${attrId}`, {
        params: { attr_sel: this.activeName }
      })
      if (res.meta.status !== 200) return this.$message.error('获取参数信息失败')
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 修改对话框关闭事件监听
    editDialogClosed() {
      this.$refs.editFormRules.resetFields()
    },
    // 点击按钮修改参数信息
    editParams() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
          attr_name: this.editForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 200) return this.$message.error('修改参数信息失败')
        this.$message.success('修改参数信息成功')
        this.editDialogVisible = false
        this.getParamsData()
      })
    },

    // 根据Id删除对应的参数项
    async removeParams(attrId) {
      const confirmResult = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') return this.$message.info('已取消删除')
      // 删除业务逻辑
      const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${attrId}`)
      if (res.meta.status !== 200) return this.$message.error('删除失败')
      this.$message.success('删除成功')
      this.getParamsData()
    },
    // 文本框失去焦点或摁下enter键后的触发事件
    async handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
      } else {
        row.attr_vals.push(row.inputValue.trim())
        row.inputValue = ''
        row.inputVisible = false
        // 发起请求，保存这次操作
        this.saveAttrVals(row)
      }
    },
    showInput(row) {
      row.inputVisible = true
      // 自动获取文本焦点
      // $nextTick的作用，当页面上的元素被重新渲染完成之后，才会指定回调函数中的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },

    // 将对 attr_vals 的操作，保存到数据库
    async saveAttrVals(row) {
      // 发起请求，保存这次操作
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' ')
      })
      if (res.meta.status !== 200) return this.$message.error('操作参数失败')
      this.$message.success('操作参数成功')
    },
    // 删除对应的参数和选项
    handleClose(i, row) {
      row.attr_vals.splice(i, 1)
      this.saveAttrVals(row)
    }
  },
  computed: {
    // 如果按钮需要被禁用，则返回true，否则返回false
    isBtnDisabled() {
      if (this.selectedCateKeys.length !== 3) {
        return true
      } else {
        return false
      }
    },
    // 当前选中的三级分类的Id
    cateId() {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return null
    },
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  }

}
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
}
  .el-cascader  {
    margin-left: 10px;
  }
  .el-tag {
    margin: 5px;
  }
  .input-new-tag {
    width: 100px;
  }
</style>

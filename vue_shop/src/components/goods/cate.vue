<template>
  <div>
    <!--         面包屑导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域-->
    <el-card class="box-card">
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
<!--      表格-->
      <tree-table class="tree" :data="catelist" :columns="columns" index-text="#" border
                  :selection-type="false"   :show-row-hover="false"
                  :expand-type="false" show-index>
<!--        是否有效列-->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: #55a532"></i>
          <i class="el-icon-error" v-else style="color: #bd2c00"></i>
        </template>
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" size="mini" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>
        <template slot="opt" slot-scope="scope">
          <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
          <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
        </template>
      </tree-table>
<!--      分页区域-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[2, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
<!--添加分类的对话框-->
<!--    options用来指定数据源-->
<!--    props 用来指定配置对象-->
    <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="50%"  @close="addCateDialogClose">
      <el-form :model="addCateForm" :rules="addCateRuleFormRules" ref="addCateFormRef" label-width="100px" >
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
      </el-form-item>
        <el-form-item label="父级分类:" >
            <el-cascader v-model="selectedKeys" :options="paretCateList"
                         :props="cascaderProps" expand-trigger="hover" clearable
                         @change="parentCateChanged" width="50%" >
            </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="addCateDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addCate">确 定</el-button>
  </span>
    </el-dialog>

  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      addCateDialogVisible: false,
      // 商品分类的数据列表，默认为空
      catelist: [],
      // 父级分类列表
      paretCateList: [],
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 添加分类的表单的数据对象
      addCateForm: {
        // 将要添加分类的名称
        cat_name: '',
        // 父级分类的Id（只是一个类）
        cat_pid: 0,
        // 分类的等级（相当于数组位置）
        cat_level: 0
      },
      // 选中的父级分类的id数组
      selectedKeys: [],
      // 总数据条数
      total: 0,
      // 为table指定列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 表示把当前列定义为模板列
          type: 'template',
          // 表示当前这一列使用模板名称
          template: 'isok'
        },
        {
          label: '排序',
          // 表示把当前列定义为模板列
          type: 'template',
          // 表示当前这一列使用模板名称
          template: 'order'
        },
        {
          label: '操作',
          // 表示把当前列定义为模板列
          type: 'template',
          // 表示当前这一列使用模板名称
          template: 'opt'
        }
      ],
      addCateRuleFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('获取商品分类失败')
      // console.log(res.data)
      // 数据列表赋值
      this.catelist = res.data.result
      // 数据总条数赋值
      this.total = res.data.total
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },

    // 点击按钮展示‘添加分类’对话框
    showAddCateDialog() {
      // 获取父级的展示列表
      this.getParentCateList()
      this.addCateDialogVisible = true
    },
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      if (res.meta.status !== 200) return this.$message.error('获取商品分类数据失败')
      this.paretCateList = res.data
    },
    // 选择项发生变化触发这个函数
    parentCateChanged() {
      // console.log(this.selectedKeys)
      // selectedKeys大于0 代表选中了父级分类
      if (this.selectedKeys.length > 0) {
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    // 点击按钮添加新的分类
    addCate() {
      // console.log(this.addCateForm)
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.addCateForm)
        if (res.meta.status !== 201) return this.$message.error('添加分类失败')
        this.$message.success('添加分类成功')
        // 重新加载列表
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    // 监听对话框的关闭时间，重置表单数据
    addCateDialogClose() {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    }
  }

}
</script>

<style lang="less" scoped>
.tree {
  margin-top: 15px;
}
</style>

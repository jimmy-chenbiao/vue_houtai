<template>
  <div>
    <!--         面包屑导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

<!--    卡片区域-->
    <el-card>
<!--      提示区域-->
      <el-alert title="添加商品信息" type="info" show-icon center  :closable="false">
      </el-alert>
<!--步骤条-->
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

<!--      tab栏区域-->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
      <el-tabs :tab-position="'left'"   v-model="activeIndex" :before-leave="beforeTabLeave" @tab-click="tabClicked">
        <el-tab-pane label="基本信息" name="0">
          <el-form-item label="商品名称" prop="goods_name">
            <el-input v-model="addForm.goods_name"></el-input>
          </el-form-item>
          <el-form-item label="商品价格" prop="goods_price" type="number">
            <el-input v-model="addForm.goods_price"></el-input>
          </el-form-item>
          <el-form-item label="商品重量" prop="goods_weight" type="number">
            <el-input v-model="addForm.goods_weight"></el-input>
          </el-form-item>
          <el-form-item label="商品数量" prop="goods_number" type="number">
            <el-input v-model="addForm.goods_number"></el-input>
          </el-form-item>
          <el-form-item label="商品分类" prop="goods_cat">
            <el-cascader v-model="addForm.goods_cat" :options="cateList"
                         props.expandTrigger="hover" :props="cateProps" @change="handleChange"></el-cascader>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="商品参数" name="1">
<!--          渲染表单的Item项-->
          <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
<!--            复选框组-->
            <el-checkbox-group v-model="item.attr_vals">
              <el-checkbox :label="cb" v-for="(cb, i) in item.attr_vals" :key="i" border></el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="商品属性" name="2">
          <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
            <el-input v-model="item.attr_vals"></el-input>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="商品图片" name="3">
          <el-upload
            :on-success="handleSuccess"
            :headers="headerObj"
            action="http://127.0.0.1:8888/api/private/v1/upload"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            list-type="picture">
            <el-button size="small" type="primary">点击上传</el-button>
            <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
          </el-upload>
        </el-tab-pane>
        <el-tab-pane label="商品内容" name="4">
          <quill-editor v-model="addForm.goods_introduce"></quill-editor>
          <el-button type="primary" class="bin1" @click="add">添加商品</el-button>
        </el-tab-pane>
      </el-tabs>
      </el-form>
    </el-card>

<!--    图片预览-->
    <el-dialog title="图片预览" :visible.sync="dialogVisible" width="50%" >
      <img :src="previewPath" alt="">
    </el-dialog>

  </div>
</template>

<script>
import _ from 'lodash'
export default {
  data() {
    return {
      previewPath: '',
      // 动态参数列表数据
      manyTableData: [],
      // 静态属性列表数据
      onlyTableData: [],
      cateList: [],
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      activeIndex: '0',
      // 添加商品的表单对象
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 商品所属分类数组
        goods_cat: [],
        // 图片的数组
        pics: [],
        // 商品的详情描述
        goods_introduce: '',
        attrs: []
      },
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '价格不能为空' },
          { type: 'number', message: '价格必须为数字值' }
        ],
        goods_weight: [
          { required: true, message: '重量不能为空' },
          { type: 'number', message: '重量必须为数字值' }
        ],
        goods_number: [
          { required: true, message: '数量不能为空' },
          { type: 'number', message: '数量必须为数字值' }
        ],
        cateList: [
          { required: true, message: '请输入商品分类', trigger: 'blur' }
        ]
      },
      // 图片上传组件的 headers 的请求头对象
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      dialogVisible: false
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('获取商品分类列表失败')
      this.cateList = res.data
    },
    // 级联选择器选中项变化，会触发这个函数
    handleChange() {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    beforeTabLeave(activeName, oldActiveName) {
      // activeName即将进入, oldActiveName即将离开
      if (this.addForm.goods_cat.length !== 3 && oldActiveName === '0') {
        this.$message.error('请先选中商品分类')
        return false
      }
    },
    async tabClicked() {
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: { sel: 'many' }
        })
        if (res.meta.status !== 200) return this.$message.error('获取动态参数列表失败')
        res.data.forEach(item => {
          // split 把字符串变成数组
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        this.manyTableData = res.data
      } else {
        if (this.activeIndex === '2') {
          const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
            params: { sel: 'only' }
          })
          if (res.meta.status !== 200) return this.$message.error('获取静态属性列表失败')
          this.onlyTableData = res.data
        }
      }
    },
    // 处理图片的预览效果
    handlePreview(file) {
      // console.log(file)
      this.previewPath = file.response.data.url
      this.dialogVisible = true
    },
    // 处理移除图片的操作
    handleRemove(file) {
      // console.log(file)
      const filePath = file.response.data.tmp_path
      const i = this.addForm.pics.findIndex(x => x.pic === filePath)
      this.addForm.pics.splice(i, 1)
    },
    // 监听图片上传成功的事件
    handleSuccess(response) {
      // console.log(response)
      // 1.拼接得到一个图片信息对象
      const picInfo = { pic: response.data.tmp_path }
      // 2.将图片信息对象。push到pics数组中
      this.addForm.pics.push(picInfo)
      console.log(this.addForm)
    },

    add() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请填写必要的表单项')
        // 执行添加的业务逻辑
        // lodash   cloneDeep(obj)  拷贝对象，需要下载依赖
        const form = _.cloneDeep(this.addForm)
        this.addForm.goods_cat = form.goods_cat.join(',')
        // 处理动态参数
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.addForm.attrs.push(newInfo)
        })
        // 处理静态属性
        this.onlyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addForm.attrs.push(newInfo)
        })
        form.attrs = this.addForm.attrs
        // console.log(form)
        // 发起请求添加商品
        // 商品的名称，必须是唯一
        const { data: res } = await this.$http.post('goods', form)
        if (res.meta.status !== 201) {
          this.$router.push('/goods')
          return this.$message.error('添加商品失败')
        }
        this.$message.success('添加商品成功')
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      } else {
        return null
      }
    }
  }
}
</script>

<style lang="less" scoped>
  .el-step__title {
    font-size: 13px;
  }
  img {
    width: 100%;
  }
  .bin1 {
    margin-top: 15px;
  }
</style>

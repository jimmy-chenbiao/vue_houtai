<template>
  <div>
    <!--         面包屑导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--    卡片视图-->
    <el-card>
<!--      一行-->
      <el-row>
<!--        一列-->
        <el-col>
          <el-button type="primary" @click="setRoleList">添加角色</el-button>
        </el-col>
      </el-row>
      <el-table :data="rolelist" stripe border style="width: 100%">
<!--        展开列-->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row  v-for="(item1,i1) in scope.row.children" :key="item1.id"
                     :class="['bdbottom', 'vcenter', i1 === 0 ? 'bdtop' : '']">
<!--              渲染一级权限-->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row, item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
<!--              渲染二级权限和三级权限-->
              <el-col :span="19">
                <el-row  v-for="(item2,i2) in item1.children" :key="item2.id"
                         :class="[ i2 === 0 ? '' : 'bdtop', 'vcenter']">
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeRightById(scope.row, item2.id)">{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag closable @close="removeRightById(scope.row, item3.id)"
                            type="warning" v-for="(item3,i2) in item2.children" :key="item3.id">
                      {{item3.authName}}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
<!--        索引列-->
        <el-table-column type="index">
        </el-table-column>
        <el-table-column prop="roleName" label="角色名称" >
        </el-table-column>
        <el-table-column prop="roleDesc" label="角色描述">
        </el-table-column>
        <el-table-column prop="" label="操作" width="300px">
          <template slot-scope="scope" >
            <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
            <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
<!--    分配权限的对话框-->
    <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%" @close="setRightDialogClosed">
<!--      树形控件-->
      <el-tree show-checkbox node-key="id" :data="rightList" :props="treeProps"
               ref="treeRef"
               default-expand-all :default-checked-keys="defKeys"></el-tree>
      <span slot="footer" class="dialog-footer">
    <el-button @click="setRightDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="allotRights">确 定</el-button>
  </span>
    </el-dialog>
<!--    添加角色对话框-->
    <el-dialog title="添加角色" :visible.sync="addRoleDialogVisible" width="30%" @close="addRoleDialogVisibleClose">
      <el-form ref="addRoleForm" :model="roleInfo" label-width="80px" :rules="addRoleRules">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="roleInfo.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDes">
          <el-input v-model="roleInfo.roleDes"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="addRoleDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addRole">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 所有角色列表数据
      rolelist: [],
      // 控制分配权限对话框
      setRightDialogVisible: false,
      // 所有权限的数据
      rightList: [],
      // 树形控件的绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认选中的节点Id值数组
      defKeys: [],
      // 当前即将分配权限的角色id
      roleId: '',
      addRoleDialogVisible: false,
      roleInfo: {
        roleName: '',
        roleDes: ''
      },
      addRoleRules: {
        roleName: [
          { required: true, message: '请输入活动名称', trigger: 'blur' },
          { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    // 获取权限数据
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error('获取失败')
      this.rolelist = res.data
      console.log(this.rolelist)
    },

    // 点击删除用户权限
    async removeRightById(role, rightId) {
      // 弹窗提示用户是否要删除
      const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') return this.$message.info('取消了删除')
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) return this.$message.error('删除权限失败')
      // this.getRolesList()这个会造成页面的整体刷新，不建议用。用下面那条代码！
      role.children = res.data
    },

    // 点击展示分配权限对话框
    async showSetRightDialog(role) {
      this.roleId = role.id
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) return this.$message.error('获取权限列表失败')
      // 把获取的权限数据保存到data中
      this.rightList = res.data
      // 递归获取三级节点的Id
      this.getLeafKeys(role, this.defKeys)
      // 显示对话框
      this.setRightDialogVisible = true
    },

    // 通过递归的形式，获取角色下所有三级权限的id,并保存到defKeys数组中
    getLeafKeys(node, arr) {
      // 如果当前的 node 节点不包含children属性，则是三级节点（因为代表已经是最后一个了）
      if (!node.children) {
        return arr.push(node.id)
      }
      // 用递归的方法
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },

    // 监听分配权限对话框的关闭事件
    setRightDialogClosed() {
      this.defKeys = []
    },

    // 点击为角色分权限
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) return this.$message.error('分配权限失败')
      this.$message.success('分配权限成功')
      // 重新加载数据到页面
      this.getRolesList()
      // 关闭对话框
      this.setRightDialogVisible = false
    },
    setRoleList() {
      this.$http.post('roles', {})
      this.addRoleDialogVisible = true
    },
    async addRole() {
      // validate是验证的意思，验证输入的信息是否规范(input是否有红字)
      this.$refs.addRoleForm.validate(async valid => {
        if (!valid) return this.$message.error('更新用户信息不规范，请再次修改')
        const { data: res } = await this.$http.post('roles', {
          roleName: this.roleInfo.roleName,
          roleDesc: this.roleInfo.roleDes
        })
        if (res.meta.status !== 201) return this.$message.error('添加角色失败')
        this.$message.success('添加用户成功')
        this.getRolesList()
        this.addRoleDialogVisible = false
      })
    },
    addRoleDialogVisibleClose() {
      this.roleInfo = {}
    }
  }
}
</script>

<style lang="less" scoped>
  .el-tag {
    margin: 10px;
  }
  .bdtop {
    border-top: 1px solid #eee;
  }
  .bdbottom {
    border-bottom: 1px solid  #eee;
  }
   .vcenter {
     display: flex;
     align-items: center;
   }
</style>

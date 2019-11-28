<template>
  <div class="login_container">
      <div class="login_box">
<!--        头像区-->
          <div class="avatar_box">
              <img src="../assets/logo.png" alt="" srcset="">
          </div>
<!--        登录表单区-->
        <el-form ref="loginFormRef" :model="loginForm" label-width="0px" :rules="loginFormRules"  class="login_form">
<!--          用户名-->
          <el-form-item prop="username">
            <el-input v-model="loginForm.username" prefix-icon="iconfont icon-user"></el-input>
          </el-form-item>
<!--          密码-->
          <el-form-item prop="password">
            <el-input v-model="loginForm.password" type="password" prefix-icon="iconfont icon-3702mima"></el-input>
          </el-form-item>
<!--          按钮区-->
          <el-form-item class="btns">
              <el-button type="primary" @click='login'>登录</el-button>
              <el-button type="info"  @click="resetLoginForm">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
 </div>
</template>

<script>
export default {
  data () {
    return {
      // 这是登录表单的数据绑定对象
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      loginFormRules: {
        // 验证用户名时候合法
        username: [
          { required: true, message: '请输入登录名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        // 验证密码时候合法
        password: [
          { required: true, message: '请输入活动名称', trigger: 'blur' },
          { min: 3, max: 9, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 点击按钮重置登录表单
    resetLoginForm () {
      // 找出列表的实例对象
      // console.log(this)
      this.$refs.loginFormRef.resetFields()
    },
    login () {
      this.$refs.loginFormRef.validate(async valid => {
        // console.log(valid)
        if (!valid) return
        const { data: res } = await this.$http.post('login', this.loginForm)
        if (res.meta.status !== 200) return this.$message.error('登陆失败')
        this.$message.success('登陆成功')
        console.log(res)
        // token在打开当前网站期间才生效，所以将token保存在sessionStorage中
        window.sessionStorage.setItem('token', res.data.token)
        // 编程式导航，实现跳转
        this.$router.push('/home')
      })
    }
  }
}
</script>

<style lang="less" scoped>
.login_container {
    background-color: #2b4b6b;
    height: 100%;
}
.login_box {
    width: 450px;
    height: 300px;
    background-color: rgb(206, 41, 41);
    border-radius: 3px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%,-50%);

    .avatar_box{
        width: 130px;
        height: 130px;
        position: absolute;
        left: 50%;
        transform: translate(-50%,-50%);
        border-radius: 50%;
        padding: 10px;
        box-shadow: 0 0 10px;
        background-color: aqua;
            img{
                width: 100%;
                height: 100%;
                border-radius: 50%;
                background-color: aqua;
            }
    }
}
.btns{
    display: flex;
    justify-content: flex-end;
}
.login_form{
   position: absolute;
   bottom: 0;
   width: 100%;
   padding: 0 20px;
  box-sizing: border-box;
}
</style>

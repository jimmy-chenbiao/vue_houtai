<template>
      <el-container>
      <!--            头部区域-->
                  <el-header >
                        <div>
                          <img src="../assets/1111.png" alt="">
                          <span>企业后台管理系统</span>
                        </div>
                        <el-button type="info" @click="logout">退出</el-button>
                  </el-header>
    <!--          主体区域-->
            <el-container>
    <!--                侧边栏-->
                  <el-aside :width="isCollapse ? '64px': '200px'">
                    <div class="toggle-button" @click="toggleCollapse">|||</div>
<!--                    侧边栏菜单区-->
                    <el-menu
                      :default-active="activePath"
                      :router="true"
                      :collapse="isCollapse"
                      :collapse-transition="false"
                      :unique-opened="true"
                      background-color="#545c64"
                      text-color="#fff"
                      active-text-color="#409EFF">
<!--                      一级菜单-->
                      <el-submenu :index="item.id + '' " v-for="item in meunList" :key="item.id">
<!--                        一级菜单模板区域-->
                        <template slot="title">
<!--                          图标-->
                          <i :class="iconsObj[item.id]"></i>
                          <span>{{item.authName}}</span>
                        </template>
<!--                        二级菜单-->
<!--                        这里的index是Element-UI组件的跳转路径-->
                        <el-menu-item :index="'/' + subitem.path + '' "
                                      v-for="subitem in item.children"
                                      :key="subitem.id" @click="saveNavState('/' + subitem.path)">
                            <template slot="title">
<!--                          图标-->
                            <i class="el-icon-menu"></i>
                            <span>{{subitem.authName}}</span>
                          </template>
                        </el-menu-item>
                      </el-submenu>
                    </el-menu>
                  </el-aside>
    <!--                  内容信息区域-->
                  <el-main class="nrq">
                      <router-view></router-view>
                  </el-main>
          </el-container>
      </el-container>
</template>
<script>
export default {
  data() {
    return {
      meunList: [],
      iconsObj: {
        '125': 'iconfont icon-user',
        '103': 'iconfont icon-tijikongjian',
        '101': 'iconfont icon-shangpin',
        '102': 'iconfont icon-danju',
        '145': 'iconfont icon-baobiao'
      },
      // 是否折叠,false为不折叠
      isCollapse: false,
      // 被激活的链接地址
      activePath: ''
    }
  },
  created() {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    // 保存链接的激活状态
    saveNavState(activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    },
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    // 获取左侧栏的所有菜单
    async getMenuList() {
      const { data: res } = await this.$http.get('menus')
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.meunList = res.data
    },
    // 点击按钮控制左侧的菜单的折叠与展开
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    }
  }

}
</script>

<style lang="less" scoped>
  .el-container{
    height: 100%;
  }
  .el-header {
    background-color: #373D41;
    display: flex;
    justify-content: space-between;
    /*让退出按钮不上下贴边*/
    align-items: center;
    color: #fff;
    font-size: 20px;
    > div {
      /*让这个盒子里的东西上下居中*/
      display: flex;
      align-items: center;
      > img {
        width: 60px;
      }
      span {
        margin-left: 10px;
      }
    }
  }
  .el-aside {
    background-color: #545C64;
    .el-menu {
      border-right: none;
    }
  }
  .el-main {
    background-color: #eaedf1;
  }
  .el-submenu i {
    margin-right: 10px;
  }
  .toggle-button {
    background-color: #4A5064;
    text-align: center;
    color: #cccccc;
    line-height: 24px;
    font-size: 10px;
    /*间距*/
    letter-spacing: 0.2em;
    cursor: pointer;/*鼠标样式*/
  }
</style>

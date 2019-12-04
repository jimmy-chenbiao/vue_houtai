import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/login.vue'
import Home from '../components/home.vue'
import Welcome from '../components/welcome.vue'
import Users from '../components/user/users.vue'
import Rights from '../components/power/right.vue'
import Roles from '../components/power/roles'
import Cate from '../components/goods/cate'
import Params from '../components/goods/params'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles },
      { path: '/categories', component: Cate },
      { path: '/params', component: Params }
    ] }
]

const router = new VueRouter({
  routes
})

// ---------------路由导航守卫
router.beforeEach((to, from, next) => {
  // to将要访问的路径
  // from代表从那个路径跳转而来
  // next是一个函数，表示放行
  if (to.path === '/login') return next()
  const tokenStr = window.sessionStorage.getItem('token')
  // 强制跳转
  if (!tokenStr) return next('/login')
  next()
})

export default router

import Vue from 'vue'
import App from './App.vue'
import router from './router'
import Router from 'vue-router'
import TreeTable from 'vue-table-with-tree-grid'
import './plugins/element.js'
// 导入副文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// require styles  导入副文本对应的样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

// 导入字体图标
import './assets/fonts/iconfont.css'
// 导入全局样式表
import './assets/css/global.css'

import axios from 'axios'
// 配置请求的根路径
axios.defaults.baseURL = `http://127.0.0.1:8888/api/private/v1/`
// 配置axios请求拦截器添加token，保证拥有获取数据的权限
axios.interceptors.request.use(config => {
  // console.log(config)
  // Authorization是API接口文档要求的自定义名字
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
Vue.prototype.$http = axios

const originalPush = Router.prototype.push
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}

// 时间过滤器
Vue.filter('dateFormat', function(dataStr) {
  // 根据给定的时间字符串，得到特定的时间
  var dt = new Date(dataStr)
  var y = dt.getFullYear()
  // 得到的是0月，所以+1
  var m = (dt.getMonth() + 1).toString().padStart(2, '0')
  // .toString.padStart(最大字符串长度值，"要替补的符号或值")
  var d = dt.getDate().toString().padStart(2, '0')
  var hh = dt.getHours().toString().padStart(2, '0')
  var mm = dt.getMinutes().toString().padStart(2, '0')
  var ss = dt.getSeconds().toString().padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

Vue.component('tree-table', TreeTable)

Vue.config.productionTip = false
// 将副文本注册为全局可用的组件
Vue.use(VueQuillEditor/* { default global options } */)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

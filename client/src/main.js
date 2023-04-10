import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import * as ElIcon from '@element-plus/icons-vue'
 
const app = createApp(App)
 
for (let iconName in ElIcon){
  app.component(iconName, ElIcon[iconName])
}
app.use(ElementPlus)
app.mount('#app')
import { createApp } from 'vue'

import ElementUI from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'

const app = createApp(App);
app.use(ElementUI);
app.mount('#app')

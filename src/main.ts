import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import AboutPage from './views/AboutPage.vue'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)

const route = window.location.hash.replace('#', '') || '/'
if (route === '/about') {
  app.component('AboutPage', AboutPage)
}

app.mount('#app')

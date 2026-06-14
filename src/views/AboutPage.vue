<script setup lang="ts">
const appInfo = {
  name: 'AirPlay3',
  version: '0.1.3',
  description: 'AirPlay 3 风格的 Windows 桌面音乐播放器',
}

const credits = [
  { name: 'Tauri', url: 'https://tauri.app', license: 'MIT/Apache-2.0', desc: '桌面应用框架' },
  { name: 'Vue.js', url: 'https://vuejs.org', license: 'MIT', desc: '前端 UI 框架' },
  { name: 'Vite', url: 'https://vitejs.dev', license: 'MIT', desc: '构建工具' },
  { name: 'Pinia', url: 'https://pinia.vuejs.org', license: 'MIT', desc: '状态管理' },
  { name: 'Rust', url: 'https://www.rust-lang.org', license: 'MIT/Apache-2.0', desc: '系统编程语言' },
  { name: 'reqwest', url: 'https://github.com/seanmonstar/reqwest', license: 'MIT/Apache-2.0', desc: 'HTTP 客户端' },
  { name: 'lofty', url: 'https://github.com/Serial-ATA/lofty-rs', license: 'MIT', desc: '音频元数据读取' },
  { name: 'zhconv', url: 'https://github.com/nickel-org/zhconv', license: 'MIT', desc: '繁简中文转换' },
  { name: 'LRCLIB', url: 'https://lrclib.net', license: 'Open', desc: '歌词数据库 API' },
]
</script>

<template>
  <div class="about-page">
    <div class="about-header">
      <div class="about-icon">♫</div>
      <h2>{{ appInfo.name }}</h2>
      <span class="about-version">v{{ appInfo.version }}</span>
    </div>
    <p class="about-desc">{{ appInfo.description }}</p>

    <div class="about-section">
      <h3>Open Source Components</h3>
      <div class="credits-list">
        <div v-for="credit in credits" :key="credit.name" class="credit-item">
          <div class="credit-name">
            <a :href="credit.url" target="_blank">{{ credit.name }}</a>
            <span class="credit-license">{{ credit.license }}</span>
          </div>
          <div class="credit-desc">{{ credit.desc }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.about-page {
  padding: 24px;
  color: #333;
  min-height: 100vh;
}

.about-header {
  text-align: center;
  margin-bottom: 16px;
}

.about-icon {
  font-size: 56px;
  margin-bottom: 8px;
}

.about-header h2 {
  font-size: 22px;
  color: #1a1a2e;
  margin: 0;
}

.about-version {
  font-size: 13px;
  color: #888;
}

.about-desc {
  text-align: center;
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
}

.about-section h3 {
  font-size: 14px;
  color: #e86a2e;
  margin-bottom: 10px;
  padding-bottom: 6px;
  border-bottom: 2px solid #e86a2e;
}

.credits-list {
  max-height: 320px;
  overflow-y: auto;
}

.credit-item {
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.credit-item:last-child {
  border-bottom: none;
}

.credit-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.credit-name a {
  color: #e86a2e;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
}

.credit-name a:hover {
  text-decoration: underline;
}

.credit-license {
  font-size: 11px;
  color: #888;
  background: #f0f0f0;
  padding: 2px 8px;
  border-radius: 4px;
}

.credit-desc {
  font-size: 12px;
  color: #888;
  margin-top: 3px;
}
</style>

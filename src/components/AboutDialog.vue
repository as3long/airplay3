<script setup lang="ts">
defineEmits<{
  close: []
}>()

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
  <div class="about-overlay" @click.self="$emit('close')">
    <div class="about-dialog" @click.stop>
      <div class="about-header">
        <div class="about-icon">♫</div>
        <h2>AirPlay3</h2>
        <span class="about-version">v0.1.3</span>
      </div>
      <p class="about-desc">AirPlay 3 风格的 Windows 桌面音乐播放器</p>

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

      <div class="about-footer">
        <button class="about-btn" @click="$emit('close')">OK</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.about-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.about-dialog {
  background: #1e1e2e;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  width: 400px;
  max-height: 460px;
  overflow-y: auto;
  color: #ccc;
}

.about-header {
  text-align: center;
  margin-bottom: 10px;
}

.about-icon {
  font-size: 48px;
  margin-bottom: 6px;
}

.about-header h2 {
  font-size: 20px;
  color: #fff;
  margin: 0;
}

.about-version {
  font-size: 12px;
  color: #888;
}

.about-desc {
  text-align: center;
  font-size: 13px;
  color: #888;
  margin-bottom: 14px;
}

.about-section h3 {
  font-size: 13px;
  color: #e86a2e;
  margin-bottom: 8px;
  padding-bottom: 4px;
  border-bottom: 2px solid #e86a2e;
}

.credits-list {
  max-height: 260px;
  overflow-y: auto;
}

.credit-item {
  padding: 6px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.credit-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.credit-name a {
  color: #e86a2e;
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
}

.credit-name a:hover {
  text-decoration: underline;
}

.credit-license {
  font-size: 10px;
  color: #666;
  background: rgba(255, 255, 255, 0.06);
  padding: 1px 6px;
  border-radius: 3px;
}

.credit-desc {
  font-size: 11px;
  color: #666;
  margin-top: 2px;
}

.about-footer {
  text-align: center;
  margin-top: 14px;
}

.about-btn {
  padding: 6px 32px;
  background: #e86a2e;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
}

.about-btn:hover {
  background: #ff7a3d;
}
</style>

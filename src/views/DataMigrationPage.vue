<template>
  <div class="data-migration-page">
    <div class="page-header">
      <h1>数据迁移</h1>
      <p class="page-description">
        管理您的数据存储模式，在云端和本地之间自由切换，确保数据安全和可访问性。
      </p>
    </div>

    <DataMigration />
  </div>
</template>

<script setup>
import DataMigration from '@/components/DataMigration.vue'
</script>

<style scoped>
.data-migration-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
  padding: 40px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.page-header h1 {
  font-size: 32px;
  color: #303133;
  margin: 0 0 16px 0;
  font-weight: 600;
}

.page-description {
  font-size: 16px;
  color: #606266;
  line-height: 1.6;
  margin: 0;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .data-migration-page {
    padding: 12px;
  }
  
  .page-header {
    padding: 24px 16px;
    margin-bottom: 24px;
  }
  
  .page-header h1 {
    font-size: 24px;
  }
  
  .page-description {
    font-size: 14px;
  }
}
</style>

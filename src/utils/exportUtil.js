/**
 * 数据导出工具
 * 支持JSON、CSV、Excel格式导出
 */

import { saveAs } from 'file-saver'

/**
 * 导出为JSON文件
 */
export function exportToJSON(data, filename = 'export') {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' })
  saveAs(blob, `${filename}.json`)
}

/**
 * 导出为CSV文件
 */
export function exportToCSV(data, filename = 'export', columns = null) {
  if (!data || data.length === 0) {
    throw new Error('没有数据可导出')
  }

  // 如果没有指定列，使用第一行数据的键作为列
  const headers = columns || Object.keys(data[0])
  
  // 生成CSV内容
  const csvRows = []
  
  // 添加标题行
  csvRows.push(headers.join(','))
  
  // 添加数据行
  data.forEach(row => {
    const values = headers.map(header => {
      let value = row[header]
      
      // 处理特殊字符
      if (value === null || value === undefined) {
        return ''
      }
      
      // 转换为字符串
      value = String(value)
      
      // 如果包含逗号、引号或换行符，需要用引号包裹并转义引号
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        value = `"${value.replace(/"/g, '""')}"`
      }
      
      return value
    })
    csvRows.push(values.join(','))
  })
  
  const csvContent = csvRows.join('\n')
  
  // 添加BOM以支持中文
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8' })
  saveAs(blob, `${filename}.csv`)
}

/**
 * 导出为Excel文件（使用HTML table方式）
 */
export function exportToExcel(data, filename = 'export', columns = null) {
  if (!data || data.length === 0) {
    throw new Error('没有数据可导出')
  }

  // 如果没有指定列，使用第一行数据的键作为列
  const headers = columns || Object.keys(data[0])
  
  // 生成HTML table
  let html = '<html><head><meta charset="utf-8"></head><body><table>'
  
  // 添加标题行
  html += '<thead><tr>'
  headers.forEach(header => {
    html += `<th>${escapeHtml(header)}</th>`
  })
  html += '</tr></thead>'
  
  // 添加数据行
  html += '<tbody>'
  data.forEach(row => {
    html += '<tr>'
    headers.forEach(header => {
      const value = row[header] !== null && row[header] !== undefined ? row[header] : ''
      html += `<td>${escapeHtml(String(value))}</td>`
    })
    html += '</tr>'
  })
  html += '</tbody></table></body></html>'
  
  // 使用Blob创建Excel文件
  const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' })
  saveAs(blob, `${filename}.xls`)
}

/**
 * 导出分析报表（多表格Excel）
 */
export function exportAnalyticsReport(reportData, filename = 'analytics-report') {
  const {
    overview = {},
    userGrowth = [],
    featureUsage = [],
    aiUsage = {},
    revenue = {}
  } = reportData

  // 生成HTML
  let html = `
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; }
        h1 { color: #333; }
        h2 { color: #666; margin-top: 30px; }
        table { border-collapse: collapse; width: 100%; margin-top: 10px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .summary { background-color: #e3f2fd; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .summary-item { display: inline-block; margin: 10px 20px 10px 0; }
        .summary-label { color: #666; font-size: 14px; }
        .summary-value { font-size: 24px; font-weight: bold; color: #1976d2; }
      </style>
    </head>
    <body>
      <h1>数据分析报表</h1>
      <p>生成时间: ${new Date().toLocaleString('zh-CN')}</p>
  `

  // 概览统计
  html += `
    <div class="summary">
      <h2>概览统计</h2>
      <div class="summary-item">
        <div class="summary-label">总用户数</div>
        <div class="summary-value">${overview.totalUsers || 0}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">活跃用户</div>
        <div class="summary-value">${overview.activeUsers || 0}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">总小说数</div>
        <div class="summary-value">${overview.totalNovels || 0}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">总收入</div>
        <div class="summary-value">¥${formatMoney(overview.totalRevenue)}</div>
      </div>
    </div>
  `

  // 用户增长趋势
  if (userGrowth.length > 0) {
    html += '<h2>用户增长趋势</h2><table>'
    html += '<thead><tr><th>日期</th><th>新增用户数</th></tr></thead><tbody>'
    userGrowth.forEach(item => {
      html += `<tr><td>${item.date}</td><td>${item.count}</td></tr>`
    })
    html += '</tbody></table>'
  }

  // 功能使用统计
  if (featureUsage.length > 0) {
    html += '<h2>功能使用统计</h2><table>'
    html += '<thead><tr><th>功能</th><th>使用次数</th></tr></thead><tbody>'
    featureUsage.forEach(item => {
      html += `<tr><td>${escapeHtml(item.feature)}</td><td>${item.count}</td></tr>`
    })
    html += '</tbody></table>'
  }

  // AI使用统计
  if (aiUsage.byFunction && aiUsage.byFunction.length > 0) {
    html += '<h2>AI使用统计</h2>'
    html += `<p>总使用次数: ${aiUsage.totalUsage || 0} | 总成本: ¥${formatMoney(aiUsage.totalCost)} | 平均响应时间: ${Math.round(aiUsage.avgResponseTime || 0)}ms</p>`
    html += '<table><thead><tr><th>AI功能</th><th>使用次数</th></tr></thead><tbody>'
    aiUsage.byFunction.forEach(item => {
      html += `<tr><td>${escapeHtml(item.function)}</td><td>${item.count}</td></tr>`
    })
    html += '</tbody></table>'
  }

  // 收入统计
  if (revenue.byPackage && revenue.byPackage.length > 0) {
    html += '<h2>收入统计</h2>'
    html += `<p>总收入: ¥${formatMoney(revenue.totalRevenue)} | 订单数: ${revenue.orderCount || 0}</p>`
    html += '<table><thead><tr><th>套餐</th><th>收入</th><th>订单数</th></tr></thead><tbody>'
    revenue.byPackage.forEach(item => {
      html += `<tr><td>${escapeHtml(item.packageName)}</td><td>¥${formatMoney(item.revenue)}</td><td>${item.count}</td></tr>`
    })
    html += '</tbody></table>'
  }

  html += '</body></html>'

  const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' })
  saveAs(blob, `${filename}.xls`)
}

/**
 * HTML转义
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  return String(text).replace(/[&<>"']/g, m => map[m])
}

/**
 * 格式化金额
 */
function formatMoney(value) {
  if (!value) return '0.00'
  return Number(value).toFixed(2)
}

/**
 * 批量导出数据（支持选择格式）
 */
export function exportData(data, filename, format = 'csv', columns = null) {
  switch (format.toLowerCase()) {
    case 'json':
      exportToJSON(data, filename)
      break
    case 'csv':
      exportToCSV(data, filename, columns)
      break
    case 'excel':
    case 'xls':
      exportToExcel(data, filename, columns)
      break
    default:
      throw new Error(`不支持的导出格式: ${format}`)
  }
}

export default {
  exportToJSON,
  exportToCSV,
  exportToExcel,
  exportAnalyticsReport,
  exportData
}

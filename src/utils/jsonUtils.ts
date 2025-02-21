export type JsonData = { [key: string]: any } | any[] | string | number | boolean | null

export const defaultJson: JsonData = {
  "author": "Zhang Baoyuan",
  "company": "Shanghai Yiwo",
  "description": "JSON查看器",
  "date": "2025-02-19",
  "functionality": {
    "json_viewer": {
      "description": "一个基于网页的JSON查看器，允许用户输入、渲染并与JSON数据进行交互。",
      "features": [
        {
          "name": "渲染JSON",
          "description": "以可折叠的树形结构渲染JSON数据，并对不同数据类型进行语法高亮显示。"
        },
        // ... 这里添加完整的 features 数组内容 ...
      ]
    },
    // ... 这里添加完整的 defaultJson 内容 ...
  }
}

export function generateSummary(data: JsonData): string {
  if (Array.isArray(data)) {
    return `[${data.map(item => JSON.stringify(item)).join(', ')}]`
  } else if (typeof data === 'object' && data !== null) {
    const entries = Object.entries(data).map(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        return `${key}: {…}`
      }
      return `${key}: ${JSON.stringify(value)}`
    })
    return `{${entries.join(', ')}}`
  }
  return JSON.stringify(data)
}

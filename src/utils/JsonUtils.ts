import { JsonData } from '../types/JsonData';

// 定义快捷键数据
export const shortcuts = [
  { key: '?', description: '帮助' },
  { key: 'F8', description: '明暗模式切换' },
  { key: 'F9', description: '布局切换' },
  { key: 'F10', description: '输入区域最小化' },
  { key: 'F11', description: '输入区域最大化' },
  { key: 'G', description: '到底部' },
  { key: 'iI | aA', description: '退出VIM-normal模式' },
  { key: 'Esc | jk', description: '进入VIM-normal模式' },
  { key: 'yy', description: '复制整行(文档内)' },
  { key: 'p', description: '粘贴(仅作了文档内)' },
  { key: 'dd', description: '删除整行' },
  { key: 'A-k', description: '上移整行' },
  { key: 'A-j', description: '下移整行' },
  { key: 't', description: '向上滚动' },
  { key: 'f', description: '向下滚动' },
  { key: 'zc', description: '收起到父节点（折叠当前代码块）' },
  { key: 'zo', description: '展开子节点（展开当前代码块）' },
  { key: 'zz', description: '当前行居中' },
  { key: 'gg', description: '到顶部' },
  { key: 'G', description: '到底部' },
  { key: '/', description: '启动正向搜索' },
  { key: 'n', description: '下一个匹配项（搜索结果）' },
  { key: 'N', description: '上一个匹配项（搜索结果）' },
  { key: '%', description: '跳转到匹配的括号/符号' },
  { key: 'u', description: '撤销' },
  { key: 'Ctrl-r', description: '恢复' },
  { key: 'V', description: '选一行' },
  { key: '*', description: '搜索光标下的单词（正向）' },
  // { key: '#', description: '搜索光标下的单词（反向）' },
  { key: ':s/old/new', description: '替换当前行的 old 为 new' },
  { key: ':%s/old/new/g', description: '全局替换 old 为 new' },
];


export const defaultJson: JsonData = {
  "author": "Baoyuan",
  "date": "2025-03-15",
  "description": "支持 VIM 操作的 JSON 查看和编辑工具",
  "help": {
    "输入框": {
      "VIM 模式": "支持 VIM 模式, 不习惯或者不小心进入 VIM 普通模式后, 按下 insert | i | a 可以退出来",
      "运行函数": [
        {
          "console.log": "非异步方法的 console.log 内容会被收集起来打印到展示区域",
          "示例": "console.log(123123)",
        },
        {
          "fetch": "支持显示 fetch 请求结果, 结果会被打印到展示区域",
          "示例": "fetch('https://jsonplaceholder.typicode.com/posts');",
        }
      ],
    },
    "过滤框": {
      "item": "item 对应输入框内容, 支持 LINQ 部分语法, 回车更新",
      "示例1": 'item.testExamples.Where(e => e.type == "对象")',
      "示例2": "item.testExamples.SelectMany(e => e.example)",
    },
    "加解密": {
      "加密": "加密需要密钥框内有密钥, 未输入密钥时点击加密, 会给出常用密钥列表",
      "解密": "解密可以不输入密钥, 默认会遍历常用密钥列表, 解密成功后密钥框和展示区内容会更新, 默认列表无法解密时, 会使用输入密钥",
    },
    "调大小": {
      "快捷键": "F8, F9, F10, F11 切换显示",
      "到底部": 'G 展示数据过多时, 到达底部',
      "到顶部": 'g 回到顶部',
      "输入框": "支持拖动调整大小",
    },

    "部分快捷键": shortcuts,
  },

  "testExamples": [
    {
      "type": "对象",
      "example": {
        "name": "John",
        "age": 30,
        "isStudent": false,
        "address": {
          "street": "123 Main St",
          "city": "Anytown",
          "state": "CA"
        }
      }
    },
    {
      "type": "数组",
      "example": [
        {
          "type": "home",
          "number": "123-456-7890"
        },
        {
          "type": "work",
          "number": "987-654-3210"
        }
      ]
    },
    {
      "type": "字符串",
      "example": "这是一个字符串"
    },
    {
      "type": "数字",
      "example": 42
    },
    {
      "type": "布尔值",
      "example": true
    },
    {
      "type": "空值",
      "example": null
    }
  ]
};

const arrayMethods = [
  "concat", "copyWithin", "entries", "every", "fill", "filter",
  "find", "findIndex", "flat", "flatMap", "forEach", "includes",
  "indexOf", "join", "keys", "lastIndexOf", "map", "pop", "push",
  "reduce", "reduceRight", "reverse", "shift", "slice", "some",
  "sort", "splice", "toLocaleString", "toString", "unshift", "length", 

  "Select", "Where", "First", "FirstOrDefault", "SelectMany", "Some", "All",

  "Values", "Keys", "ToVector2", "ToSet", "ToJson", '0'
];

/**
 * 获取json折叠数据信息
 */
export function generateSummary(data: JsonData): string {
  if (Array.isArray(data)) {
    return `[${data.map(item => JSON.stringify(item)).join(', ')}]`;
  } else if (typeof data === 'object' && data !== null) {
    const entries = Object.entries(data).map(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        return `${key}: {…}`;
      }
      return `${key}: ${JSON.stringify(value)}`;
    });
    return `{${entries.join(', ')}}`;
  }
  return JSON.stringify(data);
}

/**
 * 获取子元素所有KEY
  */
export function getUniqueKeys(jsonObj: any, prefix = 'item'): string[] {
  const keys: Set<string> = new Set();

  function traverse(obj: any, currentPath: string) {
    if (typeof obj !== 'object' || obj === null) return;

    for (const key in obj) {
      const newPath = `${currentPath}.${key}`;
      keys.add(newPath);
      traverse(obj[key], newPath);
    }
  }

  traverse(jsonObj, prefix);
  return Array.from(keys);
}

// 新增：检查路径是否为数组，并返回数组方法
export function getArrayMethods(jsonObj: any, path: string): string[] | null {
  function resolvePath(obj: any, parts: string[]): any {
    let current = obj;
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return null;
      }
    }
    return current;
  }

  const parts = path.split('.').slice(1); // 移除 'item' 前缀
  const value = resolvePath(jsonObj, parts);
  return Array.isArray(value) ? arrayMethods : null;
}

export function extractKeys(obj: any, keySet = new Set()) {
  if (typeof obj === 'object' && obj!== null) {
    for (const key in obj) {
      if (!keySet.has(key)) {
        keySet.add(key);
      }
      extractKeys(obj[key], keySet);
    }
  }
  return [...keySet, ...arrayMethods];
}

/**
 * json数据过滤器
  */
export function filterJsonValue(fil: any, jsonValue: string) {
  let cleanedInput = (jsonValue || JSON.stringify(defaultJson)).trim();

  try {
    let code = fil.replace(/item/, 'return JSON.parse(input)');
    code = code.replace(".FirstOrDefault(", '.find(');
    code = code.replace(".Some(", '.any(');
    code = code.replace(".All(", '.every(');
    code = code.replace(/\.0/, '[0]');

    const func = new Function('input', code);
    let result = func(cleanedInput);
    if(typeof result !== 'object'){
      result = {'cur-data': result};
    }

    console.log(result);
    return result;
  } catch (error: any) {
    console.log(`执行出错: ${error.message}`);
    return {"Error": error.message};
  }
}

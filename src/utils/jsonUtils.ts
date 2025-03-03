import { JsonData } from '../types/JsonData';

export const defaultJson: JsonData = {
  "author": "Baoyuan",
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
        {
          "name": "搜索",
          "description": "允许用户在JSON数据中搜索特定的键或值，突出显示匹配项并展开相关节点。"
        },
        {
          "name": "折叠/展开",
          "description": "用户可以折叠或展开JSON树中的所有节点，以便更轻松地导航。"
        },
        {
          "name": "深色模式",
          "description": "在亮色和深色主题之间切换，以在不同光照条件下获得更好的可读性。"
        },
        {
          "name": "复制到剪贴板",
          "description": "允许用户通过单击将JSON数据或特定值复制到剪贴板。"
        },
        {
          "name": "返回顶部",
          "description": "提供一个按钮，可快速滚动回页面顶部。"
        }
      ]
    },
    "data_types": {
      "description": "支持各种JSON数据类型，包括对象、数组、字符串、数字、布尔值和空值。",
      "examples": [
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
    }
  }
};

export const filterData: string[] = [
  "item",
  "concat", "copyWithin", "entries", "every", "fill", "filter",
  "find", "findIndex", "flat", "flatMap", "forEach", "includes",
  "indexOf", "join", "keys", "lastIndexOf", "map", "pop", "push",
  "reduce", "reduceRight", "reverse", "shift", "slice", "some",
  "sort", "splice", "toLocaleString", "toString", "unshift", "values",
  "Object.assign", "Object.create", "Object.defineProperties", "Object.defineProperty", "Object.entries",
  "Object.freeze", "Object.fromEntries", "Object.getOwnPropertyDescriptor", "Object.getOwnPropertyDescriptors", "Object.getOwnPropertyNames",
  "Object.getOwnPropertySymbols", "Object.getPrototypeOf", "Object.is", "Object.isExtensible", "Object.isFrozen",
  "Object.isSealed", "Object.keys", "Object.preventExtensions", "Object.seal", "Object.setPrototypeOf", "Object.values",
  "JSON.parse", "JSON.stringify",
  "function", "const", "var"
];


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
  const arrayMethods = [
    'map', 'filter', 'forEach', 'reduce', 'find', 'some', 'every', 'sort', 'slice'
  ];

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

export function getUniqueKeys2(jsonObj: any, prefix = 'item'): string[] {
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

export function getUniqueKeys1(obj: any) {
  const keySet = new Set(filterData); // 使用 Set 去重
  
  function extractKeys(value: any) {
    if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        value.forEach(item => extractKeys(item)); // 处理数组中的每个元素
      } else {
        for (let key in value) {
          if (value.hasOwnProperty(key)) {
            keySet.add(key); // 添加到 Set 中，自动去重
            extractKeys(value[key]); // 递归处理嵌套对象
          }
        }
      }
    }
  }
  
  extractKeys(obj);
  return Array.from(keySet); // 将 Set 转为数组返回
}

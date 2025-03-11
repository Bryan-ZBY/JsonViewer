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
    // if (Array.isArray(obj)) {
    //   // 只处理数组的第一个元素
    //   if (obj.length > 0) {
    //     extractKeys(obj[0], keySet);
    //   }
    // } else {
      // 处理对象
      for (const key in obj) {
        if (!keySet.has(key)) {
          keySet.add(key);
        }
        extractKeys(obj[key], keySet);
      }
    // }
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
    code = code.replace(/.0/, '[0]');

    const func = new Function('input', code);
    let result = func(cleanedInput);
    if(typeof result !== 'object'){
      result = {'cur-data': result};
    }

    // globalDataStore.updateGlobalValue(JSON.stringify(result));

    console.log(result);
    return result;
  } catch (error: any) {
    console.log(`执行出错: ${error.message}`);
    return {"Error": error.message};
  }
}

// 定义 item 对象的接口
export interface FlattenedItem {
  key: string;
  fullKey: string;
  value: any;
  uuid: string;
  isObjectOrArray: boolean;
  isCollapsed: boolean;
  showCopy: boolean;
  summary: string;
  valueClass: string;
  highlightedValue: string;
}

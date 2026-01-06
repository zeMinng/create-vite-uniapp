/**
 * 验证包名是否有效
 * 规则：只能包含小写字母、数字、连字符、下划线和点
 */
export function isValidPackageName(name: string): boolean {
  return /^[a-z0-9._-]+$/.test(name)
}


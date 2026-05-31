import type { FormRules } from 'element-plus'

export function isPhone(phone: string): boolean {
  return /^1[3-9]\d{9}$/.test(phone)
}

export function isEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isIdCard(idCard: string): boolean {
  return /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(idCard)
}

export function isURL(url: string): boolean {
  return /^(https?:\/\/|\/\/)[\w.]+(\/\S*)?$/i.test(url)
}

export function isIP(ip: string): boolean {
  return /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/.test(ip)
}

export function isVersion(version: string): boolean {
  return /^\d+\.\d+\.\d+(-[\w.]+)?$/.test(version)
}

export function isAppCode(code: string): boolean {
  return /^[a-z][a-z0-9-]*$/.test(code)
}

export function isConfigKey(key: string): boolean {
  return /^[a-zA-Z][a-zA-Z0-9_.]*$/.test(key)
}

export function isJson(str: string): boolean {
  if (typeof str !== 'string') return false
  try {
    JSON.parse(str)
    return true
  } catch {
    return false
  }
}

export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

export function isNotEmpty(value: any): boolean {
  return !isEmpty(value)
}

export function isNumber(value: any): boolean {
  return !isNaN(parseFloat(value)) && isFinite(value)
}

export function isInteger(value: any): boolean {
  return isNumber(value) && Number.isInteger(Number(value))
}

export function isPositive(value: any): boolean {
  return isNumber(value) && Number(value) > 0
}

export function isNonNegative(value: any): boolean {
  return isNumber(value) && Number(value) >= 0
}

export function hasChinese(str: string): boolean {
  return /[\u4e00-\u9fa5]/.test(str)
}

export function minLength(value: string, min: number): boolean {
  return value.length >= min
}

export function maxLength(value: string, max: number): boolean {
  return value.length <= max
}

export function between(value: number, min: number, max: number): boolean {
  return value >= min && value <= max
}

export const validatePhone = (rule: any, value: string, callback: any) => {
  if (!value) return callback(new Error('请输入手机号'))
  if (!isPhone(value)) return callback(new Error('请输入正确的手机号'))
  callback()
}

export const validateEmail = (rule: any, value: string, callback: any) => {
  if (!value) return callback(new Error('请输入邮箱'))
  if (!isEmail(value)) return callback(new Error('请输入正确的邮箱'))
  callback()
}

export const validateURL = (rule: any, value: string, callback: any) => {
  if (!value) return callback(new Error('请输入URL'))
  if (!isURL(value)) return callback(new Error('请输入正确的URL'))
  callback()
}

export const validateVersion = (rule: any, value: string, callback: any) => {
  if (!value) return callback(new Error('请输入版本号'))
  if (!isVersion(value)) return callback(new Error('版本号格式错误，如：1.0.0'))
  callback()
}

export const validateAppCode = (rule: any, value: string, callback: any) => {
  if (!value) return callback(new Error('请输入应用编码'))
  if (!isAppCode(value)) return callback(new Error('应用编码只能包含小写字母、数字和横杠，且以字母开头'))
  callback()
}

export const validateConfigKey = (rule: any, value: string, callback: any) => {
  if (!value) return callback(new Error('请输入配置键'))
  if (!isConfigKey(value)) return callback(new Error('配置键只能包含字母、数字、下划线和点，且以字母开头'))
  callback()
}

export const validateJson = (rule: any, value: string, callback: any) => {
  if (!value) return callback()
  if (!isJson(value)) return callback(new Error('JSON格式错误'))
  callback()
}

export const validateRequired = (message: string) => (rule: any, value: any, callback: any) => {
  if (isEmpty(value)) return callback(new Error(message))
  callback()
}

export const validateNumber = (message: string = '请输入数字') => (rule: any, value: any, callback: any) => {
  if (isEmpty(value)) return callback()
  if (!isNumber(value)) return callback(new Error(message))
  callback()
}

export const validateInteger = (message: string = '请输入整数') => (rule: any, value: any, callback: any) => {
  if (isEmpty(value)) return callback()
  if (!isInteger(value)) return callback(new Error(message))
  callback()
}

export const validateRange = (min: number, max: number, message?: string) => 
  (rule: any, value: number, callback: any) => {
    if (isEmpty(value)) return callback()
    if (!between(value, min, max)) {
      return callback(new Error(message || `请输入${min}-${max}之间的值`))
    }
    callback()
  }

export function createRules(schema: Record<string, any[]>): FormRules {
  const rules: FormRules = {}
  
  Object.entries(schema).forEach(([field, validators]) => {
    rules[field] = validators.map((v) => {
      if (typeof v === 'function') {
        return { validator: v, trigger: 'blur' }
      }
      return { ...v, trigger: v.trigger || 'blur' }
    })
  })
  
  return rules
}

export default {
  isPhone,
  isEmail,
  isIdCard,
  isURL,
  isIP,
  isVersion,
  isAppCode,
  isConfigKey,
  isJson,
  isEmpty,
  isNotEmpty,
  isNumber,
  isInteger,
  isPositive,
  isNonNegative,
  hasChinese,
  minLength,
  maxLength,
  between,
  validatePhone,
  validateEmail,
  validateURL,
  validateVersion,
  validateAppCode,
  validateConfigKey,
  validateJson,
  validateRequired,
  validateNumber,
  validateInteger,
  validateRange,
  createRules
}

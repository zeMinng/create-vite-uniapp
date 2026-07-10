import { describe, it, expect } from 'vitest'
import { isValidPackageName, formatTargetDir } from '@/utils/validate'

describe('validate utils', () => {
  it('isValidPackageName', () => {
    expect(isValidPackageName('my-package')).toBe(true)
    expect(isValidPackageName('my.package')).toBe(true)
    expect(isValidPackageName('my_package')).toBe(true)
    expect(isValidPackageName('myPackage')).toBe(false)
    expect(isValidPackageName('MyPackage')).toBe(false)
    expect(isValidPackageName('my package')).toBe(false)
  })

  it('formatTargetDir', () => {
    expect(formatTargetDir('my-project/')).toBe('my-project')
    expect(formatTargetDir('  my-project  ')).toBe('my-project')
    expect(formatTargetDir('my-project///')).toBe('my-project')
  })
})

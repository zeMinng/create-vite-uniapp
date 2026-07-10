import { describe, it, expect, afterEach } from 'vitest'
import { getPkgManager } from '@/utils/env'
import process from 'node:process'

describe('env utils', () => {
  const originalUserAgent = process.env.npm_config_user_agent

  afterEach(() => {
    process.env.npm_config_user_agent = originalUserAgent
  })

  it('getPkgManager detects pnpm', () => {
    process.env.npm_config_user_agent = 'pnpm/8.0.0 npm/? node/v18.0.0 linux x64'
    expect(getPkgManager()).toBe('pnpm')
  })

  it('getPkgManager detects yarn', () => {
    process.env.npm_config_user_agent = 'yarn/1.22.19 npm/? node/v18.0.0 linux x64'
    expect(getPkgManager()).toBe('yarn')
  })

  it('getPkgManager detects bun', () => {
    process.env.npm_config_user_agent = 'bun/1.0.0 npm/? node/v18.0.0 linux x64'
    expect(getPkgManager()).toBe('bun')
  })

  it('getPkgManager defaults to npm', () => {
    process.env.npm_config_user_agent = 'npm/9.0.0 node/v18.0.0 linux x64'
    expect(getPkgManager()).toBe('npm')

    process.env.npm_config_user_agent = undefined
    expect(getPkgManager()).toBe('npm')
  })
})

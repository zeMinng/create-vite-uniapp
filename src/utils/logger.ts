import colors from 'picocolors'
import * as prompts from '@clack/prompts'

export const log = {
  info: (msg: string) => {
    prompts.log.info(colors.cyan(msg))
  },
  success: (msg: string) => {
    prompts.log.success(colors.green(msg))
  },
  error: (msg: string) => {
    prompts.log.error(colors.red(msg))
  },
  warning: (msg: string) => {
    prompts.log.warn(colors.yellow(msg))
  },
  step: (msg: string) => {
    prompts.log.step(colors.blue(msg))
  },
}


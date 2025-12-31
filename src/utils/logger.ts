import { green, red, blue } from 'kolorist'

export const log = {
  info: (msg: string) => console.log(blue(msg)),
  success: (msg: string) => console.log(green(msg)),
  error: (msg: string) => console.log(red(msg))
}

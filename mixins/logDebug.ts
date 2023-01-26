const DEBUG = true
let STARTTIME: Date = new Date()
export const logd = (s: any, ...s1: any) => {
  if (DEBUG) {
    const delay: number = new Date().getTime() - STARTTIME.getTime()
    console.log(delay + 'ms: ' + s, ...s1)
  }
}
export const logdResetStarttime = () => {
  STARTTIME = new Date()
}
export default logd
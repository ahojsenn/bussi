/* the spreadesheet url */
const appConfig = useAppConfig()
const GURL = 'https://docs.google.com/spreadsheets/d/'
const GdataUrl = GURL + appConfig.GKEY

export const URL = GdataUrl
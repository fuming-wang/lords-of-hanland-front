export type Platform = 'h5' | 'mp-weixin' | 'app-plus' | 'unknown'

export function getPlatform(): Platform {
  // #ifdef H5
  return 'h5'
  // #endif
  // #ifdef MP-WEIXIN
  return 'mp-weixin'
  // #endif
  // #ifdef APP-PLUS
  return 'app-plus'
  // #endif
  return 'unknown'
}

export function isMobilePlatform() {
  const platform = getPlatform()
  return platform === 'mp-weixin' || platform === 'app-plus'
}

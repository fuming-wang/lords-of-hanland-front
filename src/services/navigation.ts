// 登录/登出跳转的统一切口。
//
// uni-app H5 当前运行时(2026-08-13 版)的 reLaunch/redirectTo 存在缺陷:
// 路由 URL 会切换,但目标页面不会真正挂载(旧页面残留)。因此 H5 上
// 降级为 navigateTo——登录页的 onShow 守卫会把"返回"弹回游戏内,页面
// 栈最多保持在 2 层。小程序/App 平台没有此缺陷,仍使用 reLaunch 以保持
// "关闭所有页面"的语义(登出后无法返回已退出账号的页面)。
export function relaunch(url: string): void {
  // #ifdef H5
  uni.navigateTo({ url })
  // #endif
  // #ifndef H5
  uni.reLaunch({ url })
  // #endif
}

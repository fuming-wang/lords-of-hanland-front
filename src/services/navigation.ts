// 登录/登出跳转的统一切口。
//
// uni-app H5 当前运行时(2026-08-13 版)的 reLaunch/redirectTo 存在缺陷:
// 路由 URL 会切换,但目标页面不会真正挂载(旧页面残留)。因此 H5 上
// 页面栈只有一层时降级为 navigateTo;栈更深时(登出/401 回登录页)改用
// 整页跳转强制重建页面栈——登录/游戏闭环有 5 层,反复登录登出会把栈推到
// H5 的 10 层上限,navigateTo 会静默失败。小程序/App 平台没有此缺陷,
// 仍使用 reLaunch 以保持"关闭所有页面"的语义(登出后无法返回已退出账号的页面)。
export function relaunch(url: string): void {
  // #ifdef H5
  if (getCurrentPages().length > 1) {
    window.location.hash = '#' + url
    window.location.reload()
    return
  }
  uni.navigateTo({ url })
  // #endif
  // #ifndef H5
  uni.reLaunch({ url })
  // #endif
}

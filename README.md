# Lords of Hanland Frontend

《汉土领主》前端，基于 Vue 3、TypeScript 和 uni-app，使用同一套业务代码构建：

- Web：H5
- Android：uni-app App-Android
- 小程序：当前默认微信小程序，可扩展到其他小程序平台

## 技术栈

- Vue 3 + TypeScript
- uni-app + Vite
- CSS Variables 响应式主题
- src/platform 统一封装平台差异
- src/services 统一封装 API 请求

## 环境要求

- Node.js 18.20+ 或 20+
- npm 9+
- Android：HBuilderX（用于运行到 Android 真机、模拟器或云打包）
- 微信小程序：微信开发者工具

首次安装依赖：

    npm install

## 本地开发

    # Web/H5
    npm run dev:h5

    # 微信小程序
    npm run dev:mp-weixin

    # App-Android/App 资源
    npm run dev:app

### 各端预览

- H5：浏览器打开终端输出的本地地址。
- 微信小程序：将 dist/dev/mp-weixin 导入微信开发者工具。
- Android：使用 HBuilderX 打开项目，运行到 Android 模拟器或真机；也可以打开 dist/dev/app 进行 App 调试。

## 构建发布

    # 构建 Web
    npm run build:h5

    # 构建微信小程序
    npm run build:mp-weixin

    # 构建 App 资源
    npm run build:app

构建产物位于 dist/：

- dist/build/h5：部署到 Nginx、CDN 或静态托管服务
- dist/build/mp-weixin：导入微信开发者工具上传审核
- dist/build/app：使用 HBuilderX 运行、云打包或进一步制作 Android 安装包

> build:app 生成的是 uni-app App 资源，并不等同于已经签名的 APK。正式 Android 包需要在 HBuilderX 配置包名、证书、权限和图标后进行云打包或本地打包。

## 环境变量

复制 .env.example 为 .env.development 或 .env.production，按环境修改：

    VITE_API_BASE_URL=https://api.example.com
    VITE_GAME_NAME=lords-of-hanland

只有以 VITE_ 开头的变量会被前端读取。不要把密钥、私钥或服务端 Token 写入环境变量并打包到前端。

## 目录结构

    src/
    ├─ pages/              # 页面
    ├─ services/           # API 和业务服务
    ├─ platform/           # 平台能力与平台判断
    ├─ styles/             # 全局样式
    ├─ App.vue
    ├─ main.ts
    ├─ manifest.json       # uni-app 应用配置
    └─ pages.json          # 页面与分包配置

## 开发约定

1. 页面放在 src/pages，并同步维护 src/pages.json。
2. 网络请求统一放在 src/services，页面不要直接拼接 API 地址。
3. 平台专属逻辑放在 src/platform，使用条件编译或统一适配函数隔离。
4. 真正接入战斗、地图等重度游戏画面时，建议将渲染模块封装为独立组件，并评估 WebGL、Canvas 和小程序基础库版本差异。
5. 发布前分别在目标端验证登录、支付、分享、资源加载、横竖屏和返回键行为。

## 进入游戏的流程（分区 / 角色）

后端是**单库多区**：所有分区共用同一套地图与数值配置，账号全局唯一，角色按
`server_id` 归属分区，角色名在分区内唯一、跨区可重名，每账号每分区最多 3 个角色。
因此客户端必须"先选区、再选角"：

1. 登录/注册（`POST /accounts`、`POST /auth/login`）→ 进入 `pages/index/index` 主菜单；
2. 「进入游戏」→ 选区页：`GET /servers`（**公开接口，无需 token**）拉取分区列表，
   每项显示分区名与状态；只有 `open` 的分区可点，「维护中 / 已关闭」置灰并提示原因；
3. 「进入游戏」→ 选角页：`GET /roles?server_id=<所选分区>` 拉取该账号在此分区的角色
   （最多 3 个槽位，空槽「新建角色」）；
4. 选角 → `POST /roles/{id}/select`（后端校验归属与分区状态，维护/关闭返回 409）→ 进入游戏；
5. 建角 → `POST /roles {"server_id","name","class","sex","image"}`：角色名 ≤6 字、
   职业取 `武士`/`文人`/`异人`、头像样式写入 `image`、性别由头像推导；建好后自动进入角色。

所选分区与当前角色保存在本地会话（`src/services/session.ts`）：
`lords_hanland_zone`（分区）与 `lords_hanland_role`（角色摘要），登出时一并清除；
选区页进入时会自动选中上次进入的分区（若仍开放）。

分区相关接口封装在 `src/services/zone.ts`，角色相关接口在 `src/services/role.ts`，
两处的错误文案映射（`translateZoneError` / `translateRoleError`）覆盖了后端的
`server: server is not open`、`role: name already taken`、`role: account role limit exceeded` 等。

## 下一步建议

- 在 .env.* 中配置后端 API 地址。
- 用真实接口替换 src/services/game.ts 中的演示请求。
- 在 src/manifest.json 中补充 App 图标、包名和 Android 权限。
- 在微信开发者工具中补充 AppID，并配置业务域名、上传域名和合法域名。
- 游戏内页面（角色/物品/副将/邮件等）目前多为静态演示，接入真实数据时可统一读取
  `getSelectedZone()` 与 `getActiveRole()` 得到当前分区与角色。

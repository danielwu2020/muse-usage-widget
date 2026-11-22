# Muse 用量小组件

Scripting（iOS）小组件，显示 Muse 每周免费额度用了百分之几、什么时候重置、额外 token 还剩多少。

## 文件

- `index.tsx` — App 入口（在 App 里打开时显示）
- `widget.tsx` — 主屏幕小组件
- `app_intents.tsx` — “刷新”按钮的 Intent（点一下立刻重新抓数据）
- `usage.ts` — 用量接口地址和读取请求

## 数据来源

同步配置完成后，Muse 的定时任务每两小时向个人 Cloudflare Worker 上传用量。小组件向 iOS 请求每 10 分钟刷新一次，实际时间由系统决定。点“刷新”按钮会请求重新读取 Worker 中最近一次成功上传的数据。

## 在 Scripting 里用（远程资源拉取）

1. 在 Scripting 里新建一个项目（空壳就行）。
2. 打开项目设置 → 远程资源，粘贴这个仓库的链接。
3. 打开自动更新，点“立即更新”，代码就拉下来了。
4. 在 Scripting 中运行一次脚本，按提示输入 Worker 的只读密钥。密钥保存在本机钥匙串。
5. 把 Scripting 小组件添加到主屏幕，并选择该脚本。

## 注意

- 此仓库沿用 [原作者的小组件](https://github.com/nnyzjh/muse-usage-widget)。
- `usage.ts` 只配置 Worker 的 HTTPS 地址。上传密钥由 Muse 使用，只读密钥由 Scripting 使用。

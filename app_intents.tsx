// Muse 用量小组件（app_intents.tsx）
// 和 widget.tsx 放同一个项目。
// 作用：点一下小组件上的“刷新”按钮，重新抓用量并刷新小组件。

import { AppIntentManager, AppIntentProtocol, Widget } from "scripting"

export const RefreshUsageIntent = AppIntentManager.register({
  name: "RefreshUsageIntent",
  protocol: AppIntentProtocol.AppIntent,
  perform: async () => {
    Widget.reloadAll()
  },
})

// Muse 用量（index.tsx）
// 点开 App 看用量。数据来自自己的 Cloudflare Worker。
// 注意：小组件的代码要放在 widget.tsx 里，不是这个文件。

import { Navigation, NavigationStack, VStack, Spacer, Text, Script, Widget } from "scripting"
import { READ_TOKEN_KEY, requestUsage } from "./usage"

async function configureReadToken() {
  const token = (await Dialog.prompt({
    title: "配置 Muse 用量",
    message: "请输入小组件的只读密钥。",
    obscureText: true,
  }))?.trim()
  if (!token) return null

  const response = await requestUsage(token).catch(() => null)
  if (response?.status !== 404 && !response?.ok) {
    const message = response?.status === 401 ? "只读密钥无效，请重新打开脚本再试。" : "无法连接用量服务，请稍后重试。"
    await Dialog.alert({ title: "设置失败", message })
    return null
  }
  if (!Keychain.set(READ_TOKEN_KEY, token)) {
    await Dialog.alert({ title: "设置失败", message: "无法将只读密钥保存到钥匙串。" })
    return null
  }
  Widget.reloadAll()
  return response
}

// 把 "Nov 19 at 12:02 PM CST" 转成中文 "11月19日 中午12:02"。
// 解析不到就原样返回，不报错。
const MONTHS: Record<string, number> = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 }

function formatReset(s: string): string {
  const m = s.match(/(\w{3}) (\d+) at (\d+):(\d+) (AM|PM)/)
  if (!m) return s
  const month = MONTHS[m[1]] || 0
  const day = m[2]
  const hour = parseInt(m[3], 10)
  const min = m[4]
  const ampm = m[5]
  let period = ""
  if (ampm === "AM") {
    period = hour < 6 ? "凌晨" : "上午"
  } else {
    if (hour === 12) period = "中午"
    else if (hour < 6) period = "下午"
    else period = "晚上"
  }
  return month + "月" + day + "日 " + period + hour + ":" + min
}

function HomeView({ data }: { data: any }) {
  if (!data) {
    return (
      <VStack>
        <Text font="headline" fontWeight={"bold"}>Muse 用量</Text>
        <Text font="caption">读取失败，请检查网络后重新打开</Text>
      </VStack>
    )
  }
  return (
    <VStack>
      <Text font="caption">Muse 用量 / Usage</Text>
      <Text font="largeTitle" fontWeight={"bold"}>{data.weeklyUsed}%</Text>
      <Text font="caption">本周免费额度已用</Text>
      <Spacer />
      <Text>重置：{formatReset(data.weeklyReset)}</Text>
      <Text>额外 token：{data.extraLeft} 剩余（{data.extraUsed}% 已用）</Text>
    </VStack>
  )
}

function App({ data }: { data: any }) {
  return (
    <NavigationStack>
      <HomeView data={data} />
    </NavigationStack>
  )
}

async function run() {
  try {
    const token = Keychain.get(READ_TOKEN_KEY)
    let response = token ? await requestUsage(token).catch(() => null) : null
    if (!token || response?.status === 401) response = await configureReadToken()
    const data = response?.ok ? await response.json().catch(() => null) : null
    await Navigation.present({ element: <App data={data} />, modalPresentationStyle: "pageSheet" })
  } finally {
    Script.exit()
  }
}

run()

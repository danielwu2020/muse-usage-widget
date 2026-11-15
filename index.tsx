// Muse 用量（index.tsx）
// 点开 App 看用量。数据来自 https://muse.562156080.workers.dev/。
// 注意：小组件的代码要放在 widget.tsx 里，不是这个文件。

import { Navigation, NavigationStack, VStack, Spacer, Text, Script } from "scripting"

const USAGE_URL = "https://muse.562156080.workers.dev/"

async function fetchUsage(): Promise<any> {
  const r = await fetch(USAGE_URL, { timeout: 10 })
  if (!r.ok) throw new Error("HTTP " + r.status)
  return r.json()
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
  const data = await fetchUsage().catch(() => null)
  await Navigation.present({ element: <App data={data} />, modalPresentationStyle: "pageSheet" })
  Script.exit()
}

run()

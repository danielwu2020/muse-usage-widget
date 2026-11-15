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
      <Text>重置：{data.weeklyReset}</Text>
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

// Muse 用量小组件（widget.tsx）
// 显示本周免费额度用了百分之几、什么时候重置、额外 token 还剩多少。
// 数据来自 https://muse.562156080.workers.dev/（Noah 的 Worker）。
// 点“刷新”按钮重新抓一次。数据每 10 分钟自动刷新。
// 和 app_intents.tsx 放同一个项目。先把 widget.tsx 里原来的内容全删掉，再导入这一份。

import { HStack, VStack, Spacer, Text, Image, Button, Script, Widget } from "scripting"
import { RefreshUsageIntent } from "./app_intents"

const USAGE_URL = "https://muse.562156080.workers.dev/"

function usageColor(pct: number): "systemGreen" | "systemYellow" | "orange" | "systemRed" {
  if (pct <= 50) return "systemGreen"
  if (pct <= 80) return "systemYellow"
  if (pct <= 95) return "orange"
  return "systemRed"
}

async function fetchUsage(): Promise<any> {
  const r = await fetch(USAGE_URL, { timeout: 10 })
  if (!r.ok) throw new Error("HTTP " + r.status)
  return r.json()
}

function WidgetView({ data }: { data: any }) {
  if (!data) {
    return (
      <VStack>
        <Text font="headline" fontWeight={"bold"}>Muse 用量</Text>
        <Text font="caption">读取失败，点刷新重试</Text>
        <Spacer />
        <Button intent={RefreshUsageIntent(undefined)}>
          <HStack>
            <Image systemName="arrow.clockwise" />
            <Text>刷新</Text>
          </HStack>
        </Button>
      </VStack>
    )
  }
  const pct = data.weeklyUsed
  return (
    <VStack>
      <Text font="caption">Muse 用量 / Usage</Text>
      <Text styledText={{ font: "largeTitle", bold: true, foregroundColor: usageColor(pct), content: pct + "%" }} />
      <Text font="caption">本周免费额度已用</Text>
      <Spacer />
      <Text font="caption">重置：{data.weeklyReset}</Text>
      <Text font="caption">额外 token：{data.extraLeft} 剩余（{data.extraUsed}% 已用）</Text>
      <Button intent={RefreshUsageIntent(undefined)}>
        <HStack>
          <Image systemName="arrow.clockwise" />
          <Text>刷新</Text>
        </HStack>
      </Button>
    </VStack>
  )
}

async function main() {
  try {
    const data = await fetchUsage().catch(() => null)
    Widget.present(<WidgetView data={data} />, {
      policy: "after",
      date: new Date(Date.now() + 10 * 60 * 1000),
    })
  } finally {
    Script.exit()
  }
}

void main()

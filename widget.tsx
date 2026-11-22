// Muse 用量小组件（widget.tsx）
// 显示本周免费额度用了百分之几、什么时候重置、额外 token 还剩多少。
// 数据来自自己的 Cloudflare Worker。
// 点“刷新”按钮重新抓一次。数据每 10 分钟自动刷新。
// 和 app_intents.tsx 放同一个项目。先把 widget.tsx 里原来的内容全删掉，再导入这一份。

import { HStack, VStack, Spacer, Text, Image, Button, Script, Widget } from "scripting"
import { RefreshUsageIntent } from "./app_intents"
import { READ_TOKEN_KEY, requestUsage } from "./usage"

function usageColor(pct: number): "systemGreen" | "systemYellow" | "orange" | "systemRed" {
  if (pct <= 50) return "systemGreen"
  if (pct <= 80) return "systemYellow"
  if (pct <= 95) return "orange"
  return "systemRed"
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

function WidgetView({ data, needsSetup }: { data: any; needsSetup: boolean }) {
  if (!data) {
    return (
      <VStack>
        <Text font="headline" fontWeight={"bold"}>Muse 用量</Text>
        <Text font="caption">{needsSetup ? "请在 Scripting 中打开脚本，设置只读密钥" : "读取失败，点刷新重试"}</Text>
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
      <Text font="caption">重置：{formatReset(data.weeklyReset)}</Text>
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
    const token = Keychain.get(READ_TOKEN_KEY)
    const response = token ? await requestUsage(token).catch(() => null) : null
    const data = response?.ok ? await response.json().catch(() => null) : null
    const needsSetup = !token || response?.status === 401
    Widget.present(<WidgetView data={data} needsSetup={needsSetup} />, {
      policy: "after",
      date: new Date(Date.now() + 10 * 60 * 1000),
    })
  } finally {
    Script.exit()
  }
}

void main()

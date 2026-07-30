import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleHelp,
  Database,
  ExternalLink,
  KeyRound,
  Library,
  Music2,
  Play,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from "lucide-react";

const syncShortcutUrl =
  process.env.NEXT_PUBLIC_SYNC_SHORTCUT_URL ??
  "https://www.icloud.com/shortcuts/e355efaa5f7147409fc511d54f20e8f2";
const queueShortcutUrl =
  process.env.NEXT_PUBLIC_QUEUE_SHORTCUT_URL ??
  "https://www.icloud.com/shortcuts/ff3fd03e1f0f4ecc8e0290bd801bb836";

const steps = [
  {
    number: "01",
    color: "#c8ff4d",
    icon: Smartphone,
    title: "安装两个快捷指令",
    body: "一个负责读取你的 Apple Music 资料库，另一个负责把网页选出的歌曲送回 Music App。",
  },
  {
    number: "02",
    color: "#e9e7ff",
    icon: KeyRound,
    title: "生成配对码",
    body: "回到首页，点击右上角资料库状态，再点击“生成配对码”。配对码60分钟内有效，并且只能使用一次。",
  },
  {
    number: "03",
    color: "#ffb4bb",
    icon: Library,
    title: "同步音乐资料库",
    body: "运行资料库同步快捷指令，输入网页显示的六位数字。首次运行时，请允许快捷指令访问媒体与 Apple Music。",
  },
  {
    number: "04",
    color: "#b9e6ff",
    icon: Sparkles,
    title: "说出你现在想听什么",
    body: "可以描述歌手、数量、语言、节奏、时间、场景或情绪，例如“下班路上听三首轻松的女团歌曲”。",
  },
  {
    number: "05",
    color: "#c8ff4d",
    icon: Play,
    title: "在 Apple Music 中播放",
    body: "确认推荐结果后点击播放按钮。网页会启动播放快捷指令，在本机资料库中匹配歌曲并交给 Music App。",
  },
];

const troubleshooting = [
  {
    question: "刷新网页后，资料库会消失吗？",
    answer:
      "同一浏览器会使用本地保存的随机令牌重新载入资料库。无痕模式、换浏览器或清除网站数据后需要重新同步。",
  },
  {
    question: "为什么网页显示的歌曲数量不对？",
    answer:
      "检查同步快捷指令中的 Find Music 是否关闭了 Limit，然后重新生成配对码并运行一次完整同步。",
  },
  {
    question: "点击播放后没有找到歌曲怎么办？",
    answer:
      "网页只会播放本机资料库中的匹配歌曲。同名版本、现场版或合作艺人的元数据不同，可能导致快捷指令无法精确匹配。",
  },
  {
    question: "需要 Apple Developer Program 吗？",
    answer:
      "不需要。资料库读取和播放都由你安装在 iPhone 上的快捷指令完成，网站不会直接登录或控制你的 Apple Music 账户。",
  },
];

export default function GuidePage() {
  return (
    <main className="min-h-screen bg-[#f7f7fb] text-[#15151a]">
      <nav className="border-b-2 border-[#15151a] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 rotate-[-4deg] items-center justify-center rounded-xl border-2 border-[#15151a] bg-[#635bff] text-white shadow-[3px_3px_0_#15151a]">
              <Music2 className="h-5 w-5" />
            </span>
            <span className="font-black">Music Companion</span>
          </Link>
          <Link href="/" className="flex items-center gap-2 rounded-full border-2 border-[#15151a] bg-white px-4 py-2 text-sm font-bold">
            <ArrowLeft className="h-4 w-4" />
            返回首页
          </Link>
        </div>
      </nav>

      <section className="mx-auto max-w-6xl px-5 pb-24 pt-14 md:px-8 md:pt-20">
        <div className="max-w-4xl">
          <span className="inline-flex rotate-[-2deg] items-center gap-2 rounded-full border-2 border-[#15151a] bg-[#ffb4bb] px-3 py-1.5 text-xs font-black shadow-[2px_2px_0_#15151a]">
            <CircleHelp className="h-4 w-4" />
            START HERE
          </span>
          <h1 className="mt-6 text-5xl font-black leading-[0.98] tracking-[-0.055em] md:text-7xl">
            五分钟，把你的音乐
            <br />
            <span className="text-[#635bff]">真正用起来。</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base font-medium leading-7 text-[#656570] md:text-lg">
            Music Companion 不会代替 Apple Music。它负责理解你此刻的需求，从个人资料库找歌，再让 iPhone 快捷指令完成同步与播放。
          </p>
        </div>

        <section className="mt-12 grid gap-4 md:grid-cols-2">
          <a href={syncShortcutUrl} target="_blank" rel="noreferrer" className="group rounded-[24px] border-2 border-[#15151a] bg-[#c8ff4d] p-6 shadow-[5px_5px_0_#15151a] transition hover:-translate-y-1">
            <div className="flex items-start justify-between gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-[#15151a] bg-white"><Database className="h-6 w-6" /></span>
              <ExternalLink className="h-5 w-5" />
            </div>
            <h2 className="mt-8 text-xl font-black">安装资料库同步快捷指令</h2>
            <p className="mt-2 text-sm font-medium leading-6 text-[#42452f]">读取歌曲名称、歌手、专辑等元数据，并通过一次性配对码同步到网页。</p>
          </a>
          <a href={queueShortcutUrl} target="_blank" rel="noreferrer" className="group rounded-[24px] border-2 border-[#15151a] bg-[#ffb4bb] p-6 shadow-[5px_5px_0_#15151a] transition hover:-translate-y-1">
            <div className="flex items-start justify-between gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-[#15151a] bg-white"><Play className="h-6 w-6" /></span>
              <ExternalLink className="h-5 w-5" />
            </div>
            <h2 className="mt-8 text-xl font-black">安装 Apple Music 播放快捷指令</h2>
            <p className="mt-2 text-sm font-medium leading-6 text-[#604045]">接收网页选出的歌曲，在本机资料库中匹配，并交给 Music App 播放。</p>
          </a>
        </section>

        <section className="mt-20">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black text-[#635bff]">HOW IT WORKS</p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.035em]">第一次使用</h2>
            </div>
            <p className="hidden text-sm font-bold text-[#858590] md:block">按顺序完成 01–05</p>
          </div>
          <div className="mt-7 space-y-4">
            {steps.map(({ number, color, icon: Icon, title, body }) => (
              <article key={number} className="grid gap-5 rounded-[22px] border-2 border-[#15151a] bg-white p-5 md:grid-cols-[72px_52px_1fr] md:items-center md:p-6">
                <span style={{ backgroundColor: color }} className="flex h-12 w-16 rotate-[-3deg] items-center justify-center rounded-xl border-2 border-[#15151a] text-sm font-black shadow-[2px_2px_0_#15151a]">{number}</span>
                <Icon className="hidden h-6 w-6 md:block" />
                <div>
                  <h3 className="text-lg font-black">{title}</h3>
                  <p className="mt-1 text-sm font-medium leading-6 text-[#656570]">{body}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-20 grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
          <div className="rounded-[24px] border-2 border-[#15151a] bg-[#635bff] p-6 text-white shadow-[5px_5px_0_#15151a]">
            <ShieldCheck className="h-8 w-8" />
            <h2 className="mt-8 text-2xl font-black">你的音乐，仍然是你的</h2>
            <p className="mt-3 text-sm font-medium leading-6 text-white/80">
              网站只保存歌曲元数据，不上传音频或封面，也不需要你的 Apple ID 密码。配对码一次性使用，网页不采集浏览器指纹。
            </p>
          </div>
          <div>
            <p className="text-xs font-black text-[#635bff]">QUICK HELP</p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.035em]">常见问题</h2>
            <div className="mt-6 space-y-3">
              {troubleshooting.map((item) => (
                <details key={item.question} className="group rounded-2xl border-2 border-[#15151a] bg-white p-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-black">
                    {item.question}
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e9e7ff] transition group-open:rotate-90"><ArrowRight className="h-4 w-4" /></span>
                  </summary>
                  <p className="mt-4 border-t-2 border-[#15151a]/10 pt-4 text-sm font-medium leading-6 text-[#656570]">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-20 rounded-[28px] border-2 border-[#15151a] bg-[#c8ff4d] p-7 text-center shadow-[6px_6px_0_#15151a] md:p-10">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#15151a] bg-white"><Check className="h-6 w-6" /></span>
          <h2 className="mt-5 text-3xl font-black">准备好了吗？</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm font-medium leading-6">安装快捷指令、同步资料库，然后说出你现在想听什么。</p>
          <Link href="/" className="mt-6 inline-flex items-center gap-2 rounded-full border-2 border-[#15151a] bg-[#15151a] px-5 py-3 text-sm font-black text-white">
            回到首页开始
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </section>
    </main>
  );
}

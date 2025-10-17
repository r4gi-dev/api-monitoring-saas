import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ShieldAlert, Users, Gauge, LayoutDashboard, ArrowRight } from 'lucide-react'

const features = [
  {
    icon: <ShieldAlert className="h-8 w-8 text-primary" />,
    title: "エラーログ管理",
    description: "発生したエラーを自動で収集・分類。深刻度の高いエラーを即座に特定し、トラブルの早期発見を支援します。",
  },
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: "アクセスモニタリング",
    description: "利用者数やアクセス頻度をリアルタイムに可視化。トラフィックの偏りや人気機能を簡単に分析できます。",
  },
  {
    icon: <Gauge className="h-8 w-8 text-primary" />,
    title: "パフォーマンス監視",
    description: "各APIエンドポイントのレスポンス速度や失敗率を記録し、サービスのボトルネックを迅速に把握します。",
  },
  {
    icon: <LayoutDashboard className="h-8 w-8 text-primary" />,
    title: "統合ダッシュボード",
    description: "全情報をシンプルで見やすい管理画面に集約。サービスの状況を一目で把握できるUIを提供します。",
  },
]

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex items-center">
            <LayoutDashboard className="h-6 w-6 mr-2" />
            <span className="font-bold">API Monitor</span>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <Link href="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-32">
          <div className="container text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6">
              あなたのAPI、止まっていませんか？
            </h1>
            <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground mb-8">
              API Monitorは、エラーログ、アクセス、パフォーマンスをリアルタイムで可視化し、トラブルの早期発見とサービス改善を支援する開発者向けツールです。
            </p>
            <Link href="/dashboard">
              <Button size="lg">
                今すぐ無料で始める <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 md:py-28 bg-muted/40">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">サービスを安定稼働させるための全てを</h2>
              <p className="max-w-2xl mx-auto mt-4 text-muted-foreground">
                開発・運用中のサービスに組み込むだけで、誰でも簡単に高度なモニタリングを開始できます。
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <div key={index} className="p-6 bg-background rounded-lg shadow-sm">
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 md:py-28">
          <div className="container text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">さあ、始めましょう</h2>
            <p className="max-w-xl mx-auto text-muted-foreground mb-8">
              今すぐ登録して、あなたのサービスを次のレベルへ。安定稼働はここから始まります。
            </p>
            <Link href="/dashboard">
              <Button size="lg" variant="default">
                ダッシュボードへ移動
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="container flex items-center justify-center h-16">
          <p className="text-sm text-muted-foreground">
            &copy; 2025 API Monitor. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
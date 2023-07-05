import './globals.css'
import { Noto_Sans_JP, Roboto } from 'next/font/google'

const roboto = Roboto({ weight: "400", subsets: ['latin'] })

export const metadata = {
  title: 'Qiita Engineer Festa 2023 Monitor',
  description: 'Qiita Engineer Festa 2023 を観測します',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={roboto.className}>{children}</body>
    </html>
  )
}

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
      <body>{children}</body>
    </html>
  )
}

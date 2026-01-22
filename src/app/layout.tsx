export const metadata = {
  title: 'wlasne.ai',
  description: 'Twoje Własne AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pl">
      <body style={{ margin: 0, padding: 0, backgroundColor: '#ffffff' }}>{children}</body>
    </html>
  )
}

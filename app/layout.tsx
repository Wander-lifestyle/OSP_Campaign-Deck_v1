import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Campaign Deck | Editorial OS',
  description: 'Track campaign lifecycle from intake to shipped',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}

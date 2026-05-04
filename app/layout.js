import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
})

export const metadata = {
  title: 'WRD Photography — Phnom Penh & Cambodia',
  description: 'Street and rural photography from Cambodia by WRD Photography.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: jakarta.style.fontFamily }}>
        {children}
      </body>
    </html>
  )
}

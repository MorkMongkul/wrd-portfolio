import { JetBrains_Mono, Libre_Caslon_Display, Manrope } from 'next/font/google'
import './globals.css'

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-manrope',
  display: 'swap',
})

const caslon = Libre_Caslon_Display({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-caslon-display',
  display: 'swap',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains-mono',
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
      <body className={`${manrope.variable} ${caslon.variable} ${jetbrains.variable}`}>
        {children}
      </body>
    </html>
  )
}

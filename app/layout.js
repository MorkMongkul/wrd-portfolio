import { Outfit, Inter, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500'],
  variable: '--font-outfit',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-inter',
})

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '700', '800'],
  style: ['normal', 'italic'],
  variable: '--font-jakarta',
})

export const metadata = {
  title: 'WRD Photography — Phnom Penh & Cambodia',
  description: 'Street and rural photography from Cambodia by WRD Photography.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} ${inter.variable} ${plusJakarta.variable}`}>
        {children}
      </body>
    </html>
  )
}

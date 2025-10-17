import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { UserProvider } from '../contexts/UserContext'
import Navbar from '../components/Navbar'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <UserProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto px-4 py-6 w-full">
          <Component {...pageProps} />
        </main>
      </div>
    </UserProvider>
  )
}

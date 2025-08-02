import { Navbar } from "@/common/navbar"
import Footer from "@/components/common/Footer"
import FooterModals from "@/components/modals/FooterModals"
import { ModalProvider } from "@/contexts/ModalContext"

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <ModalProvider>
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <FooterModals />
      </div>
    </ModalProvider>
  )
}
import { Sidebar } from '@/components/layout/Sidebar'
import { MobileNav } from '@/components/layout/MobileNav'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative h-screen overflow-hidden bg-gray-50">
      {/* Desktop sidebar */}
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-80 bg-gray-900">
        <Sidebar />
      </div>

      {/* Mobile top bar + drawer */}
      <MobileNav />

      <main className="md:pl-72 h-full overflow-y-auto pt-14 md:pt-0">
        {children}
      </main>
    </div>
  )
}

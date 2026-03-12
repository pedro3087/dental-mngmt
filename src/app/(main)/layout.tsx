import { Sidebar } from '@/components/layout/Sidebar'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative h-screen overflow-hidden bg-gray-50">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-80 bg-gray-900">
        <Sidebar />
      </div>
      <main className="md:pl-72 h-full overflow-y-auto">
        {children}
      </main>
    </div>
  )
}

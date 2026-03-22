import { PageLoader } from '@/shared/components/PageLoader'

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <PageLoader />
    </div>
  )
}

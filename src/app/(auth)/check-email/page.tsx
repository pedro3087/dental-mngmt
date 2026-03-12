import Link from 'next/link'

export default function CheckEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Check your email</h1>
          <p className="mt-2 text-gray-600">
            We've sent you a verification link. Please check your inbox and spam folder.
          </p>
        </div>

        <div className="pt-4 text-center">
          <Link href="/login" className="text-sm text-blue-600 hover:underline">
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  )
}

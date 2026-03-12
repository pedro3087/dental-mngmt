import Link from 'next/link'
import { ForgotPasswordForm } from '@/features/auth/components'

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Reset Password</h1>
          <p className="mt-2 text-gray-600">
            Enter your email and we'll send you a link to reset your password.
          </p>
        </div>

        <ForgotPasswordForm />

        <div className="pt-4 text-center">
          <Link href="/login" className="text-sm text-blue-600 hover:underline">
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  )
}

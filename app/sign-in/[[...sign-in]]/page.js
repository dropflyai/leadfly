import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-dark-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <SignIn 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-white shadow-2xl",
              headerTitle: "text-2xl font-bold",
              headerSubtitle: "text-gray-600",
              socialButtonsBlockButton: "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 w-full flex items-center justify-center space-x-3 px-4 py-3 rounded-lg font-semibold transition-all duration-300 shadow-sm hover:shadow-md",
              formButtonPrimary: "bg-electric-500 hover:bg-electric-600 text-white w-full py-3 rounded-lg font-semibold transition-all duration-300",
              formFieldInput: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-electric-500 focus:outline-none focus:ring-2 focus:ring-electric-500/20",
              footerActionLink: "text-electric-500 hover:text-electric-600 font-semibold",
            }
          }}
        />
      </div>
    </div>
  )
}
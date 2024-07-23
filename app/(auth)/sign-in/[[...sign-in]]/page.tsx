import { SignIn } from '@clerk/nextjs'
import React from 'react'

const Signin = () => {
  return (
    <main className="auth-page">
        <SignIn />
    </main>
  )
}

export default Signin

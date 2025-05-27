import React, { Suspense, useEffect } from 'react'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

import './App.css'

// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))
const Protected = React.lazy(() => import('../src/components/Protected/Protected'))
// Pages
const Login = React.lazy(() => import('./pages/auth/Login'))
const Register = React.lazy(() => import('./pages/auth/Register'))
const VerifyOtp = React.lazy(() => import('./pages/auth/VerifyOtp'))
const ForgotPassword = React.lazy(() => import('./pages/auth/ForgotPassword'))
const ResetPassword = React.lazy(() => import('./pages/auth/ResetPassword'))
// const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))
// const Page500 = React.lazy(() => import('./views/pages/page500/Page500'))
function App() {

  return (
   
    <BrowserRouter future={{ v7_startTransition: true }}>
      <Suspense
        fallback={
          <div className="pt-3 text-center">
            <p>Loading</p>
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route exact path="/login" name="Login" element={<Login />} />
          <Route path="verifyotp" element={<VerifyOtp />} />
          <Route path="/forgotPassword" element={<ForgotPassword />} />
          <Route path="set-Password" element={<ResetPassword />} />
          {/* <Route exact path="/404" name="Page 404" element={<Page404 />} />
          <Route exact path="/500" name="Page 500" element={<Page500 />} /> */}
          <Route
            path="*"
            name="Home"
            element={
              <Protected>
                <DefaultLayout />
              </Protected>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App

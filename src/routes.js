import React from 'react'
import Home from './components/home'

const Profile = React.lazy(() => import('./components/Profile'))

// const Users = React.lazy(() => import('./views/users/Users'))

const routes = [
  { path: '/home', exact: true, name: 'Home', element: Home  },
  { path: '/profile', name: 'Profile', element: Profile },
  // { path: '/users', name: 'Users', element: Users },
]

export default routes

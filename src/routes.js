import React from 'react'
import Home from './components/home'

const Profile = React.lazy(() => import('./pages/Profile/Profile'))
const Login = React.lazy(() => import('./pages/auth/Login'))

const AddPost = React.lazy(() => import('./components/Post/AddPost'))

// const Users = React.lazy(() => import('./views/users/Users'))

const routes = [
  { path: '/', exact: true, element: Login  },
  { path: '/profile', name: 'Profile', element: Profile },
  { path: '/home', name: 'Home', element: Home },
  
  { path: '/addPost', name: 'Home', element: AddPost },
  // { path: '/users', name: 'Users', element: Users },
]

export default routes

import React from 'react'
import Home from './components/home'
import PostUploadModal from './components/post/PostUploadModal'

const Profile = React.lazy(() => import('./components/Profile/Profile'))
const Login = React.lazy(() => import('./pages/auth/Login'))

const AddPost = React.lazy(() => import('./components/Post/AddPost'))

const routes = [
  { path: '/', exact: true, element: Login  },
  { path: '/profile', name: 'Profile', element: Profile },
  { path: '/home', name: 'Home', element: Home },
  { path: '/addPost', name: 'Home', element: AddPost },
  // { path: '/users', name: 'Users', element: Users },
]

export default routes

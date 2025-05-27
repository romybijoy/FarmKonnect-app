import React from 'react'
import Suggestions from './Suggestions'
import Feed from './Feed'

const Home = () => {
  return (
    <div className='d-flex vh-100'>
          <div className="w-50">
            <Feed />
          </div>
          <div className="w-50">
            <Suggestions />
          </div>
        </div>
  )
}

export default Home
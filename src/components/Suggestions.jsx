import React, { useState } from 'react'
import prof1 from '../assets/prof1.jpeg'
import prof2 from '../assets/prof4.jpeg'
import prof3 from '../assets/prof2.jpeg'
import prof4 from '../assets/prof3.jpeg'
import '../index.css'

function Suggestions() {
    const [suggestion, setSuggestion] =useState([
        {
            id: 1,
            user: "John Doe",
            img: prof1,
            status: "Follows you"
        },
        {
            id: 2,
            user: "Alice Bow",
            img: prof2,
            status: "Followed by Regha"
        },
        {
            id: 3,
            user: "Manoj",
            img: prof3,
            status: "Follows you"
        },
        {
            id: 2,
            user: "Albin Joe",
            img: prof4,
            status: "Follows you"
        },
    ]);
  return (
    <div className='suggestions w-75 m-4'>
      <div className='d-flex'>
        <p>Suggestions for you</p>
        <b className='ms-auto'>See All</b>
      </div>
      {suggestion.length > 0 ? (
      <div>
        {suggestion.map((suggestion) => (
            <div key={suggestion.id}>
                <div className='d-flex'>
                    <img src={suggestion.img} alt="Profile" className="sugn_picture rounded-circle"/>
                    <div className='profile-info'>
                        <p className='user'>{suggestion.user}</p>
                        <p className='profile-status'>{suggestion.status}</p>
                    </div>
                    <b className='connect text-primary ms-auto'>Connect</b>
                </div>
              </div>
        ))}
        
      </div>

      ): (
        <div>
            Loading
      </div>
      )}
    </div>
  )
}

export default Suggestions

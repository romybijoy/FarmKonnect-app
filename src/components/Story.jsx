import React, { useState } from 'react'
import prof1 from '../assets/prof1.jpeg'
import prof2 from '../assets/prof4.jpeg'
import prof3 from '../assets/prof2.jpeg'
import prof4 from '../assets/prof3.jpeg'
import '../index.css'

function Story() {

    const [stories, setStories] =useState([
            {
                id: 1,
                user: {
                    id: 1,
                    username: "John Doe",
                    img: prof1
                },
                img: prof1
            },
            {
                 id: 2,
                user: {
                    id: 2,
                    username: "Alice Bow",
                    img: prof4
                },
                img: prof1
            },
            {
                id: 3,
                user: {
                    id: 3,
                    username: "Manoj",
                    img: prof2
                },
                img: prof1
            },
            {
                id: 4,
                user: {
                    id: 4,
                    username: "Albin Joe",
                    img: prof3
                },
                img: prof1
            },
        ]);
  return (
    <div className='story d-flex'>
      {stories.length > 0 ? (
        stories.map((story) => (
            <div key={story.id} className='mx-1'>
                <div className='gradient-border'>
                    <img src={story.user.img} alt='dp' className='story-dp rounded-circle'/>
                </div>
                
                <p className='text-truncate' style={{width: "50px"}}>{story.user.username}</p>
            </div>
        ))
      ): (
        <p>Loading</p>
      )}
    </div>
  )
}

export default Story

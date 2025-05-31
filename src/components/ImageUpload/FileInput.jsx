import React, { useRef } from 'react'
import { Container } from 'react-bootstrap'

const FileInput = ({ onImageSelected }) => {
  const inputRef = useRef()

  const handleOnChange = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      const reader = new FileReader();
      reader.readAsDataURL(event.target.files[0])
      console.log()
      reader.onload = function (e) {
        onImageSelected({selectedImg: reader.result,
         imgName: event.target.files[0].name
        })
      };
    }
  };

  const onChooseImg = () => {
    inputRef.current.click()
  }

  return (
    <Container>
      {/* Hidden file input element */}
      <input
        type="file"
        accept="image/*"
        ref={inputRef}
        onChange={handleOnChange}
        style={{ display: 'none' }}
      ></input>

      {/* button to trigger file input dialauge */}
      {/* <button className="btn" > */}
      Upload Image <i className="fa fa-upload" aria-hidden="true" onClick={onChooseImg}></i>
      {/* </button> */}
    </Container>
  )
}

export default FileInput

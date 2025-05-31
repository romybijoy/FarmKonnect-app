import React, { useState } from 'react'
import { createPost } from '../../redux/slices/PostSlice'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Firebase } from '../../firebase/config'
import FormContainer from '../Form/FormContainer'
import { Alert, Button, Form, Image as image } from 'react-bootstrap'
import Loader from '../Loader/Loader'

// import FileInput from '../../components/ImageUpload/FileInput'

import { toast } from 'react-toastify'
import ImageCropper from '../../components/ImageUpload/ImageCropper'
import { useRef } from 'react'

const AddCategory = () => {
  const [formData, setFormData] = useState({
    name: '',
    desc: '',
    image: '',
  })
  const [image, setImage] = useState()
  const [currentPage, setCurrentPage] = useState('choose-img')
  const [imgAfterCrop, setImgAfterCrop] = useState('')
  const [validated, setValidated] = useState(false)
  const [valError, setValError] = useState('')
  const [imgName, setImgName] = useState('')

  const navigate = useNavigate()

  const dispatch = useDispatch()

  // const { categories, error, loading } = useSelector((state) => state.category)

  const handleInputChange = (e) => {
    const { name, value } = e.target

    setFormData({ ...formData, [name]: value })
  }

  const inputRef = useRef()

  const handleOnChange = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      const reader = new FileReader()
      reader.readAsDataURL(event.target.files[0])
      console.log()
      reader.onload = function (e) {
        setImage(reader.result)
        setImgName(event.target.files[0].name)
        setCurrentPage('crop-img')
      }
    }
  }

  

  // // Callback function when an image selected
  // const onImageSelected = (data) => {
  //   setImage(data.selectedImg)
  //   setImgName(data.imgName)
  //   // console.log(selectedImg)
  //   setCurrentPage('crop-img')
  //   setTouched(false)
  // }

  // Callback function when cropping is done
  const onCropDone = (imgCroppedArea) => {
    console.log(imgCroppedArea)
    const canvasEle = document.createElement('canvas')
    canvasEle.width = imgCroppedArea.width
    canvasEle.height = imgCroppedArea.height

    const context = canvasEle.getContext('2d')

    let imageObj1 = new Image()
    imageObj1.src = image
    imageObj1.onload = function () {
      context.drawImage(
        imageObj1,
        imgCroppedArea.x,
        imgCroppedArea.y,
        imgCroppedArea.width,
        imgCroppedArea.height,
        0,
        0,
        imgCroppedArea.width,
        imgCroppedArea.height,
      )

      const dataURL = canvasEle.toDataURL('image/jpeg')

      setImgAfterCrop(dataURL)
      setCurrentPage('img-cropped')
      Firebase.storage()
        .ref(`/post/${imgName}`)
        .putString(dataURL.split(',')[1], 'base64', { contentType: 'image/jpeg' })
        .then(({ ref }) => {
          ref.getDownloadURL().then((url) => {
            console.log(imgAfterCrop, url)
            setFormData({ ...formData, image: url })
          })
        })
    }
  }

  // Callback function when cropping is canceled
  const onCropCancel = () => {
    setCurrentPage('choose-img')
    setImage('')
  }

  const handleImageChange = (e) => {
    setImage(e.target.files[0])
    console.log(e.target.files[0])
    Firebase.storage()
      .ref(`/category/${e.target.files[0].name}`)
      .put(e.target.files[0])
      .then(({ ref }) => {
        ref.getDownloadURL().then((url) => {
          console.log(e.target.name, url)
          setFormData({ ...formData, [e.target.name]: url })
        })
      })
  }

  const handleSubmit = (e) => {
    const form = e.currentTarget

    if (form.checkValidity() === false) {
      e.preventDefault()
      e.stopPropagation()
      setValidated(true)
    } else {
      try {
        e.preventDefault()
        console.log(formData)
        dispatch(createCategory(formData))
        // Clear the form fields after successful registration
        setFormData({
          name: '',
          desc: '',
          image: '',
        })

        console.log(error)
        if (error === 400) {
          setValError('Field should not be blank')
        } else if (error === 409) {
          toast.error('Duplicate category name')
          navigate('/category')
        } else {
          toast.success('Category added successfully')
          navigate('/category')
        }
      } catch (err) {
        toast.error('Something happened')
      }
    }
  }

  return (
    <FormContainer className="p-3">
      <h1>Create Post</h1>

      {/* {valError && <Alert variant="danger">{valError}</Alert>} */}
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Form.Group className="my-2" controlId="name">
          <Form.Label>Content</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter content"
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            required
            multiple
          ></Form.Control>
          <Form.Control.Feedback type="invalid">Please enter content.</Form.Control.Feedback>
        </Form.Group>

       

        <Form.Group className="my-2" controlId="image">
          <Form.Label> Upload Image</Form.Label>
          <br />
          {/* <Image
            alt=""
            width="200px"
            height="200px"
            src={
              image ? formData.image === '' ? <p>Loading...</p> : URL.createObjectURL(image) : ''
            }
          ></Image>*/}

          <br />

          {/* <FileInput onImageSelected={onImageSelected} isInvalid={validated} /> */}

          <Form.Control
            type="file"
            accept="image/*"
            ref={inputRef}
            required
            isInvalid={validated && currentPage === 'crop-img'}
            onChange={handleOnChange}
            // style={{ display: 'none' }}
          ></Form.Control>
          {currentPage === 'crop-img' ? (
            <ImageCropper
              image={image}
              visible={true}
              onCropDone={onCropDone}
              onCropCancel={onCropCancel}
            />
          ) : (
            <div></div>
          )}

          <br />
          {currentPage === 'img-cropped' && (
            <div>
              <div>
                <img src={imgAfterCrop} width="200px" height="200px" />
              </div>
            </div>
          )}

          {/* <input type="file" name="image" onChange={handleImageChange} /> */}

          <Form.Control.Feedback type="invalid">Please choose an image</Form.Control.Feedback>
        </Form.Group>

        <Button type="submit" variant="primary" className="mt-3">
          Send
        </Button>
      </Form>
    </FormContainer>
  )
}

export default AddCategory

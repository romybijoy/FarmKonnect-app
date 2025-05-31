import React, { useState } from 'react'
import { Modal } from 'react-bootstrap'
import './cropper.css'

import Cropper from 'react-easy-crop'
import { CButton, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle } from '@coreui/react'

const ImageCropper = ({ image, onCropDone, onCropCancel, visible }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [show, setShow] = useState(visible)

  const [croppedArea, setCropppedArea] = useState(null)
  const [aspectRatio, setAspectRatio] = useState(4 / 3)

  const onCropComplete = (croppedAreaPercentage, croppedAreaPixels) => {
    //Store the cropped area in pixels
    setCropppedArea(croppedAreaPixels)
  }

  const onAspectRatioChange = (event) => {
    setAspectRatio(event.target.value)
  }

  return (
    <Modal
      show={show}
      onHide={() => setShow(false)}
      animation={false}
      size="lg"
      className="detail-ad-Modal"
      backdrop="static"
    >
      <Modal.Header className="mastr-mdl-hd" closeButton>
        <Modal.Title>
          <span className="modl-titl-align">Image crop</span>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="cropper">
          {/*       
        <div className="btn-container">
          <button className="btn btn-outline" onClilck={onCropCancel}>
            Cancel
          </button>

          <button
            className="btn"
            onClick={onCropDone(croppedArea)}
          >
            Crop & Apply
          </button>
        </div>
      </div> */}

          <div>
            {/* Image cropper component */}
            <Cropper
              image={image}
              aspect={aspectRatio}
              crop={crop}
              zoom={zoom}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              style={{
                containerStyle: {
                  width: '80%',
                  height: '80%',
                  backgroundColor: '#fff',
                },
              }}
            ></Cropper>
          </div>

          <div className="action-btns">
            <div className="aspect-ratios" onChange={onAspectRatioChange}>
              <input type="radio" value={1 / 1} name="ratio" />
              1:1
              <input type="radio" value={5 / 4} name="ratio" />
              5:4
              <input type="radio" value={4 / 3} name="ratio" />
              4:3
              <input type="radio" value={3 / 2} name="ratio" />
              3:2
              <input type="radio" value={5 / 3} name="ratio" />
              5:3
              <input type="radio" value={16 / 9} name="ratio" />
              16:9
              <input type="radio" value={3 / 1} name="ratio" />
              3:1
            </div>
          </div>

          {/* <CModal
        alignment="center"
        visible={show}
        fullscreen="lg"
        onClose={() => setShow(false)}
        aria-labelledby="VerticallyCenteredExample"
      >
        <CModalHeader>
          <CModalTitle id="VerticallyCenteredExample">Image crop</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div>
            {/* Image cropper component */}
          {/* <Cropper
              image={image}
              aspect={aspectRatio}
              crop={crop}
              zoom={zoom}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              style={{
                containerStyle: {
                  width: '100%',
                  height: '80%',
                  backgroundColor: '#fff',
                },
              }}
            ></Cropper>
          </div>

          <div className="action-btns">
            <div className="aspect-ratios" onChange={onAspectRatioChange}>
              <input type="radio" value={1 / 1} name="ratio" />
              1:1
              <input type="radio" value={5 / 4} name="ratio" />
              5:4
              <input type="radio" value={4 / 3} name="ratio" />
              4:3
              <input type="radio" value={3 / 2} name="ratio" />
              3:2
              <input type="radio" value={5 / 3} name="ratio" />
              5:3
              <input type="radio" value={16 / 9} name="ratio" />
              16:9
              <input type="radio" value={3 / 1} name="ratio" />
              3:1
            </div>
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            onClick={() => {
              setShow(false)
              onCropCancel()
            }}
          >
            Close
          </CButton>
          <CButton color="primary" onClick={() => onCropDone(croppedArea)}>
            Crop & Apply
          </CButton>
        </CModalFooter>
      </CModal> */}
        </div>
      </Modal.Body>
      <Modal.Footer className="mastr-mdl-ftr">
        <button
          className="btn btn-danger"
          type="submit"
          onClick={() => {
            onCropDone(croppedArea)
          }}
        >
          Crop & Apply
        </button>
      </Modal.Footer>
    </Modal>
  )
}

export default ImageCropper

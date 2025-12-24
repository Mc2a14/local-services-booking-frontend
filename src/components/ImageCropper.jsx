import { useState, useRef, useEffect } from 'react'

function ImageCropper({ imageSrc, onCropComplete, onCancel }) {
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [dragStartPosition, setDragStartPosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef(null)
  const imageRef = useRef(null)

  useEffect(() => {
    // Reset zoom and position when image changes
    setZoom(1)
    setPosition({ x: 0, y: 0 })
  }, [imageSrc])

  const handleMouseDown = (e) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
    setDragStartPosition({ ...position })
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    
    const deltaX = e.clientX - dragStart.x
    const deltaY = e.clientY - dragStart.y
    
    setPosition({
      x: dragStartPosition.x + deltaX,
      y: dragStartPosition.y + deltaY
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, dragStart, dragStartPosition])

  const handleTouchStart = (e) => {
    const touch = e.touches[0]
    setIsDragging(true)
    setDragStart({ x: touch.clientX, y: touch.clientY })
    setDragStartPosition({ ...position })
  }

  const handleTouchMove = (e) => {
    if (!isDragging) return
    e.preventDefault()
    const touch = e.touches[0]
    const deltaX = touch.clientX - dragStart.x
    const deltaY = touch.clientY - dragStart.y
    
    setPosition({
      x: dragStartPosition.x + deltaX,
      y: dragStartPosition.y + deltaY
    })
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  const getCroppedImage = () => {
    if (!imageRef.current || !containerRef.current) return null

    const img = imageRef.current
    const container = containerRef.current
    
    // Wait for image to load
    if (!img.complete || img.naturalWidth === 0) {
      return null
    }

    const canvas = document.createElement('canvas')
    const outputSize = 400 // Size for the final circular image
    canvas.width = outputSize
    canvas.height = outputSize
    
    const ctx = canvas.getContext('2d')
    
    // Create circular clipping path
    ctx.save()
    ctx.beginPath()
    ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2)
    ctx.closePath()
    ctx.clip()
    
    // Container is 400px circular
    const containerSize = 400
    
    // Image natural dimensions
    const imgNaturalWidth = img.naturalWidth
    const imgNaturalHeight = img.naturalHeight
    const imgAspect = imgNaturalWidth / imgNaturalHeight
    
    // Calculate how image fills the container
    // Image is displayed with objectFit: cover, so it fills the container
    let displayedWidth, displayedHeight
    if (imgAspect > 1) {
      // Landscape: height fills container
      displayedHeight = containerSize
      displayedWidth = displayedHeight * imgAspect
    } else {
      // Portrait: width fills container
      displayedWidth = containerSize
      displayedHeight = displayedWidth / imgAspect
    }
    
    // Apply zoom (zoom makes image larger)
    displayedWidth *= zoom
    displayedHeight *= zoom
    
    // Scale from displayed pixels to source pixels
    const scaleX = imgNaturalWidth / displayedWidth
    const scaleY = imgNaturalHeight / displayedHeight
    
    // The crop area in source coordinates
    // The visible circle has radius containerSize/2 = 200px
    // In displayed coordinates
    const cropRadius = containerSize / 2
    
    // Convert position offset from displayed pixels to source pixels
    const sourceOffsetX = -position.x * scaleX
    const sourceOffsetY = -position.y * scaleY
    
    // Center of crop in source coordinates
    const centerX = imgNaturalWidth / 2 + sourceOffsetX
    const centerY = imgNaturalHeight / 2 + sourceOffsetY
    
    // Crop size in source coordinates (diameter)
    const cropDiameter = (cropRadius * 2) * Math.max(scaleX, scaleY)
    
    // Source rectangle (square for circle)
    const sourceSize = Math.min(cropDiameter, Math.min(imgNaturalWidth, imgNaturalHeight))
    const sourceX = Math.max(0, Math.min(imgNaturalWidth - sourceSize, centerX - sourceSize / 2))
    const sourceY = Math.max(0, Math.min(imgNaturalHeight - sourceSize, centerY - sourceSize / 2))
    
    // Draw the image
    ctx.drawImage(
      img,
      sourceX,
      sourceY,
      sourceSize,
      sourceSize,
      0,
      0,
      outputSize,
      outputSize
    )
    
    ctx.restore()
    
    return canvas.toDataURL('image/jpeg', 0.8)
  }

  const handleDone = () => {
    const croppedImage = getCroppedImage()
    if (croppedImage) {
      onCropComplete(croppedImage)
    }
  }

  if (!imageSrc) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '500px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <h2 style={{ color: 'white', marginBottom: '20px' }}>Adjust Your Image</h2>
        
        {/* Crop container */}
        <div
          ref={containerRef}
          style={{
            width: '100%',
            maxWidth: '400px',
            height: '400px',
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '50%',
            border: '3px solid white',
            backgroundColor: '#000',
            marginBottom: '30px',
            cursor: isDragging ? 'grabbing' : 'grab',
            touchAction: 'none'
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <img
            ref={imageRef}
            src={imageSrc}
            alt="Crop"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px)) scale(${zoom})`,
              minWidth: '100%',
              minHeight: '100%',
              width: 'auto',
              height: 'auto',
              maxWidth: 'none',
              maxHeight: 'none',
              objectFit: 'cover',
              userSelect: 'none',
              pointerEvents: 'none'
            }}
            onLoad={() => {
              // Center the image initially
              setPosition({ x: 0, y: 0 })
            }}
          />
        </div>

        {/* Zoom control */}
        <div style={{ width: '100%', maxWidth: '400px', marginBottom: '20px' }}>
          <label style={{ color: 'white', display: 'block', marginBottom: '10px', fontSize: '14px' }}>
            Zoom: {Math.round(zoom * 100)}%
          </label>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        {/* Preview */}
        <div style={{ marginBottom: '30px' }}>
          <div style={{ color: 'white', fontSize: '14px', marginBottom: '10px' }}>Preview:</div>
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '2px solid white',
            position: 'relative',
            backgroundColor: '#000'
          }}>
            <img
              src={imageSrc}
              alt="Preview"
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: `translate(calc(-50% + ${position.x / 4}px), calc(-50% + ${position.y / 4}px)) scale(${zoom})`,
                minWidth: '400%',
                minHeight: '400%',
                width: 'auto',
                height: 'auto',
                objectFit: 'cover',
                pointerEvents: 'none'
              }}
            />
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '15px', width: '100%', maxWidth: '400px' }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: '#666',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleDone}
            style={{
              flex: 1,
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

export default ImageCropper

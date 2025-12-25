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
    const outputWidth = 400 // Width for the final rectangular image
    const outputHeight = 250 // Height for the final rectangular image
    canvas.width = outputWidth
    canvas.height = outputHeight
    
    const ctx = canvas.getContext('2d')
    
    // Create rounded rectangle clipping path
    ctx.save()
    const radius = 12
    ctx.beginPath()
    ctx.moveTo(radius, 0)
    ctx.lineTo(outputWidth - radius, 0)
    ctx.quadraticCurveTo(outputWidth, 0, outputWidth, radius)
    ctx.lineTo(outputWidth, outputHeight - radius)
    ctx.quadraticCurveTo(outputWidth, outputHeight, outputWidth - radius, outputHeight)
    ctx.lineTo(radius, outputHeight)
    ctx.quadraticCurveTo(0, outputHeight, 0, outputHeight - radius)
    ctx.lineTo(0, radius)
    ctx.quadraticCurveTo(0, 0, radius, 0)
    ctx.closePath()
    ctx.clip()
    
    // Container dimensions (rectangular)
    const containerWidth = 400
    const containerHeight = 250
    
    // Image natural dimensions
    const imgNaturalWidth = img.naturalWidth
    const imgNaturalHeight = img.naturalHeight
    const imgAspect = imgNaturalWidth / imgNaturalHeight
    
    // Calculate how image fills the container
    // Image is displayed with objectFit: cover, so it fills the container
    const containerAspect = containerWidth / containerHeight
    let displayedWidth, displayedHeight
    if (imgAspect > containerAspect) {
      // Image is wider than container aspect ratio: height fills container
      displayedHeight = containerHeight
      displayedWidth = displayedHeight * imgAspect
    } else {
      // Image is taller than container aspect ratio: width fills container
      displayedWidth = containerWidth
      displayedHeight = displayedWidth / imgAspect
    }
    
    // Apply zoom (zoom makes image larger)
    displayedWidth *= zoom
    displayedHeight *= zoom
    
    // Scale from displayed pixels to source pixels
    const scaleX = imgNaturalWidth / displayedWidth
    const scaleY = imgNaturalHeight / displayedHeight
    
    // The crop area in source coordinates (rectangular)
    const cropWidth = containerWidth
    const cropHeight = containerHeight
    
    // Convert position offset from displayed pixels to source pixels
    const sourceOffsetX = -position.x * scaleX
    const sourceOffsetY = -position.y * scaleY
    
    // Center of crop in source coordinates
    const centerX = imgNaturalWidth / 2 + sourceOffsetX
    const centerY = imgNaturalHeight / 2 + sourceOffsetY
    
    // Crop size in source coordinates
    const sourceCropWidth = cropWidth * scaleX
    const sourceCropHeight = cropHeight * scaleY
    
    // Source rectangle coordinates
    const sourceX = Math.max(0, Math.min(imgNaturalWidth - sourceCropWidth, centerX - sourceCropWidth / 2))
    const sourceY = Math.max(0, Math.min(imgNaturalHeight - sourceCropHeight, centerY - sourceCropHeight / 2))
    
    // Draw the image
    ctx.drawImage(
      img,
      sourceX,
      sourceY,
      Math.min(sourceCropWidth, imgNaturalWidth - sourceX),
      Math.min(sourceCropHeight, imgNaturalHeight - sourceY),
      0,
      0,
      outputWidth,
      outputHeight
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
            height: '250px',
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '12px',
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
            width: '160px',
            height: '100px',
            borderRadius: '8px',
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
                transform: `translate(calc(-50% + ${position.x / 2.5}px), calc(-50% + ${position.y / 2.5}px)) scale(${zoom})`,
                minWidth: '400%',
                minHeight: '250%',
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
              backgroundColor: '#475569',
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
              backgroundColor: '#2563EB',
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

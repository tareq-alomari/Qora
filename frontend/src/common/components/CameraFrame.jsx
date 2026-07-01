import { useState, useRef, useCallback, useEffect } from 'react'

const COMPRESSION_QUALITY = 0.85
const MIN_SIZE = 600

export default function CameraFrame({ onCapture, onClose, maxSize = 240 * 1024 }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const countdownRef = useRef(null)

  const [facingMode, setFacingMode] = useState('user')
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState(null)
  const [countdown, setCountdown] = useState(null)
  const [capturedBlob, setCapturedBlob] = useState(null)
  const [capturedPreview, setCapturedPreview] = useState(null)
  const [compressing, setCompressing] = useState(false)
  const [initAttempted, setInitAttempted] = useState(false)

  const startCamera = useCallback(async (mode) => {
    setCameraError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setCameraActive(true)
      setFacingMode(mode)
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('لم يتم السماح بالوصول إلى الكاميرا')
      } else if (err.name === 'NotFoundError') {
        setCameraError('لم يتم العثور على كاميرا')
      } else {
        setCameraError('تعذر تشغيل الكاميرا')
      }
    }
  }, [])

  useEffect(() => {
    if (!initAttempted) {
      setInitAttempted(true)
      startCamera(facingMode)
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
      }
    }
  }, [initAttempted, startCamera, facingMode])

  const flipCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
    }
    setCameraActive(false)
    setCapturedBlob(null)
    setCapturedPreview(null)
    setCountdown(null)
    const nextMode = facingMode === 'user' ? 'environment' : 'user'
    startCamera(nextMode)
  }

  const capture = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    ctx.save()

    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0)
      ctx.scale(-1, 1)
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    ctx.restore()

    canvas.toBlob(
      (blob) => {
        if (!blob) return
        setCapturedBlob(blob)
        setCapturedPreview(URL.createObjectURL(blob))
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop())
        }
        setCameraActive(false)
        setCountdown(null)
      },
      'image/jpeg',
      COMPRESSION_QUALITY
    )
  }

  const startCountdown = () => {
    setCountdown(3)
    let count = 3
    countdownRef.current = setInterval(() => {
      count--
      if (count <= 0) {
        clearInterval(countdownRef.current)
        setCountdown(0)
        capture()
      } else {
        setCountdown(count)
      }
    }, 1000)
  }

  const handleRetake = () => {
    setCapturedBlob(null)
    setCapturedPreview(null)
    startCamera(facingMode)
  }

  const compressAndAccept = async () => {
    setCompressing(true)
    const img = new Image()
    img.src = capturedPreview
    await new Promise((resolve) => { img.onload = resolve })

    if (img.width < MIN_SIZE || img.height < MIN_SIZE) {
      setCompressing(false)
      setCameraError(`الصورة صغيرة جداً. يجب أن تكون على الأقل ${MIN_SIZE}×${MIN_SIZE} بكسل`)
      return
    }

    let quality = COMPRESSION_QUALITY
    let blob = capturedBlob

    if (blob.size > maxSize) {
      const canvas = document.createElement('canvas')
      let { width, height } = img
      while (blob.size > maxSize && quality > 0.1) {
        if (width > 1200 || height > 1200) {
          const scale = Math.min(1200 / width, 1200 / height)
          width = Math.round(width * scale)
          height = Math.round(height * scale)
        }
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        quality -= 0.1
        blob = await new Promise((resolve) =>
          canvas.toBlob((b) => resolve(b), 'image/jpeg', Math.max(quality, 0.1))
        )
      }
    }

    const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' })
    setCompressing(false)
    onCapture(file)
  }

  return (
    <div className="relative bg-black rounded-xl overflow-hidden">
      {!cameraActive && !capturedPreview && !cameraError && (
        <div className="flex items-center justify-center h-80 bg-gray-900 text-white">
          <div className="text-center">
            <svg className="animate-spin h-8 w-8 mx-auto mb-2" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-sm">جاري تشغيل الكاميرا...</p>
          </div>
        </div>
      )}

      {cameraError && !capturedPreview && (
        <div className="flex items-center justify-center h-80 bg-gray-100 rounded-xl">
          <div className="text-center p-6">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
            </svg>
            <p className="text-gray-600 font-semibold mb-2">{cameraError}</p>
            <label className="inline-block bg-primary-500 text-white px-5 py-2 rounded-lg cursor-pointer font-semibold hover:bg-primary-600 transition text-sm">
              رفع صورة من المعرض
              <input
                type="file"
                accept=".jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files[0]
                  if (file) onCapture(file)
                }}
              />
            </label>
          </div>
        </div>
      )}

      {cameraActive && (
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-80 object-cover ${facingMode === 'user' ? '-scale-x-100' : ''}`}
          />

          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <svg viewBox="0 0 300 400" className="w-3/5 h-4/5 opacity-40">
              <ellipse cx="150" cy="180" rx="100" ry="130" fill="none" stroke="white" strokeWidth="3" strokeDasharray="8 4" />
            </svg>
          </div>

          <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
            <button
              onClick={() => {
                if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop())
                onClose()
              }}
              className="bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <button
              onClick={flipCamera}
              className="bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
              </svg>
            </button>
          </div>

          {countdown !== null && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white text-8xl font-bold animate-ping">
                {countdown > 0 ? countdown : ''}
              </span>
            </div>
          )}

          <div className="absolute bottom-6 left-0 right-0 flex justify-center">
            {countdown === null && (
              <button
                onClick={startCountdown}
                className="w-16 h-16 rounded-full bg-white border-4 border-gray-300 hover:bg-gray-100 transition shadow-lg"
              >
                <div className="w-10 h-10 rounded-full bg-red-500 mx-auto" />
              </button>
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      {capturedPreview && (
        <div className="relative">
          <img src={capturedPreview} alt="الصورة الملتقطة" className="w-full h-80 object-contain bg-black" />

          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-6">
            <button
              onClick={handleRetake}
              className="bg-gray-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-gray-600 transition text-sm"
            >
              إعادة التصوير
            </button>
            <button
              onClick={compressAndAccept}
              disabled={compressing}
              className="bg-primary-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-primary-600 transition disabled:opacity-50 text-sm"
            >
              {compressing ? 'جاري المعالجة...' : 'قبول الصورة'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

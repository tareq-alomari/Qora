import { useState, useRef, useEffect } from 'react'

export default function OtpInput({ length = 6, value, onChange, disabled }) {
  const [otp, setOtp] = useState(value ? value.split('') : Array(length).fill(''))
  const inputsRef = useRef([])

  useEffect(() => {
    if (value) {
      const arr = value.split('').concat(Array(length).fill('')).slice(0, length)
      setOtp(arr)
    }
  }, [value, length])

  const handleChange = (index, e) => {
    const val = e.target.value.replace(/\D/g, '')
    if (!val) return
    const newOtp = [...otp]
    newOtp[index] = val[val.length - 1]
    setOtp(newOtp)
    onChange(newOtp.join(''))
    if (index < length - 1) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otp]
      if (otp[index]) {
        newOtp[index] = ''
        setOtp(newOtp)
        onChange(newOtp.join(''))
      } else if (index > 0) {
        inputsRef.current[index - 1]?.focus()
      }
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    const newOtp = pasted.split('').concat(Array(length).fill('')).slice(0, length)
    setOtp(newOtp)
    onChange(newOtp.join(''))
    const nextIndex = Math.min(pasted.length, length - 1)
    inputsRef.current[nextIndex]?.focus()
  }

  return (
    <div className="flex gap-2 justify-center" dir="ltr" onPaste={handlePaste}>
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputsRef.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          disabled={disabled}
          className="w-12 h-14 sm:w-14 sm:h-16 border-2 rounded-lg text-center text-2xl font-bold outline-none transition-all duration-150 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 disabled:opacity-50 disabled:cursor-not-allowed"
          autoFocus={index === 0}
        />
      ))}
    </div>
  )
}

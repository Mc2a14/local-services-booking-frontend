import { useState } from 'react'

function PasswordInput({ value, onChange, placeholder, required, minLength, name, id, style, ...props }) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div style={{ position: 'relative' }}>
      <input
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        name={name}
        id={id}
        style={{
          ...style,
          paddingRight: '40px'
        }}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        style={{
          position: 'absolute',
          right: '10px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '5px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6b7280',
          fontSize: '18px',
          zIndex: 1
        }}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
        tabIndex={-1}
      >
        {showPassword ? '👁️' : '👁️‍🗨️'}
      </button>
    </div>
  )
}

export default PasswordInput




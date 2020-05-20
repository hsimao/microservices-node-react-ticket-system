import { useState } from 'react'
import axios from 'axios'

export default () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState([])

  const onSubmit = async event => {
    event.preventDefault()
    try {
      const response = await axios.post('/api/users/signup', { email, password })
      setErrors([])
    } catch (err) {
      setErrors(err.response.data.errors)
    }
  }

  const showErrors = () => {
    return (
      <div className='alert alert-danger'>
        <h4>Ooops....</h4>
        <ul className='my-0'>
          {errors.map(err => (
            <li key={err.message}>{err.message}</li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <form>
      <h1>Sign Up</h1>
      <div className='form-group'>
        <label>Email Address</label>
        <input value={email} onChange={e => setEmail(e.target.value)} type='text' className='form-control' />
      </div>
      <div className='form-group'>
        <label>Password</label>
        <input value={password} onChange={e => setPassword(e.target.value)} type='password' className='form-control' />
      </div>

      {errors.length > 0 && showErrors()}

      <button onClick={onSubmit} className='btn btn-primary'>
        Sign Up
      </button>
    </form>
  )
}

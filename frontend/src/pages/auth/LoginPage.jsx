// src/pages/auth/LoginPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuthContext';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { isSubmitting }
  } = useForm();

  const onSubmit = async (data) => {
    try {
      setError('');
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (error) {
      setError(error.message || 'Login failed');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Sign in to your account</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id='email'
              type="email"
              autoComplete='email'
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              {...register('password', { required: true })}
              id='password'
              type="password"
              autoComplete='current-password'
              required
            />
          </div>

          {error & (
            <div className="error-message">
              {error}
            </div>
          )}

          <button
            type='submit'
            disabled={isSubmitting}
            className='submit-button'
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;

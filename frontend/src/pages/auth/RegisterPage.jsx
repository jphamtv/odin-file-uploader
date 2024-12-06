// src/pages/auth/RegisterPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../../hooks/useAuthContext";
import './Register.css';

const RegisterPage = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { isSubmitting }
  } = useForm();

  // Watch password field for confirmation validation
  const password = watch('password');

  const onSubmit = async (data) => {
    try {
      setError('');
      await registerUser(data.email, data.password);
      navigate('/dashboard');
    } catch (error) {
      setError(error.message || 'Registration failed');
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2>Create your account</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              {...register('email', { required: true })}
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

          <div className="form-group">
            <label htmlFor="confirmPassword">Password</label>
            <input
              {...register('confirmPassword', {
                required: true,
                validate: value =>
                  value === password || 'Passwords do not match'
              })}
              id='confirmPassword'
              type="confirmPassword"
              autoComplete='new-password'
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
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </button>

        </form>
      </div>
    </div>
  );
};

export default RegisterPage;

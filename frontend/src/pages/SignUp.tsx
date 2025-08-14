import React, { useState } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import NameStep from '../components/signup/NameStep';
import EmailStep from '../components/signup/EmailStep';
import PasswordStep from '../components/signup/PasswordStep';
import { setToken } from '../features/auth/authSlice';

const SignUp: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const handleChange = (input: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [input]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post('http://localhost:3000/api/auth/register', formData);
      const { token } = response.data;
      dispatch(setToken(token));
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration failed:', error);
      // Handle error display to the user
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <NameStep nextStep={nextStep} handleChange={handleChange} values={formData} />;
      case 2:
        return <EmailStep nextStep={nextStep} prevStep={prevStep} handleChange={handleChange} values={formData} />;
      case 3:
        return <PasswordStep prevStep={prevStep} handleChange={handleChange} handleSubmit={handleSubmit} values={formData} />;
      default:
        return <div>Wizard completed!</div>;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
        {renderStep()}
      </div>
    </div>
  );
};

export default SignUp;

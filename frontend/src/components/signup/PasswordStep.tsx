import React from 'react';

interface PasswordStepProps {
  prevStep: () => void;
  handleChange: (input: string) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: () => void;
  values: { password: string };
}

const PasswordStep: React.FC<PasswordStepProps> = ({ prevStep, handleChange, handleSubmit, values }) => {
  const backStep = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    prevStep();
  };

  return (
    <div>
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
          Password
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
          id="password"
          type="password"
          placeholder="******************"
          value={values.password}
          onChange={handleChange('password')}
        />
      </div>
      <div className="flex items-center justify-between">
        <button
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          type="button"
          onClick={backStep}
        >
          Back
        </button>
        <button
          className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg  font-bold py-2 px-4 focus:outline-none focus:shadow-outline"
          type="button"
          onClick={handleSubmit}
        >
          Sign Up
        </button>
      </div>
    </div>
  );
};

export default PasswordStep;

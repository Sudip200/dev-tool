import React from 'react';

interface EmailStepProps {
  nextStep: () => void;
  prevStep: () => void;
  handleChange: (input: string) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  values: { email: string };
}

const EmailStep: React.FC<EmailStepProps> = ({ nextStep, prevStep, handleChange, values }) => {
  const continueStep = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    nextStep();
  };

  const backStep = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    prevStep();
  };

  return (
    <div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
          Email
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="email"
          type="email"
          placeholder="Email"
          value={values.email}
          onChange={handleChange('email')}
        />
      </div>
      <div className="flex items-center justify-between">
        <button
          className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg  font-bold py-2 px-4  focus:outline-none focus:shadow-outline"
          type="button"
          onClick={backStep}
        >
          Back
        </button>
        <button
          className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg  font-bold py-2 px-4  focus:outline-none focus:shadow-outline"
          type="button"
          onClick={continueStep}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default EmailStep;

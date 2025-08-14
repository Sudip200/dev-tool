import React from 'react';

interface NameStepProps {
  nextStep: () => void;
  handleChange: (input: string) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  values: { name: string };
}

const NameStep: React.FC<NameStepProps> = ({ nextStep, handleChange, values }) => {
  const continueStep = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    nextStep();
  };

  return (
    <div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
          Name
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="name"
          type="text"
          placeholder="Name"
          value={values.name}
          onChange={handleChange('name')}
        />
      </div>
      <div className="flex items-center justify-between">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          type="button"
          onClick={continueStep}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default NameStep;
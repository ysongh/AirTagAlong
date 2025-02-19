const totalSteps = 3;

function ProgressBar({ step }) {
  return (
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        {[1, 2, 3].map((stepNumber) => (
          <div
            key={stepNumber}
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= stepNumber ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}
          >
            {stepNumber}
          </div>
        ))}
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full">
        <div
          className="h-full bg-blue-600 rounded-full transition-all duration-300"
          style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
        />
      </div>
    </div>
  )
}

export default ProgressBar;
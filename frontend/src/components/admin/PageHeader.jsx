import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PageHeader = ({
  title,
  description,
  icon: Icon,
  showBack = false,
  backPath = null,
  actions = null,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backPath) {
      navigate(backPath);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            {showBack && (
              <button
                onClick={handleBack}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            {Icon && (
              <div className="bg-blue-50 p-2 rounded-lg">
                <Icon className="h-6 w-6 text-blue-600" />
              </div>
            )}
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          </div>
          {description && <p className="text-gray-600 ml-11">{description}</p>}
        </div>

        {actions && <div className="flex items-center space-x-2">{actions}</div>}
      </div>
    </div>
  );
};

export default PageHeader;

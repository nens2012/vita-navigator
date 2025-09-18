import React, { useState } from 'react';
import {
  User,
  Save,
  Edit2,
  AlertCircle,
  Check,
  X,
  Calendar,
  Activity,
  Heart,
  RefreshCw
} from 'lucide-react';

interface ProfileSectionProps {
  userData: {
    name?: string;
    age?: number;
    gender?: 'male' | 'female' | 'other';
    medicalConditions?: string[];
    weight?: number;
    height?: number;
  };
  onUpdate: (data: any) => void;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  userData,
  onUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: userData.name || '',
    age: userData.age || 0,
    gender: userData.gender || '',
    medicalConditions: userData.medicalConditions || [],
    weight: userData.weight || 0,
    height: userData.height || 0
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const medicalConditionOptions = [
    'hypertension',
    'diabetes',
    'obesity',
    'thyroid',
    'arthritis',
    'back_pain',
    ...(formData.gender === 'female' ? ['pcod_pcos'] : []),
    'none'
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.age || formData.age < 13 || formData.age > 120) {
      newErrors.age = 'Age must be between 13 and 120';
    }

    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onUpdate(formData);
      setIsEditing(false);
    }
  };

  const handleMedicalConditionToggle = (condition: string) => {
    setFormData(prev => {
      const conditions = new Set(prev.medicalConditions);
      if (condition === 'none') {
        return { ...prev, medicalConditions: ['none'] };
      }
      if (conditions.has(condition)) {
        conditions.delete(condition);
      } else {
        conditions.delete('none');
        conditions.add(condition);
      }
      return { ...prev, medicalConditions: Array.from(conditions) };
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <User className="w-5 h-5 text-sky-600" />
            Profile Details
          </h2>
          <button
            onClick={() => isEditing ? handleSubmit() : setIsEditing(true)}
            className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isEditing
                ? 'bg-sky-600 text-white hover:bg-sky-700'
                : 'text-sky-600 bg-sky-50 hover:bg-sky-100'
            }`}
          >
            {isEditing ? (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            ) : (
              <>
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Profile
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your name"
                />
              ) : (
                <p className="text-gray-900">{userData.name || 'Not set'}</p>
              )}
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={formData.age}
                  onChange={e => setFormData(prev => ({ ...prev, age: Number(e.target.value) || 0 }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 ${
                    errors.age ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your age"
                  min="13"
                  max="120"
                />
              ) : (
                <p className="text-gray-900">{userData.age || 'Not set'}</p>
              )}
              {errors.age && (
                <p className="mt-1 text-sm text-red-600">{errors.age}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              {isEditing ? (
                <select
                  value={formData.gender}
                  onChange={e => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 ${
                    errors.gender ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              ) : (
                <p className="text-gray-900 capitalize">{userData.gender || 'Not set'}</p>
              )}
              {errors.gender && (
                <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
              )}
            </div>
          </div>

          {/* Health Information */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Medical Conditions
            </label>
            <div className="space-y-2">
              {isEditing ? (
                <div className="grid grid-cols-2 gap-2">
                  {medicalConditionOptions.map(condition => (
                    <button
                      key={condition}
                      onClick={() => handleMedicalConditionToggle(condition)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium text-left transition-colors ${
                        formData.medicalConditions.includes(condition)
                          ? 'bg-sky-100 text-sky-700'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {formData.medicalConditions.includes(condition) ? (
                        <Check className="w-4 h-4 inline mr-2" />
                      ) : (
                        <div className="w-4 h-4 inline-block mr-2" />
                      )}
                      {condition.split('_').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {userData.medicalConditions?.length ? (
                    userData.medicalConditions.map(condition => (
                      <span
                        key={condition}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-sky-50 text-sky-700"
                      >
                        {condition.split('_').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500">No medical conditions specified</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Female-Specific Section */}
      {formData.gender === 'female' && (
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
          <h3 className="text-lg font-bold text-gray-900">Female Health Tracking</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Menstrual Cycle Tracking */}
            <div className="bg-pink-50 rounded-xl p-4">
              <h4 className="font-medium text-pink-900 flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-pink-600" />
                Menstrual Cycle Tracking
              </h4>
              <button className="w-full bg-pink-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-pink-700 transition-colors">
                Track Your Cycle
              </button>
            </div>

            {/* PCOD/PCOS Monitoring */}
            <div className="bg-purple-50 rounded-xl p-4">
              <h4 className="font-medium text-purple-900 flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-purple-600" />
                PCOD/PCOS Monitoring
              </h4>
              <button className="w-full bg-purple-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-purple-700 transition-colors">
                Monitor Symptoms
              </button>
            </div>
          </div>

          {/* Health Insights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <Heart className="w-5 h-5 text-blue-600 mb-2" />
              <h5 className="font-medium text-blue-900">Hormonal Health</h5>
              <p className="text-sm text-blue-700 mt-1">Track hormonal changes and symptoms</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <Activity className="w-5 h-5 text-green-600 mb-2" />
              <h5 className="font-medium text-green-900">Activity Impact</h5>
              <p className="text-sm text-green-700 mt-1">See how exercise affects your cycle</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <RefreshCw className="w-5 h-5 text-yellow-600 mb-2" />
              <h5 className="font-medium text-yellow-900">Cycle Patterns</h5>
              <p className="text-sm text-yellow-700 mt-1">Understand your unique patterns</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
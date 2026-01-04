import { useState, useEffect } from 'react';
import { Agent } from '../types/agent';

interface NavigationFormProps {
  initialData?: Agent;
  onSubmit: (item: Omit<Agent, 'id' | 'logo'>) => void;
  onCancel: () => void;
}

export function NavigationForm({ initialData, onSubmit, onCancel }: NavigationFormProps) {
  const [formData, setFormData] = useState<Partial<Agent>>({
    id: '',
    name: '',
    website: '',
    description: '',
    category: [],
    isOpenSource: false,
    lastUpdated: new Date().toISOString()
  });
  const [newCategory, setNewCategory] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when editing an existing item
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle category input change
  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewCategory(e.target.value);
  };

  // Add a new category
  const handleAddCategory = () => {
    if (newCategory.trim() && !formData.category?.includes(newCategory.trim())) {
      setFormData(prev => ({
        ...prev,
        category: [...(prev.category || []), newCategory.trim()]
      }));
      setNewCategory('');
    }
  };

  // Remove a category
  const handleRemoveCategory = (categoryToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      category: prev.category?.filter(category => category !== categoryToRemove) || []
    }));
  };

  // Validate form data
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.website?.trim()) {
      newErrors.website = 'Website is required';
    } else {
      // Basic URL validation
      try {
        new URL(formData.website);
      } catch {
        newErrors.website = 'Please enter a valid URL';
      }
    }
    if (!formData.description?.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.category || formData.category.length === 0) {
      newErrors.category = 'At least one category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Remove ID since it's generated automatically for new items
      // and can't be changed for existing items
      const { id, logo, ...restFormData } = formData as Agent;
      
      const finalData = {
        ...restFormData,
      };
      
      onSubmit(finalData);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        {initialData ? 'Edit Navigation Item' : 'Add New Navigation Item'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ID Field - Hidden since it's auto-generated */}
        {initialData && (
          <div>
            <label htmlFor="id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              ID
            </label>
            <input
              type="text"
              id="id"
              name="id"
              value={formData.id || ''}
              onChange={handleChange}
              disabled
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white bg-gray-100 dark:bg-gray-900 cursor-not-allowed"
              placeholder="Auto-generated ID"
            />
          </div>
        )}

        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name || ''}
            onChange={handleChange}
            className={`w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
            placeholder="Enter name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
          )}
        </div>

        {/* Website Field */}
        <div>
          <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Website *
          </label>
          <input
            type="url"
            id="website"
            name="website"
            value={formData.website || ''}
            onChange={handleChange}
            className={`w-full px-3 py-2 border ${errors.website ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
            placeholder="Enter website URL"
          />
          {errors.website && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.website}</p>
          )}
        </div>

        {/* Description Field */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            rows={4}
            className={`w-full px-3 py-2 border ${errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
            placeholder="Enter description"
          ></textarea>
          {errors.description && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
          )}
        </div>

        {/* Categories Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Categories *
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newCategory}
              onChange={handleCategoryChange}
              onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Add a category"
            />
            <button
              type="button"
              onClick={handleAddCategory}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(formData.category || []).map((category) => (
              <span
                key={category}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
              >
                {category}
                <button
                  type="button"
                  onClick={() => handleRemoveCategory(category)}
                  className="ml-1 inline-flex items-center justify-center h-4 w-4 rounded-full bg-blue-200 text-blue-800 hover:bg-blue-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-800 dark:text-blue-200 dark:hover:bg-blue-700"
                >
                  <span className="sr-only">Remove category</span>
                  ×
                </button>
              </span>
            ))}
          </div>
          {errors.category && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.category}</p>
          )}
        </div>

        {/* Open Source Checkbox */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isOpenSource"
            name="isOpenSource"
            checked={formData.isOpenSource || false}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:checked:bg-blue-600 dark:checked:border-blue-600"
          />
          <label htmlFor="isOpenSource" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Is Open Source
          </label>
        </div>

        {/* Optional Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="github" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              GitHub URL
            </label>
            <input
              type="url"
              id="github"
              name="github"
              value={formData.github || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="https://github.com/username/repo"
            />
          </div>
          <div>
            <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Twitter Handle
            </label>
            <input
              type="text"
              id="twitter"
              name="twitter"
              value={formData.twitter || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="twitterhandle"
            />
          </div>
          <div>
            <label htmlFor="discord" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Discord URL
            </label>
            <input
              type="url"
              id="discord"
              name="discord"
              value={formData.discord || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="https://discord.gg/invitecode"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
          >
            {initialData ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
}

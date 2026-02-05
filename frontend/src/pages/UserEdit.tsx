import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { User } from '../types/user';
import { getUser, updateUser } from '../api/users';
import { Spinner } from '../components/Spinner';
import { ErrorAlert } from '../components/ErrorAlert';

// Validation schema
const userSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least 1 uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least 1 number'),
  role: z.enum(['admin', 'user'])
});

type ValidationErrors = {
  [K in keyof z.infer<typeof userSchema>]?: string[];
};

export const UserEdit = () => {
  const { id } = useParams<{id: string}>();
  const navigate = useNavigate();
  
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'user' as const
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user data
  useEffect(() => {
    const loadUser = async () => {
      setIsLoading(true);
      try {
        if (!id) throw new Error('No user ID provided');
        const userData = await getUser(id);
        setUser(userData);
        setFormData({
          email: userData.email,
          password: '',
          role: userData.role
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load user');
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const resetForm = () => {
    if (user) {
      setFormData({
        email: user.email,
        password: '',
        role: user.role
      });
    }
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setError(null);

    try {
      // Validate form data
      userSchema.parse(formData);
      
      setIsSaving(true);
      if (!id) throw new Error('No user ID provided');

      await updateUser(id, formData);
      navigate(`/users/${id}`);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setErrors(err.formErrors.fieldErrors);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to update user');
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><Spinner /></div>;
  }

  if (error) {
    return <ErrorAlert message={error} />;
  }

  if (!user) {
    return <ErrorAlert message="User not found" />;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Edit User</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </label>
          {errors.email?.map(error => (
            <p key={error} className="mt-1 text-sm text-red-600">{error}</p>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Password
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Leave blank to keep current password"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </label>
          {errors.password?.map(error => (
            <p key={error} className="mt-1 text-sm text-red-600">{error}</p>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Role
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          {errors.role?.map(error => (
            <p key={error} className="mt-1 text-sm text-red-600">{error}</p>
          ))}
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
          
          <button
            type="button"
            onClick={resetForm}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Reset
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
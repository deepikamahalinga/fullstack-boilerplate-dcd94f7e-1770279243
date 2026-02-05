import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog } from '@headlessui/react';
import * as Select from '@radix-ui/react-select';
import { useRouter } from 'next/router';
import {
  ChevronDownIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

// Types (would typically be in separate files)
interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
}

interface SortConfig {
  field: keyof User;
  direction: 'asc' | 'desc';
}

interface FilterConfig {
  email?: string;
  role?: 'admin' | 'user';
}

const UserList = () => {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sort, setSort] = useState<SortConfig>({ field: 'email', direction: 'asc' });
  const [filters, setFilters] = useState<FilterConfig>({});
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  // Fetch users with React Query
  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery(['users', page, pageSize, sort, filters], async () => {
    // API call would go here
    return { users: [], total: 0 };
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 mb-4">Error loading users: {error?.message}</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  // Empty state
  if (!data?.users.length) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500 mb-4">No users found</p>
        <button
          onClick={() => router.push('/users/new')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Create First User
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Users</h1>
        <button
          onClick={() => router.push('/users/new')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          New User
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Search by email..."
          className="px-4 py-2 border rounded"
          onChange={(e) => setFilters(f => ({ ...f, email: e.target.value }))}
        />
        <Select.Root
          onValueChange={(value) => setFilters(f => ({ ...f, role: value as 'admin' | 'user' }))}
        >
          <Select.Trigger className="px-4 py-2 border rounded flex items-center">
            <Select.Value placeholder="Filter by role" />
            <ChevronDownIcon className="w-5 h-5 ml-2" />
          </Select.Trigger>
          <Select.Content className="bg-white border rounded shadow-lg">
            <Select.Item value="admin" className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
              Admin
            </Select.Item>
            <Select.Item value="user" className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
              User
            </Select.Item>
          </Select.Content>
        </Select.Root>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.users.map((user: User) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded text-sm ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button
                    onClick={() => router.push(`/users/${user.id}`)}
                    className="text-gray-600 hover:text-gray-900 mx-1"
                  >
                    <EyeIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => router.push(`/users/${user.id}/edit`)}
                    className="text-blue-600 hover:text-blue-900 mx-1"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setDeleteUserId(user.id)}
                    className="text-red-600 hover:text-red-900 mx-1"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="border rounded px-2 py-1"
          >
            {[10, 25, 50].map(size => (
              <option key={size} value={size}>
                {size} per page
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <button
            disabled={page * pageSize >= (data?.total || 0)}
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteUserId}
        onClose={() => setDeleteUserId(null)}
        className="fixed z-10 inset-0 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
          <div className="relative bg-white rounded max-w-sm mx-auto p-6">
            <Dialog.Title className="text-lg font-medium mb-4">
              Confirm Deletion
            </Dialog.Title>
            <p className="mb-4">Are you sure you want to delete this user?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setDeleteUserId(null)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Delete API call would go here
                  setDeleteUserId(null);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default UserList;
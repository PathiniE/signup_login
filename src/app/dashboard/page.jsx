'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import AuthButton from '../../../components/AuthButton';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
    }
  }, [status, router]);
  
  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-center">
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!session) {
    return null; // This will prevent flash of content before redirect
  }
  
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <AuthButton />
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-medium mb-2">Welcome, {session.user.name}!</h3>
        <p className="text-gray-600">
          You are now signed in with {session.user.email}.
        </p>
      </div>
      
      <div className="border-t pt-4">
        <h3 className="text-lg font-medium mb-4">Your Dashboard Content</h3>
        <p className="text-gray-600 mb-4">
          This is a protected page that only signed-in users can access. You can add your dashboard functionality here.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Profile</h4>
            <p className="text-sm text-gray-600">
              Update your profile information and preferences.
            </p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">Settings</h4>
            <p className="text-sm text-gray-600">
              Configure your account settings and notifications.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
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
    return null; 
  }
  
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-black">Dashboard</h2>
        <AuthButton />
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-medium mb-2 text-gray-700">Welcome, {session.user.name}!</h3>
        <p className="text-black">
          You are now signed in with {session.user.email}.
        </p>
      </div>
      
      
    </div>
  );
}
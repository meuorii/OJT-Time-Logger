'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminRegister() {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [status, setStatus] = useState({ message: '', isError: false });
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch('/api/admin/register', { method: 'POST', body: JSON.stringify(formData), headers: { 'Content-Type': 'application/json' }});

        const data = await res.json();

        if (res.ok) {
            setStatus({ message: 'Admin created! Redirecting to Login...', isError: false });
            setTimeout(() => router.push('admin/login'), 2000);
        } else {
            setStatus({ message: data.error || 'Registration failed', isError: true });
        }
    }

     return (
        <div className='flex item-center justify-center min-h-screen bg-gray-100'>
            <form onSubmit={handleSubmit} className='bg-white p-8 rounded-lg shadow-m w-96'>
                <h1 className='text-2xl font-bold mb-6 text-center'>Register Admin</h1>

                {status.message && (
                    <p className={`p-2 mb-4 text-sm rounded ${status.isError ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                        {status.message}
                    </p>
                )};

                <input type="text" placeholder='Username' className='w-full p-2 border mb-4 rounded outline-none focus:border-blue-500' onChange={(e) => setFormData({ ...formData, username: e.target.value })} required />
                <input type="text" placeholder='Email Address' className='w-full p-2 border mb-4 rounded outline-none focus:border-blue-500' onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                <input type="password" placeholder='Password' className='w-full p-2 border mb-4 rounded outline-none focus:border-blue-500' onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
                <button className='w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition'>CREATE ACCOUNT</button>
            </form>
        </div>
    )
};
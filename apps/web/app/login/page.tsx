'use client'

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react"
import api from "../../api";
import axios, { AxiosError } from "axios";
import { error } from "console";

export default function Login() {

    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [loading, setLaoding] = useState<boolean>(false);

    const router = useRouter();

    const handleSubmit = async(e: FormEvent<HTMLFormElement>) : Promise<void> => {
        e.preventDefault();
        setError('');
        setLaoding(true);


        try {
            
            const {data} = await api.post('/auth/login', {email, password});
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            const paths: Record<string, string> = {
                ADMIN: '/admin',
                STATE_HEAD: '/state-head',
                DISTRICT_HEAD: '/district-head',
                BLOCK_MANAGER: '/block-manager',
                STORE_MANAGER: '/store-manager',
                SITE_ENGINEER: '/site-engineer'
            }

            router.push(paths[data.user.role as string] || '/')


        } catch (err) {
            const error = err as AxiosError<{error?: string }>
            setError(error.response?.data?.error || 'Login Failed. Please try again.')
        } finally{
            setLaoding(false)
        }
    }




    return (

        <div className="min-h-screen flex items-center justify-center bg-white p-4">
            <div className="w-full max-w-md bg-gray-50 rounded-2xl shadow-2xl border border-gray-300 p-8">
                <div className="text-2xl text-[#337ab7] font-semibold tracking-wider text-center mb-4"> Vindhya Telelink Ltd. </div>
                <p className="text-center text-gray-600 font-medium mb-8"> Construction Inventory Management System </p>
                 
                 {error && <div className="p-4 rounded-lg text-md tracking-wider font-medium mb-6 flex items-center gap-2 bg-rose-50 text-rose-700 border border-rose-300"> {error} </div> }


                 <form onSubmit={handleSubmit} className="space-y-5">

                    <div>
                    <label className="block text-md font-semibold text-gray-700 mb-2 tracking-wider"> Email Address </label>
                    <input
                     type="email"
                     placeholder="Enter your email"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     required
                     id="login-email"
                     className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500/20 transition-all placeholder:text-gray-600"
                    
                    />
                    </div>

                   <div>
                    <label className="block text-md font-semibold text-gray-700 mb-2 tracking-wider"> Password </label>
                    <input
                     type="password"
                     placeholder="Enter your password"
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     required
                     id="login-password"
                     className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500/20 transition-all placeholder:text-gray-600"
                    
                    />
                    </div>

                    <button type="submit" className="cursor-pointer hover:scale-101 active:scale-95 tracking-wider w-full inline-block items-center justify-center gap-2 px-4 py-2.5 bg-gray-950 text-white rounded-lg font-semibold hover:bg-gray-900 transition-all shadow-md mt-2" disabled={loading} id="login-submit">
                       {loading ? 'Signing in...' : 'Sign In'}
                    </button>

                 </form>

                 <div className=" flex items-center justify-center py-3   mt-3">
                 <p className="text-gray-600 text-center tracking-wide"> <span className="text-gray-800"> Note :- </span> if you have no credentials. Contact your admin. </p>
                 </div>


                </div> 

        </div>


    )






}
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });
    const SERVER_URL = import.meta.env.VITE_SERVER_URL

    const navigate = useNavigate();
    const [failure, setFailure] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);

    // Handle Input Change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Validate Form
    const validateForm = () => {
        let newErrors = {};

        if (!formData.username.trim()) newErrors.username = "Username is required!";
        if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters!";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle Form Submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        setFailure(false);
        setErrors({});  // Reset errors before new submission

        try {
            const response = await fetch(`${SERVER_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: formData.username,
                    password: formData.password,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("token", data.token);
                navigate('/'); // Redirect on successful login
            }
            else if (response.status === 404) {  // User not found
                setErrors((prev) => ({ ...prev, username: data.error }));
                setFailure(true);
            }
            else if (response.status === 401) {  // Incorrect password
                setErrors((prev) => ({ ...prev, password: data.error }));
                setFailure(true);
            }
            else {
                setFailure(true);
            }
        } catch (error) {
            console.error('Login Error:', error);
            setFailure(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className='w-full min-h-screen flex items-center justify-center py-10 bg-violet-100'>
                <div className='w-11/12 flex xl:flex-row lg:flex-row flex-col-reverse items-center justify-center gap-10 bg-white rounded-xl drop-shadow-xl xl:px-10 lg:px-10 md:px-10 px-5 py-10'>
                    <div className='xl:w-2/3 lg:w-2/3 w-full'>
                        <img src="/login.svg" className='w-full' alt="" />
                    </div>
                    <div className='xl:w-1/2 lg:w-1/2 w-full flex flex-col items-start gap-5'>
                        <div className='flex items-center justify-center gap-2'>
                            <img src="/logo.png" className='h-10 relative mb-2' alt="" />
                            <img src="/logoName.png" className='h-10' alt="" />
                        </div>
                        <p className='text-2xl font-bold px-2 text-violet-600 my-5'>Sign In</p>
                        <form className='w-full flex flex-col items-start gap-5' onSubmit={handleSubmit}>
                            <div className="w-full flex flex-col gap-2">
                                <label className="text-gray-900 font-semibold px-2">Username</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="Enter your username"
                                    className="w-full bg-violet-100 focus:outline-none py-3 px-5 rounded-full border border-violet-300"
                                />
                                {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
                            </div>

                            <div className="w-full flex flex-col gap-2">
                                <label className="text-gray-900 font-semibold px-2">Password</label>
                                <div className='w-full flex items-center justify-between bg-violet-50 rounded-full border border-violet-300 py-3 px-5 '>
                                    <input
                                        type={showPass ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Enter your password"
                                        className="w-full bg-transparent focus:outline-none"
                                    />
                                    <button onClick={() => setShowPass(!showPass)} type='button' className='text-violet-600 text-xl'>{showPass ? <FaEyeSlash /> : <FaEye />}</button>
                                </div>
                                {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                            </div>

                            {/* Failure Message */}
                            {failure && (
                                <p className="text-md font-semibold text-red-500 w-full text-center">
                                    Something went wrong, try again!
                                </p>
                            )}

                            <button
                                type="submit"
                                className="w-full bg-violet-600 text-white py-3 text-lg font-semibold rounded-full hover:bg-violet-700 transition my-5"
                            >
                                {loading ? 'Signing In ...' : 'Sign In'}
                            </button>
                        </form>
                        <Link to={'/register'} className='w-full text-center flex items-center justify-center gap-1'>
                            <span>Don't have an account?</span>
                            <span className='text-violet-500 font-semibold'>Sign Up</span>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Login;

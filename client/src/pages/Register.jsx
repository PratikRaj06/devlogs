import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        fullname: '',
        password: '',
        cnfpass: ''
    });
    const SERVER_URL = import.meta.env.VITE_SERVER_URL

    const [success, setSuccess] = useState(false);
    const [failure, setFailure] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // Handle Input Change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Validate Form
    const validateForm = () => {
        let newErrors = {};

        if (!formData.username.trim()) newErrors.username = 'Username is required!';
        if (!formData.fullname.trim()) newErrors.fullname = 'Full Name is required!';
        if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters!';
        if (formData.password !== formData.cnfpass) newErrors.cnfpass = 'Passwords do not match!';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle Form Submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        setFailure(false);
        setSuccess(false);

        try {
            const response = await fetch(`${SERVER_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: formData.username,
                    fullName: formData.fullname,
                    password: formData.password,
                }),
            });

            const data = await response.json();

            if (response.status === 401) {  // Handle "Username exists"
                setErrors((prev) => ({ ...prev, username: data.error }));
                setFailure(true);
            } 
            if (!response.ok) {
                setFailure(true);
            } 
            else {
                setSuccess(true)
            }
        } catch (error) {
            console.error('Registration Error:', error);
            setFailure(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Success Message */}
            {success && (
                <div className="fixed z-50 inset-0 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm">
                    <div className="bg-white p-10 rounded-lg shadow-lg flex flex-col items-center text-center gap-5">
                        <h2 className="text-2xl font-semibold text-violet-600">Registration Successful</h2>
                        <img src="/registedone.svg" className='h-32' alt="Success" />
                        <p className="text-gray-600 mt-2">You can now sign in to your account</p>
                        <Link to="/login" className="bg-violet-500 text-white px-5 py-2 rounded-full">
                            Go to Sign In Page
                        </Link>
                    </div>
                </div>
            )}

            <div className="w-full min-h-screen flex items-center justify-center py-10 bg-violet-100">
                <div className="w-11/12 flex xl:flex-row lg:flex-row flex-col-reverse items-center justify-center gap-10 xl:px-10 lg:px-10 md:px-10 px-5 py-10 rounded-xl drop-shadow-2xl bg-white">
                    <div className="xl:w-2/3 lg:w-2/3 w-full">
                        <img src="/register.svg" className="w-full" alt="Register" />
                    </div>
                    <div className="xl:w-1/2 lg:w-1/2 w-full flex flex-col items-start gap-5">
                        <div className="flex items-center justify-start gap-2">
                            <img src="/logo.png" className="h-10 relative mb-1" alt="Logo" />
                            <img src="/logoName.png" className="h-10" alt="Logo Name" />
                        </div>
                        <p className="text-2xl font-bold px-2 text-violet-600 my-5">Sign Up</p>

                        {/* Form */}
                        <form className="w-full flex flex-col items-start gap-5" onSubmit={handleSubmit}>
                            {/* Username */}
                            <div className="w-full flex flex-col gap-2">
                                <label className="text-gray-900 font-semibold text-sm px-2">Username</label>
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

                            {/* Full Name */}
                            <div className="w-full flex flex-col gap-2">
                                <label className="text-gray-900 font-semibold text-sm px-2">Full Name</label>
                                <input
                                    type="text"
                                    name="fullname"
                                    value={formData.fullname}
                                    onChange={handleChange}
                                    placeholder="Enter your full name"
                                    className="w-full bg-violet-50 focus:outline-none py-3 px-5 rounded-full border border-violet-300"
                                />
                                {errors.fullname && <p className="text-red-500 text-sm">{errors.fullname}</p>}
                            </div>

                            {/* Password */}
                            <div className="w-full flex flex-col gap-2">
                                <label className="text-gray-900 font-semibold text-sm px-2">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    className="w-full bg-violet-50 focus:outline-none py-3 px-5 rounded-full border border-violet-300"
                                />
                                {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                            </div>

                            {/* Confirm Password */}
                            <div className="w-full flex flex-col gap-2">
                                <label className="text-gray-900 font-semibold text-sm px-2">Confirm Password</label>
                                <input
                                    type="password"
                                    name="cnfpass"
                                    value={formData.cnfpass}
                                    onChange={handleChange}
                                    placeholder="Re-enter your password"
                                    className="w-full bg-violet-50 focus:outline-none py-3 px-5 rounded-full border border-violet-300"
                                />
                                {errors.cnfpass && <p className="text-red-500 text-sm">{errors.cnfpass}</p>}
                            </div>

                            {/* Failure Message */}
                            {failure && (
                                <p className="text-md font-semibold text-red-500 w-full text-center">
                                    Something went wrong, try again!
                                </p>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="w-full bg-violet-600 text-white py-3 text-lg font-semibold rounded-full hover:bg-violet-700 transition my-5"
                                disabled={loading}
                            >
                                {loading ? 'Signing Up ...' : 'Sign Up'}
                            </button>
                        </form>

                        <Link to="/login" className="w-full text-center flex items-center justify-center gap-1">
                            <span>Already have an account?</span>
                            <span className="text-violet-500 font-semibold">Sign In</span>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Register;

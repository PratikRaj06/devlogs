import React, { useState, useEffect, useContext } from 'react';
import { MdDelete, MdEdit } from "react-icons/md";
import { MdOutlineAddCircle } from "react-icons/md";
import { HiOutlineLogout } from "react-icons/hi";
import { Link, useNavigate } from 'react-router-dom';
import { SearchContext } from '../searchContext';
const Profile = () => {
  const authToken = localStorage.getItem("token");
  const navigate = useNavigate();
  const { setSearchedBlogs, setQuery } = useContext(SearchContext)
  useEffect(() => {
    if (!authToken) {
      navigate("/login");
    }
    else {
      setSearchedBlogs(null)
      setQuery(null)
    }
  }, [authToken, navigate]);

  const [confirmLogOut, setConfirmLogOut] = useState(false);
  const [user, setUser] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [deleteCurrent, setDeleteCurrent] = useState(null);
  const [deleteResult, setDeleteResult] = useState(null)
  
  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };
  const SERVER_URL = import.meta.env.VITE_SERVER_URL

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (!response.ok) {
        if (response.status === 404) {
          alert("User not found. Please log in again.");
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }
        throw new Error("Failed to fetch user profile");
      }

      const data = await response.json();
      setUser(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingUser(false);
    }
  };

  function timeAgo(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    // If date is in the future
    if (seconds < 0) return "Just now";

    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
    };

    for (const [unit, value] of Object.entries(intervals)) {
      const diff = Math.floor(seconds / value);
      if (diff >= 1) return `${diff} ${unit}${diff > 1 ? 's' : ''} ago`;
    }
    return "Just now";
  }
  function formatDate(isoString) {
    const date = new Date(isoString);
    const day = date.getUTCDate();
    const month = date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }); // "Jan", "Feb", etc.
    const year = date.getUTCFullYear();
    return `${day} ${month} ${year}`;
  }

  const fetchUserBlogs = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/user/blogs`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (!response.ok) {
        if (response.status === 404) {
          alert("User not found. Please log in again.");
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }
        throw new Error("Failed to fetch user blogs");
      }

      const data = await response.json();
      setBlogs(data.blogs);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingBlogs(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
    fetchUserBlogs();
  }, []);

  const deleteBlog = async (blogId) => {
    try {
      setDeleting(true)
      if (!authToken) {
        alert("Session expired. Please log in again.");
        window.location.href = "/login";
        return;
      }

      const response = await fetch(`${SERVER_URL}/delete-blog`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({blogId}),
      });

      if (response.status === 404) {
        alert("Session expired. Please log in again.");
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }

      const result = await response.json();

      if (!response.ok) {
        alert(result.error || "Something went wrong!");
        return;
      }
      setConfirmDelete(false)
      fetchUserBlogs()
    } catch (error) {
      setDeleteResult('An error occured!')
      console.error("Error deleting blog:", error);
    } finally {
      setDeleting(false)
      setTimeout(() => {
        
      }, timeout);
    }
  };


  return (
    <>
      {confirmLogOut && (
        <div className='fixed z-50 inset-0 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm'>
          <div className='bg-white p-10 rounded-lg shadow-lg flex flex-col items-center text-center gap-5'>
            <h2 className='text-2xl font-semibold text-gray-800'>Sign Out</h2>
            <p className='text-gray-600 mt-2'>Are you sure you want to log out?</p>
            <div className='flex items-center justify-center gap-5 mt-5'>
              <button onClick={() => setConfirmLogOut(false)} className='px-5 py-2 bg-gray-300 text-gray-800 rounded-full hover:bg-gray-400 transition'>Cancel</button>
              <button onClick={logout} className='px-5 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition'>Log Out</button>
            </div>
          </div>
        </div>
      )}
      {confirmDelete && deleteCurrent && (
        <div className='fixed z-50 inset-0 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm'>
          <div className='xl:w-1/3 lg:w-1/2 md:w-8/12 w-11/12 bg-white p-10 rounded-lg shadow-lg flex flex-col items-center text-center gap-5'>
            <h2 className='text-2xl font-semibold text-violet-600'>Delete blog?</h2>
            <p className='text-gray-600 text-lg font-semibold line-clamp-1'>{deleteCurrent.title}</p>
            <img src={deleteCurrent.thumbnail} className='h-40 w-auto rounded-md' alt="" />
            <p className='text-gray-600 text-sm font-normal italic line-clamp-1'>{deleteCurrent.description}</p>
            <p className='text-gray-600 text-sm font-semibold'>Posted: {timeAgo(deleteCurrent.createdAt)}</p>
            {deleteResult && <p className='font-semibold text-red-500 text-md text-center w-full'>{deleteResult}</p>}
            <div className='flex items-center justify-center gap-5 mt-5'>
              <button onClick={() => {
                setDeleteCurrent(null);
                setConfirmDelete(false)
              }} className='px-5 py-2 bg-gray-300 text-gray-800 rounded-full hover:bg-gray-400 transition'>Cancel</button>
              <button onClick={() => deleteBlog(deleteCurrent._id)} className='px-5 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition'>{deleting ? 'Deleting...' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}

      <div className='w-full flex flex-col items-center gap-5 pb-10'>
        {/* Navbar */}
        <div className='w-full flex items-center justify-between px-5 py-3 bg-violet-500 '>
          <Link to={'/'} className='w-1/6 flex items-center justify-start gap-3'>
            <img src="/logo.png" className='h-8 bg-violet-100 rounded-full p-1' alt="" />
            <img src="/logoNav.png" className='h-8 xl:inline lg:inline md:inline hidden' alt="" />
          </Link>
          <div className='xl:w-1/2 lg:w-1/2 md:w-2/3 w-10/12 flex items-center justify-end gap-2'>
            <button onClick={() => setConfirmLogOut(true)} className='text-violet-50 text-3xl'><HiOutlineLogout /></button>
          </div>
        </div>

        <div className='xl:w-10/12 lg:w-10/12 md:w-10/12 w-11/12 flex flex-col items-center gap-5'>
          {/* Profile */}
          {loadingUser ? <div className='w-full flex items-center justify-center py-5'>Loading...</div> : (
            <div className='w-full flex items-center justify-start gap-5 py-5'>
              <img src="/user.png" className='h-24' alt="" />
              <div className='w-full flex flex-col items-start gap-2'>
                <h1 className='text-2xl font-bold text-violet-600'>{user?.fullName}</h1>
                <p className='text-lg italic font-medium text-gray-500'>{user?.username}</p>
                <p className='text-sm font-normal'>Joined: {formatDate(user?.joinedDate)}</p>
              </div>
            </div>
          )}

          <div className='w-full border'></div>

          <div className='w-full flex flex-col items-center gap-5'>
            <div className='w-full flex items-center justify-between'>
              <h1 className='text-lg font-semibold text-gray-700'>Your Posts</h1>
              <Link to={'/post'} className='text-white font-semibold rounded-full py-2 px-5 bg-violet-600 flex items-center justify-center gap-2'><span>Add new</span><MdOutlineAddCircle className='text-xl' /></Link>
            </div>

            {loadingBlogs ? <div className='w-full flex items-center justify-center py-5'>Loading...</div> : (
              <div className="w-full grid xl:grid-cols-3 lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-8">
                {blogs.map(blog => (
                  <div key={blog._id} className='w-full flex flex-col items-start gap-3 bg-violet-100 border drop-shadow-xl p-5 rounded-xl'>
                  {/* Clickable preview area */}
                  <Link to={`/preview/${blog._id}`} className='w-full flex flex-col items-start gap-3'>
                    <img src={blog.thumbnail || "/img.webp"} className='w-full xl:h-56 lg:h-52 md:h-48 h-40 object-cover rounded-lg' alt="" />
                    <h1 className='text-gray-800 font-semibold text-lg line-clamp-1'>{blog.title}</h1>
                    <p className='text-md text-gray-700 italic line-clamp-1'>{blog.description}</p>
                    <div className='w-full flex flex-wrap items-center justify-between gap-2'>
                      <p className='text-sm text-violet-950 font-medium'>Posted: {timeAgo(blog.createdAt)}</p>
                      <p className='text-sm text-violet-950 font-medium'>Updated: {timeAgo(blog.updatedAt)}</p>
                    </div>
                  </Link>
                
                  {/* Buttons outside Link */}
                  <div className='flex items-center gap-2'>
                    <Link to={`/post/${blog._id}`} className='flex items-center justify-center gap-1 px-5 py-1 rounded-full border text-white bg-blue-500'>
                      <span>Edit</span> <MdEdit />
                    </Link>
                
                    <button
                      type='button'
                      onClick={() => {
                        setConfirmDelete(true);
                        setDeleteCurrent(blog);
                      }}
                      className='flex items-center justify-center gap-1 px-5 py-1 rounded-full border text-white bg-rose-500'
                    >
                      <span>Delete</span> <MdDelete />
                    </button>
                  </div>
                </div>
                
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
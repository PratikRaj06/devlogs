import React, { useState, useEffect, useContext } from 'react'
import { IoSearchOutline } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { Link, useNavigate } from 'react-router-dom'
import { SearchContext } from '../searchContext';
const Home = () => {
  const authToken = localStorage.getItem("token");
  const navigate = useNavigate();
  const { searchedBlogs, setSearchedBlogs, query, setQuery } = useContext(SearchContext)
  const [loading, setLoading] = useState(false);
  const [failure, setfailure] = useState(false);
  const [text, setText] = useState("")
  useEffect(() => {
    if (!authToken) {
      navigate("/login");
    }
  }, [authToken, navigate]);

  const searchBlog = async () => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:5000/search?query=${encodeURIComponent(query)}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}` // Add the auth token
        }
      });
  
      if (!response.ok) {
        if (response.status === 404) {
          navigate('/login');  
          return; // Prevents further execution
        }
        setfailure(true);
        return;
      }
      const data = await response.json();
      setSearchedBlogs(data.blogs); // Prevents setting undefined
      setText("")
    } catch (error) {
      console.error("Error fetching blogs:", error);
      setfailure(true);
    } finally {
      setLoading(false)
    }
  };

  useEffect(() => {
    if(query) searchBlog()
  }, [query])

  useEffect(() => {
    if (searchedBlogs) console.log(searchedBlogs);
  }, [searchedBlogs]); 
  
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

  return (
    <div className='w-full flex flex-col items-center'>
      <div className='w-full flex items-center justify-between px-5 py-3 bg-violet-500 fixed top-0'>
        <Link to={'/'} className='w-1/6 flex items-center justify-start gap-3'>
          <img src="/logo.png" className='h-8 bg-violet-100 rounded-full p-1' alt="" />
          <img src="/logoNav.png" className='h-8 xl:inline lg:inline md:inline hidden' alt="" />
        </Link>
        <div className='xl:w-1/2 lg:w-1/2 md:w-2/3 w-10/12 flex items-center justify-end xl:gap-5 lg:gap-5 md:gap-4 gap-2'>
          <div className='w-full flex items-center justify-between bg-ribbon-50 xl:py-2 lg:py-2 md:py-2 py-1 xl:px-5 lg:px-5 md:px-5 px-3 rounded-full'>
            <input value={text} onChange={(e) => setText(e.target.value)} type="text" placeholder='Search' className='bg-transparent px-2 w-full focus:outline-none placeholder-hippie-green-400 text-ribbon-800' />
            <button onClick={() => setQuery(text)}><IoSearchOutline className='xl:text-2xl lg:text-2xl md:text-2xl text-xl text-ribbon-600' /></button>
          </div>
          <Link to={'/profile'}><FaUser className='text-2xl text-ribbon-100' /></Link>
        </div>
      </div>

      <div className='xl:w-10/12 lg:w-10/12 md:w-10/12 w-11/12 flex flex-col items-center gap-5 mt-20'>
        {failure && <p className='text-md font-semibold text-red-500'>An error occured!</p>}
        {loading && <div className='h-5 w-5 border-t-2 animate-spin border-violet-600'></div>}  
        {searchedBlogs && <div className='w-full flex flex-col items-center gap-5 pb-10'>
          <h1 className='w-full text-lg text-gray-600 italic'>Showing results for <b>{query}</b></h1>
          {searchedBlogs.length === 0 ? <div className='xl:w-1/2 lg:w-1/2 md:w-8/12 w-11/12 min-h-[90vh] flex flex-col items-center justify-center gap-2'>
          <h1 className='text-lg font-semibold text-rose-500'>Opps! No result</h1>
          <img src="/notfound.svg" alt="" />
          </div> : <div className='w-full grid gap-8 xl:grid-cols-3 lg:grid-cols-3 md:grid-cols-2 grid-cols-1'>
            {searchedBlogs.map((blog) => (
              <Link to={`/preview/${blog._id}`} className='w-full flex flex-col items-start gap-3 bg-violet-50 p-5 rounded-xl border drop-shadow-xl'>
                <img src={blog.thumbnail} className='w-full h-40 rounded object-cover' alt="" />
                <h1 className='text-gray-800 font-semibold text-lg line-clamp-1'>{blog.title}</h1>
                <p className='text-md text-gray-700 italic line-clamp-1'>{blog.description}</p>
                <p className='text-sm text-violet-950 font-medium'>Posted: {timeAgo(blog.createdAt)}</p>
              </Link>
            ))}
            </div>}
        </div>}

        {!searchedBlogs && <div className='xl:w-1/2 lg:w-1/2 md:w-8/12 w-11/12 min-h-[80vh] flex flex-col items-center justify-center gap-5'>
          <h1 className='text-xl font-semibold text-purple-600'>Search for a blog topic</h1>
          <img src="/search.svg" className='w-full' alt="" />
          </div>}




      </div>
    </div>
  )
}

export default Home
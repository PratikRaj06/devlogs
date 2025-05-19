import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism"; // One Light theme
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FaUser } from "react-icons/fa";

const Preview = () => {
  const { id } = useParams();
  const [blogData, setblogData] = useState(null)
  const authToken = localStorage.getItem("token");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const SERVER_URL = import.meta.env.VITE_SERVER_URL

  useEffect(() => {
    if (!authToken) {
      navigate("/login");
    }
    else if (authToken && id) {
      fetchblogData()
    }
  }, [authToken, navigate, id]);

  const fetchblogData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${SERVER_URL}/blog/${id}`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });

      if (response.status === 404) {
        logout(); // If token is expired or invalid, log out
        return;
      }
      if (!response.ok) throw new Error(`Failed to fetch blog data. Status: ${response.status}`);

      const data = await response.json();

      if (!data.blog) throw new Error("Blog data not found in response");

      setblogData(data.blog);
      console.log(data.blog)

    } catch (err) {
      console.error("Fetch error:", err);
      alert("An error occurred: " + err.message);
    } finally {
      setLoading(false);
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
    return "A few seconds ago";
  }


  return (
    <>
      {loading ? <div>Loading...</div> : <div className="w-full flex flex-col items-center gap-5">
        <div className='w-full flex items-center justify-between px-5 py-3 bg-violet-500'>
          <Link to={'/'} className='w-1/6 flex items-center justify-start gap-3'>
            <img src="/logo.png" className='h-8 bg-violet-100 rounded-full p-1' alt="" />
            <img src="/logoNav.png" className='h-8 xl:inline lg:inline md:inline hidden' alt="" />
          </Link>
          <div className='xl:w-1/2 lg:w-1/2 md:w-2/3 w-10/12 flex items-center justify-end gap-2'>
            <Link to={'/profile'}><FaUser className='text-2xl text-ribbon-100' /></Link>
          </div>
        </div>

        {blogData ? <div className="xl:w-8/12 lg:w-8/12 md:w-10/12 w-11/12 flex flex-col items-start gap-5 bg-white px-5 py-10 rounded-xl drop-shadow-xl border mb-10">
          <h1 className="text-3xl text-gray-800 font-semibold">{blogData.title}</h1>
          <p className="text-md text-gray-600 italic">{blogData.description}</p>
          <div className="flex items-center justify-start gap-1"><span className="text-gray-700 font-medium">Author: </span><span className="text-violet-600 font-semibold text-lg">{blogData.username}</span></div>
          
          <div className="w-full flex items-center justify-between gap-1">
            <span className="text-sm font-light ">Posted: {timeAgo(blogData.createdAt)}</span>

            <span className="text-sm font-light ">Updated: {timeAgo(blogData.updatedAt)}</span>
          </div>
          <img src={blogData.thumbnail} className="w-full rounded" alt="" />

          {/* Markdown Content */}
          <div className="prose max-w-none my-10">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={oneLight} // One Light theme
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    >
                      {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                  ) : (
                    <code {...props}>{children}</code>
                  );
                },
              }}
            >
              {blogData.content}
            </ReactMarkdown>
          </div>
        </div> : <p>Loading...</p>}
      </div>}
    </>
  );

};

export default Preview;

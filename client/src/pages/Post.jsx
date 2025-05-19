import React, { useState, useRef, useEffect } from 'react';
import MarkdownEditor from '../components/MarkdownEditor';
import { MdOutlineCloudUpload } from "react-icons/md";
import { AiOutlineClose } from "react-icons/ai";
import { FaUser } from "react-icons/fa";
import { Link, useNavigate } from 'react-router-dom'
import { useParams } from 'react-router-dom';
import { storage } from '../appwriteConfig';
import { ID } from 'appwrite';

const Post = () => {
  const { id } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const authToken = localStorage.getItem("token");
  const [blogId, setBlogId] = useState(null)
  const navigate = useNavigate();
  const SERVER_URL = import.meta.env.VITE_SERVER_URL

  useEffect(() => {
    if (!authToken) {
      navigate("/login");
    }
  }, [authToken, navigate]);

  useEffect(() => {
    if (id && authToken) {
      setIsEditing(true);
      fetchBlogData();
    }
  }, [authToken, id]);


  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    thumbnail: ""
  });

  const [failure, setFailure] = useState(false)
  const [success, setSuccess] = useState(false)
  const [markdownContent, setMarkdownContent] = useState('');
  const [thumbnail, setThumbnail] = useState(null);

  const [uploading, setUploading] = useState(false);

  const fileRef = useRef(null);

  const fetchBlogData = async () => {
    try {
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

      setFormData({
        title: data.blog.title,
        description: data.blog.description,
        content: data.blog.content,
        thumbnail: data.blog.thumbnail
      });
      console.log(data.blog.content)
      setMarkdownContent(data.blog.content || '');
      setThumbnail(data.blog.thumbnail || null);

    } catch (err) {
      console.error("Fetch error:", err);
      alert("An error occurred: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!markdownContent.trim()) newErrors.content = "Content is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadToAppwrite = async (file) => {
    if (!file) {
      console.error("No file selected!");
      return null;
    }

    try {
      setUploading(true)
      const response = await storage.createFile(
        import.meta.env.VITE_APPWRITE_BUCKET_ID,
        ID.unique(),
        file
      );
      return storage.getFileView(import.meta.env.VITE_APPWRITE_BUCKET_ID, response.$id);
    } catch (error) {
      console.error("Error uploading file:", error);
      return null;
    }
    finally {
      setUploading(false)
    }
  };

  const getThumbnailPreview = () => {
    if (thumbnail instanceof File) {
      return URL.createObjectURL(thumbnail); // New file preview
    }
    return thumbnail; // Existing URL
  };
  
  const handleThumbnailChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploading(true);
      setThumbnail(file);
      setUploading(false);
    }
  };

  const removeThumbnail = () => {
    setThumbnail(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
  
    setLoading(true);
    let imageUrl = formData.thumbnail;
  
    // If a new file is selected, upload it
    if (thumbnail instanceof File) {
      const uploadedUrl = await uploadToAppwrite(thumbnail);
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
      }
    } else if (thumbnail === null) {
      // If thumbnail is removed, explicitly set it to an empty string
      imageUrl = "";
    }
  
    if (isEditing) {
      await updateBlog(imageUrl);
    } else {
      await createBlog(imageUrl);
    }
  
    setLoading(false);
  };
  
  
  // Function to handle session expiration
  const handleSessionExpired = () => {
    alert("Session expired. Please log in again.");
    // Clear session and redirect (modify as needed)
    localStorage.removeItem("authToken");
    window.location.href = "/login"; 
  };
  
  const createBlog = async (imageUrl) => {
    try {
      const response = await fetch(`${SERVER_URL}/create-blog`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          thumbnail: imageUrl || "https://cloud.appwrite.io/v1/storage/buckets/6797134a000d43bad116/files/67d9236900093ab01370/view?project=676fc9410028b829db4f&mode=admin",
          content: markdownContent,
        }),
      });
  
      if (response.status === 404) {
        handleSessionExpired();
        return;
      }
  
      const result = await response.json();
  
      if (!response.ok) {
        setFailure(true);
        alert(result.error || "Something went wrong!");
        return;
      }
      
      window.scrollTo(0,0);
      setBlogId(result.blog_id)
      setSuccess(true);
      setFormData({
        title: "",
        description: "",
        content: "",
        thumbnail: ""
      })
      setThumbnail(null)
      setMarkdownContent("")
    } catch (error) {
      console.error("Error creating blog:", error);
      setFailure(true);
    }
  };
  
  const updateBlog = async (imageUrl) => {
    try {
      const response = await fetch(`${SERVER_URL}/update-blog`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          blogId: id, 
          title: formData.title || undefined,
          description: formData.description || undefined,
          thumbnail: imageUrl === "" ? null : imageUrl, // Ensure backend knows it's removed
          content: markdownContent || undefined,
        }),
      });
  
      if (response.status === 404) {
        handleSessionExpired();
        return;
      }
  
      const result = await response.json();
  
      if (!response.ok) {
        setFailure(true);
        alert(result.error || "Something went wrong!");
        return;
      }
      
      window.scrollTo(0,0);
      setSuccess(true);
      setBlogId(result.blog_id);
      setFormData({
        title: "",
        description: "",
        content: "",
        thumbnail: ""
      })
      setThumbnail(null)
      setMarkdownContent("")
    } catch (error) {
      console.error("Error updating blog:", error);
      setFailure(true);
    }
  };  

  return (
    <>
      {success && <div className='w-full min-h-screen absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center'>
        <div className='w-full h-full absolute inset-0 bg-black/20 bg-opacity-10 backdrop-blur-sm'></div>
        <div className='w-fit flex flex-col items-center gap-5 bg-white p-10 rounded-xl drop-shadow-xl'>
          <h1 className='text-violet-600 text-2xl font-bold'>Post {isEditing ? 'Updated' : 'Created'}</h1>
          <img src="/post.svg" alt="" />
          <div className='flex items-center justify-center gap-3'>
            <button onClick={() => setSuccess(false)} className='text-md font-semibold border rounded-full px-5 py-2 bg-gray-200 text-gray-700 border-gray-500'>Close</button>
            <Link to={`/preview/${blogId}`}  className='text-md font-semibold border rounded-full px-5 py-2 bg-violet-500 text-white'>Go to post</Link>
          </div>
        </div>

      </div>}
      <div className='w-full flex flex-col items-center'>
        <div className='w-full flex items-center justify-between px-5 py-3 bg-violet-500'>
          <Link to={'/'} className='w-1/6 flex items-center justify-start gap-3'>
            <img src="/logo.png" className='h-8 bg-violet-100 rounded-full p-1' alt="" />
            <img src="/logoNav.png" className='h-8 xl:inline lg:inline md:inline hidden' alt="" />
          </Link>
          <div className='xl:w-1/2 lg:w-1/2 md:w-2/3 w-10/12 flex items-center justify-end gap-2'>
            <Link to={'/profile'}><FaUser className='text-2xl text-ribbon-100' /></Link>
          </div>
        </div>
        <div className='xl:w-8/12 lg:8/12 md:w-10/12 w-11/12 py-10 flex flex-col'>

          <form onSubmit={handleSubmit} className='w-full flex flex-col items-start gap-5 bg-violet-50 rounded-xl drop-shadow-xl xl:p-10 lgLp-10 md:p-10 p-5'>

            <h1 className='text-2xl font-bold text-violet-600'>{isEditing ? 'Edit Post' : 'Add New Post'}</h1>

            {/* Blog Title */}
            <div className='w-full flex flex-col gap-2'>
              <label className='text-gray-900 font-semibold'>Blog Title</label>
              <input
                type='text'
                name='title'
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder='Enter blog title'
                className='w-full bg-white focus:outline-none py-2 px-3 rounded border border-slate-300'
              />
              {errors.title && <p className='text-red-500 text-sm'>{errors.title}</p>}
            </div>

            {/* Blog Description */}
            <div className='w-full flex flex-col gap-2'>
              <label className='text-gray-900 font-semibold'>Blog Description</label>
              <textarea
                name='description'
                rows={3}
                placeholder='Enter blog description'
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className='w-full bg-white focus:outline-none py-2 px-3 rounded border border-slate-300 resize-none'
              />
              {errors.description && <p className='text-red-500 text-sm'>{errors.description}</p>}
            </div>

            {/* Blog Thumbnail */}
            <div className='w-full flex flex-col gap-2'>
              <label className='text-gray-900 font-semibold'>Blog Thumbnail</label>
              <input
                ref={fileRef}
                type='file'
                name='thumbnail'
                className='hidden'
                accept="image/jpeg, image/png, image/webp"
                onChange={handleThumbnailChange}
              />

              <button
                type='button'
                onClick={() => fileRef.current.click()}
                className='w-fit flex items-center gap-2 bg-violet-200 text-violet-800 py-2 px-4 rounded-full hover:bg-violet-300 transition-all border  border-violet-800'
              >
                <MdOutlineCloudUpload size={20} />
                <span>{thumbnail ? 'Change File' : 'Choose File'}</span>
              </button>

              {/* Uploading Animation */}
              {uploading && <p className='text-sm text-violet-500 mt-1'>Uploading...</p>}

              {/* Show Selected File */}
              {thumbnail && (
                <div className='flex items-center flex-wrap gap-3 mt-2 bg-white p-2 rounded-lg border border-violet-300'>
                  <img
                    src={getThumbnailPreview()}
                    alt='Thumbnail preview'
                    className='h-40 rounded-lg object-cover border border-violet-300'
                  />
                  <p className='text-sm font-semibold text-gray-700'>{thumbnail.name}</p>
                  <button
                    type='button'
                    onClick={removeThumbnail}
                    className='text-red-500 hover:text-red-700'
                  >
                    <AiOutlineClose size={20} />
                  </button>
                </div>
              )}
            </div>

            {/* Blog Content */}
            <div className='w-full flex flex-col gap-2'>
              <label className='text-gray-900 font-semibold'>Blog Content (Markdown Supported)</label>
              <MarkdownEditor value={markdownContent} onChange={setMarkdownContent} />

              {errors.content && <p className='text-red-500 text-sm'>{errors.content}</p>}
            </div>

            {/* Failure Message */}
            {failure && (
              <p className="xl:w-auto lg:w-auto md:w-auto w-full text-md font-semibold text-red-500  text-center">
                Something went wrong, try again!
              </p>
            )}
            {/* Submit Button */}
            <button
              type='submit'
              className='bg-violet-600 text-white py-3 px-20 rounded-full hover:bg-violet-700 transition-all flex items-center justify-center xl:w-auto lg:w-auto md:w-auto w-full text-lg font-semibold'
            >
              {loading ? (
                <span className='animate-spin border-t-2 border-white rounded-full w-5 h-5'></span>
              ) : (
                isEditing ? 'Update Post' : 'Create Post'
              )}
            </button>
          </form>
        </div>
      </div>
      

    </>
  );
};

export default Post;

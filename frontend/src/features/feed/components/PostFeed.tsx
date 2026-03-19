'use client'

import { useEffect, useState } from 'react'

interface Post {
  id: number
  username: string
  avatar: string
  content: string
  image: string
  time: string
  tags: string[]
}

export const PostFeed = () => {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost:5000/api/posts')
      .then((res) => res.json())
      .then((data) => {
        setPosts(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Error fetching posts:', err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <section className="flex flex-col space-y-3 w-full max-w-2xl mx-auto">
      {/* Git Practice Box */}
      <div className="bg-blue-600/10 border border-blue-500/20 rounded-lg p-3">
        <h4 className="text-blue-400 font-bold text-sm mb-1 flex items-center gap-2">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/100/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Zona de Práctica Git
        </h4>
        <p className="text-xs text-neutral-400">
          Edita <code className="bg-neutral-800 px-1 rounded">posts.json</code> → commit → push.
        </p>
      </div>

      {/* Posts */}
      {posts.map((post) => (
        <div
          key={post.id}
          className="flex bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-colors rounded-md overflow-hidden"
        >
          {/* Sidebar votos */}
          <div className="flex flex-col items-center bg-neutral-950 px-2 py-3 text-neutral-500 min-w-[40px]">
            {/* Upvote */}
            <button className="hover:text-orange-500">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 4l-8 8h16z" />
              </svg>
            </button>

            <span className="text-xs font-bold my-1">{Math.floor(Math.random() * 2000)}</span>

            {/* Downvote */}
            <button className="hover:text-blue-500">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 20l8-8H4z" />
              </svg>
            </button>
          </div>

          {/* Contenido */}
          <div className="flex-1 p-3">
            {/* Header */}
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <img src={post.avatar} alt="avatar" className="w-6 h-6 rounded-full" />
                <span className="text-white font-semibold">u/{post.username}</span>
                <span>•</span>
                <span>{post.time}</span>
              </div>

              {/* menú */}
              <button className="hover:text-white text-neutral-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="19" cy="12" r="1" />
                  <circle cx="5" cy="12" r="1" />
                </svg>
              </button>
            </div>

            {/* contenido */}
            <p className="text-sm text-neutral-200 mb-2 leading-snug">{post.content}</p>

            {/* tags */}
            <div className="flex flex-wrap gap-2 mb-2">
              {post.tags?.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-neutral-800 px-2 py-0.5 rounded hover:bg-neutral-700 cursor-pointer"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* imagen */}
            {post.image && (
              <img
                src={post.image}
                alt="post"
                className="rounded-md max-h-[500px] object-contain mb-2"
              />
            )}

            {/* acciones */}
            <div className="flex items-center gap-4 text-xs text-neutral-400">
              <button className="hover:text-white flex items-center gap-1">
                💬 {Math.floor(Math.random() * 100)}
              </button>

              <button className="hover:text-white flex items-center gap-1">🔁 Compartir</button>

              <button className="hover:text-white flex items-center gap-1">⭐ Guardar</button>
            </div>
          </div>
        </div>
      ))}
    </section>
  )
}

import { Stories } from '@/features/stories/components/Stories'
import { PostFeed } from '@/features/feed/components/PostFeed'
import './globals.css'

export default function Home() {
  return (
    <div className="w-full">
      {/* Stories - Premium Visualization */}
      <Stories />

      {/* Decorative Separator or Gap */}
      <div className="h-6" />
      {/* Main Feed Visualization */}
      <PostFeed />
    </div>
  )
}

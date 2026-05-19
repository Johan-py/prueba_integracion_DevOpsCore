export default function VideoPublicacionCard() {
  return (
    <div className="mt-4 overflow-hidden rounded-xl bg-black">
      <iframe
        className="h-[315px] w-full"
        src="https://www.youtube.com/embed/qMyFQH5q9IM?autoplay=1&mute=1&controls=1&rel=0"
        title="Video tutorial de publicación"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}

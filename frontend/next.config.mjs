const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**'
      },
      //pare permitir cargar las imágenes desde Supabase Storage
      {
        protocol: 'https',
        hostname: 'yiwjlbpbziydpkowvfmd.supabase.co',
        port: '',
        pathname: '/storage/v1/object/**'
      },
      // para permitir imágenes externas de banderas
      {
        protocol: 'https',
        hostname: 'flagcdn.com',
        port: '',
        pathname: '/**'
      },
      // para permitir imágenes de Unsplash
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**'
      }
    ]
  }
}

export default nextConfig

/** @type {import('next').NextConfig} */
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
      },
      // Para desarrollo local con backend
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**', // Permite cualquier ruta dentro de Cloudinary
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '5000',
        pathname: '/**'
      }
    ]
  }
}

export default nextConfig

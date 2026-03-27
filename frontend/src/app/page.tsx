import { HomeBanner } from '@/components/home/HomeBanner';

const fetchBanners = async () => {
  return [{ urlImagen: '/images/portada.webp', id: 1 }]; 
};

export default async function Home() {
  const banners = await fetchBanners();
  const mainBanner = banners[0];

  return (
    <main className="flex min-h-screen flex-col items-center">
      {/* Por problemas se mostrara solo una imagen del proyecto */}
      {mainBanner && <HomeBanner url={mainBanner.urlImagen} />}
      
      <div className="container mx-auto px-4 py-8">
      </div>
    </main>
  );
}
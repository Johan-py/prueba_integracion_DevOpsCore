'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import VideoPublicacionModal from '@/components/video-publicacion/VideoPublicacionModal';

type TutorialContent = {
  titulo: string;
  mensaje: string;
  requisitos?: string[];
  videoUrl: string;
  thumbnailUrl: string | null;
  subtitlesUrl: string | null;
  checkboxLabel: string;
};

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '');

const contenidoDefault: TutorialContent = {
  titulo: 'Antes de publicar tu propiedad',
  mensaje:
    'Mira este video y conoce qué necesitas tener listo para crear tu publicación de forma exitosa.',
  requisitos: [
    'Tipo de inmueble que deseas publicar.',
    'Ubicación o dirección referencial de la propiedad.',
    'Precio de venta, alquiler o anticrético.',
    'Fotografías o recursos multimedia claros de la propiedad.',
  ],
  videoUrl: '',
  thumbnailUrl: null,
  subtitlesUrl: null,
  checkboxLabel: 'Sí entiendo qué necesito para publicar una propiedad',
};

export default function VideoPublicacionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [contenido, setContenido] = useState<TutorialContent | null>(null);

  const getToken = () => localStorage.getItem('token');

  useEffect(() => {
    const cargarTutorial = async () => {
      const token = getToken();

      if (!token) {
        router.replace('/sign-in');
        return;
      }

      try {
        const estadoResponse = await fetch(
          `${API_URL}/api/publicaciones/tutorial/estado`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const estadoResult = await estadoResponse.json().catch(() => null);

        if (estadoResponse.ok && estadoResult?.data?.debeMostrarTutorial === false) {
          router.replace('/registro-inmueble');
          return;
        }

        const contenidoResponse = await fetch(
          `${API_URL}/api/publicaciones/tutorial`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const contenidoResult = await contenidoResponse.json().catch(() => null);

        setContenido(contenidoResult?.data || contenidoDefault);
      } catch (error) {
        console.error('Error al cargar tutorial:', error);
        setContenido(contenidoDefault);
      } finally {
        setLoading(false);
      }
    };

    cargarTutorial();
  }, [router]);

  const continuar = async () => {
    const token = getToken();

    if (!token) {
      router.replace('/sign-in');
      return;
    }

    try {
      await fetch(`${API_URL}/api/publicaciones/tutorial/confirmar`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Error al confirmar tutorial:', error);
    } finally {
      router.replace('/registro-inmueble');
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-sm text-gray-600">Cargando tutorial...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">
      {contenido && (
        <VideoPublicacionModal
          contenido={contenido}
          onClose={() => router.replace('/registro-inmueble')}
          onContinue={continuar}
        />
      )}
    </main>
  );
}

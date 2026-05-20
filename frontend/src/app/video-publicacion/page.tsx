'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import VideoPublicacionModal from '@/components/video-publicacion/VideoPublicacionModal';

type TutorialContent = {
  titulo: string;
  mensaje: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  subtitlesUrl: string | null;
  checkboxLabel: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const contenidoDefault: TutorialContent = {
  titulo: 'Antes de publicar tu propiedad',
  mensaje:
    'Mira este video y conoce qué necesitas tener listo para crear tu publicación de forma exitosa.',
  videoUrl: '',
  thumbnailUrl: null,
  subtitlesUrl: null,
  checkboxLabel: 'Sí entiendo qué necesito para publicar una propiedad',
};

const getToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

const getUsuarioKey = () => {
  const token = getToken();

  if (!token) return 'sin-token';

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));

    return (
      payload.id ||
      payload.userId ||
      payload.usuarioId ||
      payload.sub ||
      payload.email ||
      payload.correo ||
      token
    );
  } catch {
    return token;
  }
};

const getTutorialKey = () => {
  return `propbol-tutorial-publicacion-visto-${getUsuarioKey()}`;
};

export default function VideoPublicacionPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [contenido, setContenido] = useState<TutorialContent | null>(null);

  useEffect(() => {
    const cargarTutorial = async () => {
      const token = getToken();

      if (!token) {
        router.replace('/sign-in');
        return;
      }

      const tutorialKey = getTutorialKey();

      if (localStorage.getItem(tutorialKey) === 'true') {
        router.replace('/registro-inmueble');
        return;
      }

      try {
        const estadoResponse = await fetch(
          `${API_URL}/api/tutorial-publicacion/estado`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const estadoResult = await estadoResponse.json().catch(() => null);

        if (
          estadoResponse.ok &&
          estadoResult?.data?.debeMostrarTutorial === false
        ) {
          localStorage.setItem(tutorialKey, 'true');
          router.replace('/registro-inmueble');
          return;
        }

        const contenidoResponse = await fetch(
          `${API_URL}/api/tutorial-publicacion`,
          {
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
    const tutorialKey = getTutorialKey();

    localStorage.setItem(tutorialKey, 'true');

    try {
      if (token) {
        await fetch(`${API_URL}/api/tutorial-publicacion/confirmar`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Error al confirmar tutorial:', error);
    } finally {
      router.replace('/registro-inmueble');
    }
  };

  const cerrar = () => {
    router.replace('/registro-inmueble');
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
          onClose={cerrar}
          onContinue={continuar}
        />
      )}
    </main>
  );
}

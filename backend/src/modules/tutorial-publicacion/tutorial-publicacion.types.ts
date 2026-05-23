export type TutorialPublicacionContent = {
  titulo: string;
  mensaje: string;
  requisitos: string[];
  videoUrl: string;
  thumbnailUrl: string | null;
  subtitlesUrl: string | null;
  checkboxLabel: string;
};

export type TutorialPublicacionEstado = {
  debeMostrarTutorial: boolean;
  confirmado: boolean;
  confirmadoEn: string | null;
};

export type TutorialPublicacionEstadoRecord = {
  id: number;
  usuario_id: number;
  confirmado: boolean;
  confirmadoEn: Date | null;
};

export type GetTutorialEstadoInput = {
  usuario_id: number;
};

export type ConfirmTutorialInput = {
  usuario_id: number;
};

export type ConfirmTutorialResult = {
  debeMostrarTutorial: boolean;
  confirmado: boolean;
  confirmadoEn: string | null;
};


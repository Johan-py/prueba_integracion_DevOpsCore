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
  usuarioId: number;
  confirmado: boolean;
  confirmadoEn: Date | null;
};

export type GetTutorialEstadoInput = {
  usuarioId: number;
};

export type ConfirmTutorialInput = {
  usuarioId: number;
};

export type ConfirmTutorialResult = {
  debeMostrarTutorial: boolean;
  confirmado: boolean;
  confirmadoEn: string | null;
};

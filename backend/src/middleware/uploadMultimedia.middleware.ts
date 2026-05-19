import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const formatosPermitidos = ["image/jpeg", "image/png"];

  if (formatosPermitidos.includes(file.mimetype)) {
    cb(null, true);
    return;
  }

  cb(new Error("FORMATO_IMAGEN_INVALIDO"));
};

export const uploadMultimedia = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter,
});

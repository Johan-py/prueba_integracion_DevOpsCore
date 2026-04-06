import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import {
  getPublicationMultimediaController,
  registerImagesController,
  registerVideoLinkController,
} from "./multimedia.controller.js";

const multimediaRoutes = Router();

multimediaRoutes.get(
  "/:publicacionId/multimedia",
  requireAuth,
  getPublicationMultimediaController,
);

multimediaRoutes.post(
  "/:publicacionId/multimedia/video-link",
  requireAuth,
  registerVideoLinkController,
);

multimediaRoutes.post(
  "/:publicacionId/multimedia/images",
  requireAuth,
  registerImagesController,
);

export default multimediaRoutes;

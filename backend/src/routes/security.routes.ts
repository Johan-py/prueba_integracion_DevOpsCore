import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  deactivateAccountController,
  validateCurrentPasswordController,
  verifyDeactivateAccountCodeController,
  sendDeactivateAccountCodeController,
  activate2FAController,
  get2FAStatusController,
  sendActivate2FACodeController,
  verifyActivate2FACodeController,
} from "../modules/security/security.controller.js";

const router = Router();

router.post(
  "/validate-password",
  requireAuth,
  validateCurrentPasswordController,
);

router.post(
  "/deactivate-account/send-code",
  requireAuth,
  sendDeactivateAccountCodeController,
);

router.post(
  "/deactivate-account/verify-code",
  requireAuth,
  verifyDeactivateAccountCodeController,
);

router.delete("/deactivate-account", requireAuth, deactivateAccountController);

router.post("/activate-2fa", requireAuth, activate2FAController);
router.get("/2fa-status", requireAuth, get2FAStatusController);

export default router;

router.post(
  "/activate-2fa/send-code",
  requireAuth,
  sendActivate2FACodeController,
);

router.post(
  "/activate-2fa/verify-code",
  requireAuth,
  verifyActivate2FACodeController,
);

import { Router } from "express";
import {
  login,
  logout,
  refreshTokenHandler,
  register,
} from "./auth.controller";

const router = Router();

router.post("/login", login);
router.post("/refresh", refreshTokenHandler);
router.post("/logout", logout);
router.post("/register", register);

export default router;

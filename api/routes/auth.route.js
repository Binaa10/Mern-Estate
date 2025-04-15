import express from "express";
<<<<<<< HEAD
import { signin, signup, google } from "../controllers/auth.controller.js";
=======
import { signin, signup } from "../controllers/auth.controller.js";
>>>>>>> 4582ba938212d83efeeaf709c00eca4e781d4bf6

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
<<<<<<< HEAD
router.post("/google", google);
=======
>>>>>>> 4582ba938212d83efeeaf709c00eca4e781d4bf6

export default router;

import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { createUserController, deleteUserController, getUserController, updateUserController } from "../controllers/adminController.js";

const router = Router();



// authentication routes of admin
router.use(authenticate, authorize('ADMIN'));


//to get all the users
router.get("/users", getUserController)


// to create a ew user
router.post("/users", createUserController)


// to update the details of a user
router.put("users/:id", updateUserController)

// to delete a user (soft delete by making active false)

router.delete("/users/:id", deleteUserController)

export default router;
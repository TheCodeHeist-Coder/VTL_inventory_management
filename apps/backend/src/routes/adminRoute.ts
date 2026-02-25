import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { createBlockController, createDistrictController, createStateController, createUserController, deleteBlockController, deleteDistrictController, deleteStateController, deleteUserController, getAllBlocksController, getAllDistrictsController, getAllStatesController, getUserController, updateBlockController, updateDistrictController, updateStateController, updateUserController } from "../controllers/adminController.js";

const router = Router();


//! USER MANAGEMENT ROUTES

// authentication routes of admin
router.use(authenticate, authorize('ADMIN'));


//to get all the users
router.get("/users", getUserController)


// to create a ew user
router.post("/users", createUserController)


// to update the details of a user
router.put("/users/:id", updateUserController)

// to delete a user (soft delete by making active false)

router.delete("/users/:id", deleteUserController)








//! STATE MANAGEMENT ROUTES

// state management
router.get("/states", getAllStatesController)

/// create states
router.post("/states", createStateController)

/// update state
router.put("/states/:id", updateStateController)

// delete state
router.delete("/states/:id", deleteStateController)



//! DISTRICT MANAGEMENT ROUTES

// to get all the districts of a state
router.get("/districts", getAllDistrictsController)

/// to create a district
router.post("/districts", createDistrictController)

// to update or edit the district
router.put("/districts/:id", updateDistrictController)

// deletes the district
router.delete("/districts/:id", deleteDistrictController)




//! BLOCK MANAGEMENT ROUTES

// to get all the blocks of a district with all the information related to it like sites, users, inventory etc
router.get("/blocks", getAllBlocksController)

// to create a block
router.post("/blocks", createBlockController)

// to update or edit the block
router.put("/blocks/:id", updateBlockController)

// deletes the block
router.delete("/blocks/:id", deleteBlockController)





export default router;
import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { createUserController, deleteUserController, getUserController, updateUserController } from "../controllers/admin/user.js";
import { createStateController, deleteStateController, getAllStatesController, updateStateController } from "../controllers/admin/state.js";
import { createDistrictController, deleteDistrictController, getAllDistrictsController, updateDistrictController } from "../controllers/admin/district.js";
import { createBlockController, deleteBlockController, getAllBlocksController, updateBlockController } from "../controllers/admin/block.js";
import { createSiteController, deleteSiteController, getAllSitesController, updateSiteController } from "../controllers/admin/sites.js";
import { getInventoriesController, inventoryItemsController } from "../controllers/admin/inventory.js";

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




//! site management

/// to get all the sites
router.get("/sites", getAllSitesController)

// to create a site
router.post("/sites", createSiteController)

// to edit or update a site
router.put("/sites/:id", updateSiteController)

/// to delete a site
router.delete("/sites/:id", deleteSiteController)





//! Inventory Management

// to get a inventory
router.get("/inventories", getInventoriesController)


// to manage items in inventory
router.post("/inventory-items", inventoryItemsController)


export default router;
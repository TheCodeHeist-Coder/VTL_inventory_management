import { Router } from "express";
import { siteEnggDashboardController, siteEnggReceivedItemsController, siteEnggRequestController } from "../controllers/siteEnggController.js";
import { appendFile } from "node:fs";
import { authenticate, authorize } from "../middleware/auth.js";

const router:Router = Router();


router.use(authenticate, authorize('SITE_ENGINEER'))

// to get all the data for dashboard
router.get("/dashboard", siteEnggDashboardController)

// to creaet the requests for material
router.post("/requests", siteEnggRequestController)


// after receiving the items, remark -> done
router.put("/requests/:id/received", siteEnggReceivedItemsController)

export default router
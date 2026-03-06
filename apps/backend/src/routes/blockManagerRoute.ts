import { Router } from "express";
import { blockManagerCancelRequests, blockManagerDashBoardController, blockManagerModifyRequestsController, blockManagerRequestsController, blockMangerApproveRequestsController } from "../controllers/blockManagerController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();


router.use(authenticate, authorize('BLOCK_MANAGER'));

// to get data for dashboard
router.get('/dashboard', blockManagerDashBoardController)


// to get all the requests of an indivisual site-engineer
router.get('/requests', blockManagerRequestsController)

// to approve the requests
router.put('/requests/:id/approve', blockMangerApproveRequestsController)

// to modify the requests
router.put('/requests/:id/modify', blockManagerModifyRequestsController)

// to cancel the request
router.put('/requests/:id/cancel', blockManagerCancelRequests)


export default router;
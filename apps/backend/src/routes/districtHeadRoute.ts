import { Router } from "express";
import { districtHeadAllRequestsController, districtHeadDashboardController, districtHeadRejectRequestControlller, districtHeadRequestApproveController } from "../controllers/districtHeadController.js";

const router = Router();


// to get details for district-head dashboard
router.get('/dashboard', districtHeadDashboardController)


// to get all the requests
router.get('/requests', districtHeadAllRequestsController)


// to approve the requests
router.put('/requests/:id/approve', districtHeadRequestApproveController)


// to reject the requests
router.put('/requests/:id/approve', districtHeadRejectRequestControlller)


export default router;
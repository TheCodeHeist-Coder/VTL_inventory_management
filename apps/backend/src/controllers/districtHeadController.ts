import { prisma } from "@repo/db";
import { Request, Response } from "express"

export const districtHeadDashboardController = async (req: Request, res: Response) => {

    try {
        const user = req.user;

        if (!user.districtId) {
            return res.status(400).json({ error: 'No district assigned.' });
        }


        const district = await prisma.district.findUnique({
            where: { id: user.districtId },
            include: {
                blocks: {
                    include: {
                        inventory: { include: { items: true } },
                        users: { select: { id: true, name: true, role: true, email: true } },
                        sites: {
                            include: {
                                users: { select: { id: true, name: true, role: true, email: true } }
                            }
                        },
                        materialRequests: {
                            orderBy: { createdAt: 'desc' },
                            include: {
                                items: true,
                                siteEngineer: { select: { name: true, email: true } },
                                site: { select: { id: true, name: true } }
                            }
                        }
                    }
                }
            }
        });

        const pendingApprovals = await prisma.materialRequest.count({
            where: {
                block: { districtId: user.districtId },
                status: 'APPROVED_BY_BM'
            }
        });

        res.json({ district, pendingApprovals });


    } catch (error) {
        console.error('Error while loading dashboard:', error);
        res.status(500).json({ error: 'Server error.' });

    }


}



export const districtHeadAllRequestsController = async(req:Request, res:Response) => {
    try {
         const requests = await prisma.materialRequest.findMany({
            where: {
                block: { districtId: req.user.districtId as string},
                status: { in: ['APPROVED_BY_BM', 'APPROVED_BY_DH', 'FULFILLED', 'RECEIVED'] }
            },
            orderBy: { createdAt: 'desc' },
            include: {
                items: true,
                siteEngineer: { select: { name: true, email: true } },
                block: { select: { name: true } },
                site: { select: { id: true, name: true } }
            }
        });
    } catch (error) {
         console.error('Getting error in fetching requests:', error);
        res.status(500).json({ error: 'Internal Server error.' });
    }
}


// to approve the requests
export const districtHeadRequestApproveController = async(req:Request, res:Response) => {
    try {
        const {id} = req.params;
        const {remarks} = req.body;

        const request = await prisma.materialRequest.findUnique({
            where: { id: id as string },
            include: { block: true }
        });

        if (!request || request.block.districtId !== req.user.districtId) {
            return res.status(403).json({ error: 'Not authorized for this request.' });
        }

         if (request.status !== 'APPROVED_BY_BM') {
            return res.status(400).json({ error: 'Request must be approved by Block Manager first.' });
        }

        await prisma.materialRequest.update({
            where: { id: id as string },
            data: { status: 'APPROVED_BY_DH', dhRemarks: remarks }
        });

           res.json({ message: 'Request approved by District Head.' });
        } catch (error) {
         console.error('Getting error in approving requests:', error);
        res.status(500).json({ error: 'Internal Server error.' });
    }

}




export const districtHeadRejectRequestControlller = async(req: Request, res:Response) => {
    try {

         const { id } = req.params;
        const { remarks } = req.body;


        const request = await prisma.materialRequest.findUnique({
            where: { id: id as string },
            include: { block: true }
        });

        if (!request || request.block.districtId !== req.user.districtId) {
            return res.status(403).json({ error: 'Not authorized.' });
        }

         await prisma.materialRequest.update({
            where: { id: id as string},
            data: { status: 'REJECTED_BY_DH', dhRemarks: remarks }
        });


          res.json({ message: 'Request rejected by District Head.' });

        
    } catch (error) {
        console.error('Errror while rejecting request:', error);
        res.status(500).json({ error: 'Internal Server error.' });
    }
}
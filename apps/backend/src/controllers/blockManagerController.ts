import { prisma } from "@repo/db";
import { Request, Response } from "express"
import { error } from "node:console";
import router from "../routes/authRoute.js";

export const blockManagerDashBoardController = async (req: Request, res: Response) => {

    try {
        const user = req.user;

        if (!user.blockId) {
            return res.status(400).json({
                error: 'No block Assigned'
            })
        }


        // getting all the details related to that block
        const block = await prisma.block.findUnique({
            where: { id: user.blockId as string },
            include: {
                district: { select: { name: true } },
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
        })

        // getting pending requests for approval
        const pendingRequests = await prisma.materialRequest.count({
            where: {
                blockId: user.blockId,
                status: 'PENDING'
            }
        });

        res.json({
            block,
            pendingRequests
        })


    } catch (error) {
        console.error('Block manager dashboard loadin error:', error);
        res.status(500).json({ error: 'Internal Server error.' });
    }
}


// to get all the requests of an indivisual site-engineer
export const blockManagerRequestsController = async (req: Request, res: Response) => {
    try {

        const requests = await prisma.materialRequest.findMany({
            where: { blockId: req.user.blockId as string },
            orderBy: { createdAt: 'desc' },
            include: {
                items: true,
                siteEngineer: { select: { name: true, email: true } },
                site: { select: { id: true, name: true } }
            }
        })

        res.json(requests)
    } catch (error) {
        console.error('Error while getting requests:', error);
        res.status(500).json({ error: 'Internal Server error.' });
    }
}


// to approve the requests
export const blockMangerApproveRequestsController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { remarks } = req.body;

        const request = await prisma.materialRequest.findUnique({
            where: { id: id as string }
        });


        if (!request || request.blockId !== req.user.blockId) {
            return res.status(403).json({
                error: 'Not authorized'
            })
        }

        if (request.status !== 'PENDING' && request.status !== 'MODIFIED') {
            4
            return res.status(400).json({
                error: 'Can only approve pending or modified requests'
            })
        }

        await prisma.materialRequest.update({
            where: { id: id as string },
            data: { status: 'APPROVED_BY_BM', bmRemarks: remarks }
        })

        res.json({
            message: 'Request approved by Block Manager'
        })
    } catch (error) {
        console.error('Error while request approval:', error);
        res.status(500).json({ error: 'Internal Server error.' });
    }

}


// to modify the requests
export const blockManagerModifyRequestsController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { remarks, items } = req.body;

        const request = await prisma.materialRequest.findUnique({
            where: { id: id as string },
            include: { items: true }
        })

        if (!request || request.blockId !== req.user.blockId) {
            return res.status(403).json({ error: 'Not authorized.' });
        }


        if (request.status !== 'PENDING') {
            return res.status(400).json({ error: 'Can only modify pending requests.' });
        }


        // modify requests with items or material
        await prisma.$transaction(async (tx) => {
            if (items && items.length > 0) {
                for (const item of items) {
                    await tx.materialRequestItem.update({
                        where: { id: item.id },
                        data: { modifiedQuantity: item.modifiedQuantity }
                    })
                }
            }

            await tx.materialRequest.update({
                where: { id: id as string },
                data: { status: 'MODIFIED', bmRemarks: remarks }
            })
        })

        res.json({ message: 'Request modified by Block Manager.' });

    } catch (error) {
        console.error('Error while modifying request:', error);
        res.status(500).json({ error: 'Internal Server error.' });
    }
}


// to cancel the requests
export const blockManagerCancelRequests = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { remarks } = req.body;

        const request = await prisma.materialRequest.findUnique({
            where: { id: id as string }
        });

        if (!request || request.blockId !== req.user.blockId) {
            return res.status(403).json({ error: 'Not authorized.' });
        }

        await prisma.materialRequest.update({
            where: { id: id as string },
            data: { status: 'CANCELLED', bmRemarks: remarks }
        });

        res.json({ message: 'Request cancelled by Block Manager.' });
    } catch (error) {
        console.error('Error while cancelling request:', error);
        res.status(500).json({ error: 'Internal Server error.' });
    }
}
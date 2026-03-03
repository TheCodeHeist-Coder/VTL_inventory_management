import { prisma } from "@repo/db";
import { Request, Response } from "express"
import { Result } from "../../../../packages/db/dist/generated/prisma/internal/prismaNamespace.js";
import { any, string } from "zod";



interface CreateMaterialRequestBody {
  items: {
    materialName: string;
    quantity: number | string;
    unit: string;
  }[];
  remarks?: string;
}

// extract the details for siteEngg dashboard
export const siteEnggDashboardController = async(req:Request, res:Response) => {

    try {
        
        const user = req.user;

        if(!user.blockId) {
            return res.status(400).json({
                error: 'No block Assigned'
            })
        }

        const block = await prisma.block.findUnique({
            where: {
                id: user.blockId
            },
            select: {name: true, district: {select: {name: true}}}
        });

        const site = user.siteId ? await prisma.site.findUnique({
            where: {id: user.siteId},
            select: {id: true ,name: true, code: true}
        }) : null;

        const requests = await prisma.materialRequest.findMany({
            where: {siteEngineerId: user.id},
            orderBy: {createdAt: 'desc'},
            include: {items: true}
        })

        const stats = {
            total: requests.length,
            pending: requests.filter(r => r.status === 'PENDING').length,
            approved: requests.filter(r => ['APPROVED_BY_DM', 'APPROVED_BY_DH'].includes(r.status)).length,
            fulfilled: requests.filter(r => r.status === 'FULFILLED').length,
            received: requests.filter(r => r.status === 'RECEIVED').length,
            rejected: requests.filter(r => ['REJECTED_BY_BM', 'REJECTED_BY_DH', 'CANCELLED'].includes(r.status)).length
        }

        res.json({
            block,
            site,
            requests,
            stats
        })



    } catch (error) {
         console.error(' Error while fetching Dashboard:', error);
        res.status(500).json({ error: ' Internal Server error.' });
    }

}



// crearting request
export const siteEnggRequestController = async(req:Request<{}, {} ,CreateMaterialRequestBody>, res:Response) => {
    try {
        const {items, remarks} = req.body;
        const user = (req as any).user;

       if (!user.blockId) {
           return res.status(400).json({ error: 'No block assigned.' });
          }

      if (!items || items.length === 0) {
         return res.status(400).json({ error: 'At least one item is required.' });
        }


        const request = await prisma.materialRequest.create({
           data: {
                siteEngineerId: user.id,
                blockId: user.blockId,
                siteId: user.siteId || null,
                remarks,
                items: {
                    create: items.map(item => ({
                        materialName: item.materialName,
                        quantity: parseFloat(String(item.quantity)),
                        unit: item.unit
                    }))
                }
            },
        })

    } catch (error) {
         console.error('error while creating request :', error);
      return res.status(500).json({ error: 'Internal Server error.' });
    }
}



export const siteEnggReceivedItemsController = async(req:Request, res:Response) => {
    try {
        const {id} = req.params;

        const request = await prisma.materialRequest.findUnique({
            where: {id: id as string}
        })

        if(!request || request.siteEngineerId !== req.user.id) {
             return res.status(403).json({ error: 'Not authorized.' });
        }

        if (request.status !== 'FULFILLED') {
            return res.status(400).json({ error: 'Material must be fulfilled before marking received.' });
        }

         await prisma.materialRequest.update({
            where: { id: id as string },
            data: { status: 'RECEIVED' }
        });
        
        res.json({ message: 'Material marked as received.' });
    } catch (error) {
        console.error('error during marking received:', error);
        res.status(500).json({ error: 'Internal Server error.' });
    }
}

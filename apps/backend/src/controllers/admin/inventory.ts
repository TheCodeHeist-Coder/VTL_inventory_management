import { Request, Response } from "express";
import { prisma } from "@repo/db"


// to get all the inventories
export const getInventoriesController = async (req: Request, res: Response) => {
    try {

        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.max(100, Math.max(1, parseInt(req.query.limit as string) || 20));
        const skip = (page - 1) * limit;

        const [inventories, total] = await Promise.all([
            prisma.inventory.findMany({
                include: {
                    items: true,
                    block: {
                        include: {
                            district: { select: { id: true, name: true } },
                            users: {
                                where: { role: 'STORE_MANAGER', active: true },
                                select: { id: true, name: true, phone: true, email: true, role: true }
                            }
                        }
                    }
                },
                skip,
                take: limit
            }),
            prisma.inventory.count()
        ]);

        res.json({
            data: inventories,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        })

    } catch (error) {
        console.error("Error fetching inventories:", error);
        res.status(500).json({ error: "An error occurred while fetching inventories." });
    }
}


// to create an inventory
export const inventoryItemsController = async (req: Request, res: Response) => {

    try {
        
    


    } catch (error) {
        
    }

}
   
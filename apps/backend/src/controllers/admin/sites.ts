
import { Request, Response } from "express";
import { prisma } from "@repo/db"


// get all the sites with pagination and also include the block and district details in the response
export const getAllSitesController = async (req: Request, res: Response) => {

    try {

        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
        const skip = (page - 1) * limit;

        const [sites, total] = await Promise.all([
            prisma.site.findMany({
                include: {
                    block: { select: { id: true, name: true, district: { select: { id: true, name: true } } } },
                    users: { select: { id: true, name: true, email: true, role: true, phone: true } }
                },
                skip,
                take: limit
            }),
            prisma.site.count()
        ]);

        res.json({
            data: sites,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        })


    } catch (error) {
        console.log('Error while fetching sites:', error);
        res.status(500).json({ error: 'Internal server error' })
    }


}



// create a site

export const createSiteController = async (req: Request, res: Response) => {
    try {

        const { name, code, blockId } = req.body;

        if (!name || !code) {
            return res.status(400).json({ error: 'Name, code and blockId are required' })
        }

        const site = await prisma.site.create({
            data: {
                name,
                code,
                blockId: blockId || null
            }
        })
        res.status(201).json(site)

    } catch (error) {
        console.log('Error while creating site:', error);
        res.status(500).json({ error: 'Internal server error' })
    }
}


// to edite and update the site

export const updateSiteController = async (req: Request, res: Response) => {

    try {
        const { name, code, blockId } = req.body;
        const data: Record<string, any> = {};

        if (name !== undefined) data.name = name;
        if (code !== undefined) data.code = code;
        if (blockId !== undefined) data.blockId = blockId || null;

        const site = await prisma.site.update({
            where: {
                id: req.params.id as string
            },
            data
        })

        res.json(site)

    } catch (error) {
        console.log('Error while updating site:', error);
        res.status(500).json({ error: 'Internal server error' })
    }


}


// to delete a site
export const deleteSiteController = async (req: Request, res: Response) => {
    try {
        await prisma.site.delete({
            where: {
                id: req.params.id as string
            }
        })

        res.json({
            message: "Site Deleted Successfully"
        })
    } catch (error) {
        console.log('Error while deleting site:', error);
        res.status(500).json({ error: 'Internal server error' })
    }
}
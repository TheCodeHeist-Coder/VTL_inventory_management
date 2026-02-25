
import { Request, Response } from 'express';
import { prisma } from '@repo/db';


//! BLOCK MANAGEMENT

// to get all the blocks of a district with all the information related to it like sites, users, inventory etc
export const getAllBlocksController = async (req: Request, res: Response) => {

    try {
        const blocks = await prisma.block.findMany({
            include: {
                district: { select: { id: true, name: true, state: { select: { id: true, name: true } } } },
                inventory: { include: { items: true } },
                users: { select: { id: true, name: true, role: true, email: true } },
                sites: { include: { users: { select: { id: true, name: true, role: true, email: true } } } }
            }
        })
        res.json(blocks)
    } catch (error) {
        console.log('Error while fetching blocks', error)
        res.status(500).json({ error: 'Internal Server Error' })
    }

}



// create block
export const createBlockController = async (req: Request, res: Response) => {
    try {
        const { name, code, districtId } = req.body;
        if (!name || !code) {
            return res.status(400).json({ error: 'Name and code are required.' });
        }

        const block = await prisma.block.create({
            data: {
                name,
                code,
                districtId: districtId || null
            }

        })

        // auto create inventory for the block
        await prisma.inventory.create({
            data: {
                blockId: block.id
            }
        })

        res.status(201).json(block)


    } catch (error) {
        console.log('Error while creating block', error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
}


// to update the block details
export const updateBlockController = async (req: Request, res: Response) => {

    try {
        const { name, code, districtId } = req.body;

        const data: Record<string, any> = {};
        if (name !== undefined) data.name = name;
        if (code !== undefined) data.code = code;
        if (districtId !== undefined) data.districtId = districtId || null;

        const block = await prisma.block.update({
            where: {
                id: req.params.id as string
            },
            data
        })

        res.json(block)
    } catch (error) {
        console.error('Update block error:', error);
        res.status(500).json({ error: 'Server error.' });
    }



}


// to delete the block
export const deleteBlockController = async (req: Request, res: Response) => {
    try {
        await prisma.block.delete({
            where: {
                id: req.params.id as string
            }
        })
        res.json({ message: 'Block deleted successfully.' })
    } catch (error) {
        console.error('Delete block error:', error);
        res.status(500).json({ error: 'Server error.' });
    }

}

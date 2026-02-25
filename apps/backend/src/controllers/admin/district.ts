import { Request, Response } from 'express';
import {prisma} from "@repo/db"



//! DISRICT MANAGEMENT

// to get all the districts of a state with all the information related to it like blocks, sites, users etc
export const getAllDistrictsController = async (req: Request, res: Response) => {
    try {

        const districts = await prisma.district.findMany({
            include: {
                state: { select: { id: true, name: true } },
                blocks: {
                    include: {
                        inventory: { include: { items: true } },
                        sites: { include: { users: { select: { id: true, name: true, role: true, email: true } } } }
                    }
                },
                users: { select: { id: true, name: true, role: true, email: true } }
            }
        });

        res.json(districts)
    } catch (error) {
        console.log('Error while fetching districts', error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
}


// creating a new district under a state

export const createDistrictController = async (req: Request, res: Response) => {

    try {
        const { name, code, stateId } = req.body;
        if (!name || !code) {
            return res.status(400).json({ error: 'Name and code are required.' });
        }

        const district = await prisma.district.create({
            data: {
                name,
                code,
                stateId: stateId || null
            }
        })

        res.status(201).json(district)


    } catch (error) {
        console.log('Error while creating district', error)
        res.status(500).json({ error: 'Internal Server Error' })
    }

}



export const updateDistrictController = async (req: Request, res: Response) => {
    try {
        const { name, code, stateId } = req.body;

        const data: Record<string, any> = {};

        if (name !== undefined) data.name = name;
        if (code !== undefined) data.code = code;
        if (stateId !== undefined) data.stateId = stateId || null;

        const district = await prisma.district.update({
            where: { id: req.params.id as string },
            data
        });
        res.json(district);
    } catch (error) {
        console.error('Update district error:', error);
        res.status(500).json({ error: 'Server error.' });
    }


}


// dlete the districts
export const deleteDistrictController = async (req: Request, res: Response) => {

    try {
        await prisma.district.delete({ where: { id: req.params.id as string } });
        res.json({ message: 'District deleted.' });
    } catch (error) {
        console.error('Delete district error:', error);
        res.status(500).json({ error: 'Server error.' });
    }

}
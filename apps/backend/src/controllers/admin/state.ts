
import { Request, Response } from "express";
import { prisma } from "@repo/db";


//! STATE_MANAGEMENT
// get all the states
export const getAllStatesController = async (req: Request, res: Response) => {

    try {
        const states = await prisma.state.findMany({
            include: { districts: { select: { id: true, name: true } } },
            orderBy: { name: 'asc' }
        })
        res.json(states)
    } catch (error) {
        console.log("Error while fetching states", error);
        res.status(500).json({ error: "Internal Server Error" })
    }
}




// create states
export const createStateController = async (req: Request, res: Response) => {
    try {

        const { name, code } = req.body;

        if (!name || !code) {
            return res.status(400).json({ error: "Name and code are required" })
        }

        const state = await prisma.state.create({
            data: {
                name,
                code
            }
        })

        res.status(201).json(state)


    } catch (error) {
        console.log('Create state error', error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
}



// edit stated
export const updateStateController = async (req: Request, res: Response) => {
    try {
        const { name, code } = req.body;
        const data: Record<string, any> = {};
        if (name !== undefined) data.name = name;
        if (code !== undefined) data.code = code;

        const state = await prisma.state.update({
            where: {
                id: req.params.id as string
            },
            data
        });
        res.json(state);

    } catch (error) {
        console.log('Updating state error', error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
}


// deleting state
export const deleteStateController = async (req: Request, res: Response) => {
    try {
        await prisma.state.delete({
            where: {
                id: req.params.id as string
            }
        });
        res.json({
            message: 'State Deleted'
        })
    } catch (error) {
        console.log('Delete state error', error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
}





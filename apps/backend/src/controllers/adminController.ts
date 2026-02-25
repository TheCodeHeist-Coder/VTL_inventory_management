import { prisma } from "@repo/db"
import { Response, Request } from "express"
import bcrypt from "bcryptjs";
import { userSchema } from "../validations/userSchema.js";
import { stat } from "node:fs";


//! USER MANAGEMENT

// to get all the users
export const getUserController = async (req: Request, res: Response) => {

    try {
        const users = await prisma.user.findMany({
            select: {
                id: true, name: true, email: true, phone: true, role: true, active: true, stateId: true, districtId: true, blockId: true, siteId: true, createdAt: true,
                state: { select: { id: true, name: true } },
                district: { select: { id: true, name: true, state: { select: { id: true, name: true } } } },
                block: { select: { id: true, name: true } },
                site: { select: { id: true, name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(users)
    } catch (error) {

        console.log('Error in fetching users', error)
        res.status(500).json({ error: "Internal Server Error" })

    }


}





// to create a new user
export const createUserController = async (req: Request, res: Response) => {

    try {

        const result = userSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(401).json({
                error: 'Invalid inputs',
            })
        }

        const { name, email, password, phone, role, stateId, districtId, blockId, siteId } = result.data;


        const isUserExisted = await prisma.user.findUnique({
            where: { email }
        })

        if (isUserExisted) {
            return res.status(400).json({ error: "User with this email already exists" })
        }


        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                phone,
                role,
                stateId: stateId || null,
                districtId: districtId || null,
                blockId: blockId || null,
                siteId: siteId || null
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                stateId: true,
                districtId: true,
                blockId: true,
                siteId: true
            }
        })

        res.status(201).json(user)

    } catch (error) {
        console.log("Error during creating user", error);
        res.status(500).json({ error: "Internal Server Error" })
    }


}



// to update the user details
export const updateUserController = async (req: Request, res: Response) => {
    try {

        const { name, email, phone, role, stateId, districtId, blockId, siteId, active, password } = req.body;

        const data: Record<string, any> = {};

        if (name) data.name = name;
        if (email) data.email = email;
        if (phone !== undefined) data.phone = phone;
        if (role) data.role = role;
        if (stateId !== undefined) data.stateId = stateId || null;
        if (districtId !== undefined) data.districtId = districtId || null;
        if (blockId !== undefined) data.blockId = blockId || null;
        if (siteId !== undefined) data.siteId = siteId || null;
        if (active !== undefined) data.active = active;
        if (password) data.password = await bcrypt.hash(password, 10);


        const user = await prisma.user.update({
            where: { id: req.params.id as string },
            data,
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                stateId: true,
                districtId: true,
                blockId: true,
                siteId: true,
                active: true
            }
        })

        res.json(user)
    } catch (error) {
        console.log('Error while updating user', error)
        res.status(500).json({
            error: 'Internal Server Error'
        })
    }
}




// to dlete the user
export const deleteUserController = async (req: Request, res: Response) => {
    try {
        await prisma.user.update({
            where: { id: req.params.id as string },
            data: { active: false }
        })

        res.json({ message: "User deactivated successfully" })

    } catch (error) {
        console.log('Error while deleting user', error)
        res.status(500).json({
            error: 'Internal Server Error'
        })
    }
}






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
    
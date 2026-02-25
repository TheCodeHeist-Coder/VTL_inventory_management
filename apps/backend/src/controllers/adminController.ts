import { prisma } from "@repo/db"
import { Response, Request } from "express"
import bcrypt from "bcryptjs";
import { userSchema } from "../validations/userSchema.js";
import { stat } from "node:fs";



// to get all the users
export const getUserController = async(req:Request , res: Response) => {

    try {
        const users = await prisma.user.findMany({
            select: {
                id: true, name: true, email: true, phone: true, role: true, active: true,stateId: true, districtId: true, blockId: true, siteId: true, createdAt: true,
                 state: { select: { id: true, name: true } },
                district: {select: {id: true, name: true,  state: {select : {id:true, name:true}} } },
                block: {select: {id: true, name: true}},
                site: {select: {id: true, name: true}}
            },
            orderBy: {createdAt: 'desc'}
        });

        res.json(users)
    } catch (error) {

        console.log('Error in fetching users', error)
        res.status(500).json({error: "Internal Server Error"})
        
    }


}





// to create a new user

export const createUserController = async (req: Request, res:Response) => {

    try {

        const result = userSchema.safeParse(req.body);
        if(!result.success){
            return res.status(401).json({
                error: 'Invalid inputs',
            })
        }

        const {name, email, password, phone, role, stateId, districtId, blockId, siteId} = result.data;


          const isUserExisted = await prisma.user.findUnique({
            where: {email}
          })

          if(isUserExisted){
            return res.status(400).json({error: "User with this email already exists"})
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
        res.status(500).json({error: "Internal Server Error"})
    }


}



// to update the user details
export const updateUserController = async (req: Request, res: Response) => {
        try {

       const {name, email, phone, role,stateId, districtId, blockId, siteId, active, password} = req.body;

       const data: Record<string, any> = {};

       if(name) data.name = name;
       if(email) data.email = email;
       if (phone !== undefined) data.phone = phone;
       if(role) data.role = role;
       if(stateId !== undefined) data.stateId = stateId || null;
       if(districtId !== undefined) data.districtId = districtId || null;
       if(blockId !== undefined) data.blockId = blockId || null;
       if(siteId !==  undefined) data.siteId = siteId || null;
       if(active !== undefined) data.active = active;
       if (password) data.password = await bcrypt.hash(password, 10);


        const user = await prisma.user.update({
            where: {id: req.params.id as string},
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
            where: {id: req.params.id as string},
            data: {active: false}
        })

        res.json({message: "User deactivated successfully"})

    } catch (error) {
         console.log('Error while deleting user', error)
            res.status(500).json({
                error: 'Internal Server Error'
            })
    }
}
import { prisma } from "@repo/db";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";





export const loginController = async (req: Request, res: Response) => {

    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: "Email and password are required"
            })
        }

        // user ko email se dhundho
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                district: { select: { id: true, name: true, state: { select: { id: true, name: true } } } },
                block: { select: { id: true, name: true, } }
            }
        })

        if (!user || !user.active) {
            return res.status(401).json({
                error: "Invalid Credentials"
            })
        }

        // password check
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({
                error: "Invalid Credentials"
            })
        }
         

        // generate JWT token
        const token = jwt.sign(
            {
                id: user.id,
                role: user.role,
            },
            process.env.JWT_SECRET || "secret",
            { expiresIn: "24h" }
        );


        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                districtId: user.districtId,
                blockId: user.blockId,
                districtName: user.district?.name || null,
                blockName: user.block?.name || null,
                stateName: user.district?.state?.name || null
            }
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            error: "Internal Server Error"
        })
    }

}

// check karne ke liye ki token sahi se generate ho raha hai ya nahi, aur middleware sahi se kaam kar raha hai ya nahi
export const iAM = async (req: Request, res: Response) => {
    res.json({
        user: (req as any).user
    })
}
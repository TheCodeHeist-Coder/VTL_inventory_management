import { prisma } from "@repo/db";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {

    try {

        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };

        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, name: true, email: true, districtId: true, blockId: true, active: true }
        })

        if (!user || !user.active) {
            return res.status(401).json({ message: "Unauthorized or Inactive User" });
        }

        (req as any).user = user;
        next();

    } catch (error) {

        return res.status(401).json({ message: "Invalid Token" });

    }

}


export const authorize = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user;

        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (!roles.includes(user.role)) {
            return res.status(403).json({ message: "Access Denied. Insufficient permissions" });
        }

        next();
    }
}
import { prisma, Prisma } from "@repo/db";
import { Request, Response } from "express"


// get details for admin dashboard
export const adminDashboardController = async (req: Request, res: Response) => {

    try {
        const stateId = req.query.stateId ? req.query.stateId as string : null;



        //? for building scope filters based on state
        const districtWhere: Prisma.DistrictWhereInput = stateId ? { stateId } : {};
        const blockWhere: Prisma.BlockWhereInput = stateId ? { district: { stateId } } : {};
        const userWhere: Prisma.UserWhereInput = stateId ? { active: true, district: { stateId } } : { active: true };
        const requestWhere = stateId ? { block: { district: { stateId } } } : {};
        const siteWhere = stateId ? { block: { district: { stateId } } } : {};
        const inventoryWhere: Prisma.InventoryWhereInput = stateId ? { block: { district: { stateId } } } : {};

        const [states, districts, blocks, users, pendingRequests, totalRequests, approvedRequests, fulfilledRequests, cancelledRequests, inventories, sitesCount] = await Promise.all([
            prisma.state.count(),
            prisma.district.count({ where: districtWhere }),
            prisma.block.count({ where: blockWhere }),
            prisma.user.count({ where: userWhere }),
            prisma.materialRequest.count({ where: { ...requestWhere, status: { in: ['PENDING', 'APPROVED_BY_BM'] } } }),
            prisma.materialRequest.count({ where: requestWhere }),
            prisma.materialRequest.count({ where: { ...requestWhere, status: { in: ['APPROVED_BY_BM', 'APPROVED_BY_DH'] } } }),
            prisma.materialRequest.count({ where: { ...requestWhere, status: 'FULFILLED' } }),
            prisma.materialRequest.count({ where: { ...requestWhere, status: 'CANCELLED' } }),
            prisma.inventory.findMany({ where: inventoryWhere, include: { items: true, block: { include: { district: true } } } }),
            prisma.site.count({ where: siteWhere })
        ]);


        const recentRequests = await prisma.materialRequest.findMany({
            where: requestWhere,
            take: 50,
            orderBy: { createdAt: 'desc' },
            include: {
                siteEngineer: { select: { name: true, phone: true } },
                block: { select: { name: true, district: { select: { name: true } } } },
                site: { select: { id: true, name: true } },
                items: true
            }
        });


        const statesData = await prisma.state.findMany({
            include: {
                districts: {
                    select: { id: true, name: true, _count: { select: { blocks: true, users: true } } }
                }
            },
            orderBy: { name: 'asc' }
        });


        res.json({
            stats: {
                states,
                districts,
                blocks,
                users,
                pendingRequests,
                totalRequests,
                approvedRequests,
                fulfilledRequests,
                cancelledRequests,
                sites: sitesCount
            },
            inventories,
            recentRequests,
            statesData
        })

    } catch (error) {
        console.log('Error while loading dashboard');
        res.status(500).json({
            error: "Internal Server Error"
        })
    }

}



// to get the requests for dashboard
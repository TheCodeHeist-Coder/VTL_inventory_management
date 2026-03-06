import { MaterialRequest } from "@repo/db";

declare global {
    namespace Express {
        interface User {
            id: string;
            role: string;
            blockId: string | null;
            siteId: string | null;
            districtId: string | null;
        }

        interface Request {
            user: User;
        }
    }
}

export {}
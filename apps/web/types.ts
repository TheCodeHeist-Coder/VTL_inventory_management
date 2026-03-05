// ── User & Auth ──────────────────────────────────────────────────────────────

export interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    role: UserRole;
    stateId?: number | null;
    districtId?: number | null;
    blockId?: number | null;
    siteId?: number | null;
    stateName?: string;
    districtName?: string;
    blockName?: string;
    state?: { id: number; name: string; code: string };
    district?: { id: number; name: string; code: string; state?: { id: number; name: string; code: string } };
    block?: { id: number; name: string; code: string; districtId: number };
    site?: { id: number; name: string; code: string };
}

export type UserRole =
    | 'ADMIN'
    | 'STATE_HEAD'
    | 'DISTRICT_HEAD'
    | 'BLOCK_MANAGER'
    | 'STORE_MANAGER'
    | 'SITE_ENGINEER';

// ── Navigation ──────────────────────────────────────────────────────────────

export interface NavItem {
    path: string;
    label: string;
    icon: string;
    exact?: boolean;
}

// ── Messages ────────────────────────────────────────────────────────────────

export interface Message {
    type: 'success' | 'error';
    text: string;
}

// ── Pagination ──────────────────────────────────────────────────────────────

export interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems: number;
    itemName?: string;
}

// ── Inventory ───────────────────────────────────────────────────────────────

export interface InventoryItem {
    id: number;
    materialName: string;
    quantity: number;
    unit: string;
    minThreshold: number;
}

export interface Inventory {
    id: number;
    items: InventoryItem[];
    block?: Block;
}

// ── Geography ───────────────────────────────────────────────────────────────

export interface State {
    id: number;
    name: string;
    code: string;
    districts?: District[];
}

export interface District {
    id: number;
    name: string;
    code: string;
    state?: State;
    blocks?: Block[];
}

export interface Block {
    id: number;
    name: string;
    code: string;
    districtId: number;
    district?: District;
    sites?: Site[];
    users?: User[];
    inventory?: Inventory;
    materialRequests?: MaterialRequest[];
}

export interface Site {
    id: number;
    name: string;
    code: string;
    blockId: number;
    block?: Block;
    users?: User[];
}

// ── Requests ────────────────────────────────────────────────────────────────

export interface MaterialRequestItem {
    id: number;
    materialName: string;
    quantity: number;
    unit: string;
    modifiedQuantity?: number | null;
}

export interface MaterialRequest {
    id: number;
    status: string;
    remarks?: string;
    bmRemarks?: string;
    dhRemarks?: string;
    smRemarks?: string;
    createdAt: string;
    siteEngineer?: User;
    site?: Site;
    block?: Block;
    items?: MaterialRequestItem[];
}

export interface ReplenishRequest {
    id: number;
    status: string;
    remarks?: string;
    stateHeadRemarks?: string;
    createdAt: string;
    storeManager?: User;
    inventory?: Inventory;
    items?: MaterialRequestItem[];
}

// ── Dashboard Data ──────────────────────────────────────────────────────────

export interface AdminDashboardData {
    stats: {
        states: number;
        districts: number;
        blocks: number;
        sites: number;
        users: number;
        totalRequests: number;
        pendingRequests: number;
        approvedRequests: number;
        fulfilledRequests: number;
        cancelledRequests: number;
    };
    statesData?: State[];
    recentRequests?: MaterialRequest[];
    inventories?: Inventory[];
}

export interface BlockManagerDashboardData {
    block: Block;
    pendingRequests: number;
}

export interface DistrictHeadDashboardData {
    district: District;
    pendingApprovals: number;
}

export interface SiteEngineerDashboardData {
    block: Block;
    site?: Site;
    stats: {
        total: number;
        pending: number;
        approved: number;
        fulfilled: number;
        received: number;
        rejected: number;
    };
    requests: MaterialRequest[];
}

export interface StateHeadDashboardData {
    stats: {
        totalDistricts: number;
        totalBlocks: number;
        totalInventoryItems: number;
    };
    districts: District[];
}

export interface StoreManagerDashboardData {
    block: Block;
    approvedRequests: MaterialRequest[];
    fulfilledRequests: MaterialRequest[];
    replenishRequests: ReplenishRequest[];
}

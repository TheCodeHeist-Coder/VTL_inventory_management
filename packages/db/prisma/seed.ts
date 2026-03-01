import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

import bcrypt from 'bcrypt'

async function main() {
    console.log('🌱 Seeding database...');

    // Clean existing data in correct order
    await prisma.materialRequestItem.deleteMany();
    await prisma.materialRequest.deleteMany();
    await prisma.replenishRequestItem.deleteMany();
    await prisma.replenishRequest.deleteMany();
    await prisma.inventoryItem.deleteMany();
    await prisma.inventory.deleteMany();
    await prisma.user.deleteMany();
    await prisma.site.deleteMany();
    await prisma.block.deleteMany();
    await prisma.district.deleteMany();
    await prisma.state.deleteMany();
    console.log('✅ Cleaned existing data');

    const password = await bcrypt.hash('password123', 10);

    // ===== Create States =====
    await prisma.state.createMany({
        data: [
            { id: '1', name: 'Uttar Pradesh', code: 'UP' },
            { id: '2', name: 'Madhya Pradesh', code: 'MP' }
        ]
    });
    console.log('✅ States created');

    // ===== Create Districts =====
    await prisma.district.createMany({
        data: [
            { id: '1', name: 'Lucknow', code: 'LKO', stateId: '1' },
            { id: '2', name: 'Varanasi', code: 'VNS', stateId: '1' }
        ]
    });
    console.log('✅ Districts created');

    // ===== Create Blocks =====
    await prisma.block.createMany({
        data: [
            { id: '1', name: 'Chinhat', code: 'LKO-CHT', districtId: '1' },
            { id: '2', name: 'Aliganj', code: 'LKO-ALG', districtId: '1' },
            { id: '3', name: 'Sarnath', code: 'VNS-SRN', districtId: '2' },
            { id: '4', name: 'Ramnagar', code: 'VNS-RMN', districtId: '2' }
        ]
    });
    console.log('✅ Blocks created');

    // ===== Create Sites (2 per block) =====
    await prisma.site.createMany({
        data: [
            { id: '1', name: 'Chinhat Site A', code: 'CHT-A', blockId: '1' },
            { id: '2', name: 'Chinhat Site B', code: 'CHT-B', blockId: '1' },
            { id: '3', name: 'Aliganj Site A', code: 'ALG-A', blockId: '2' },
            { id: '4', name: 'Aliganj Site B', code: 'ALG-B', blockId: '2' },
            { id: '5', name: 'Sarnath Site A', code: 'SRN-A', blockId: '3' },
            { id: '6', name: 'Sarnath Site B', code: 'SRN-B', blockId: '3' },
            { id: '7', name: 'Ramnagar Site A', code: 'RMN-A', blockId: '4' },
            { id: '8', name: 'Ramnagar Site B', code: 'RMN-B', blockId: '4' }
        ]
    });
    console.log('✅ Sites created');

    // ===== Create Inventories =====
    await prisma.inventory.createMany({
        data: [
            { id: '1', blockId: '1' },
            { id: '2', blockId: '2' },
            { id: '3', blockId: '3' },
            { id: '4', blockId: '4' }
        ]
    });
    console.log('✅ Inventories created');

    // ===== Create All Users in batch =====
    await prisma.user.createMany({
        data: [
            // Admins
            { id:' 1', name: 'Rajesh Kumar', email: 'admin@construction.com', password, role: 'ADMIN', phone: '9876543210' },
            { id:' 2', name: 'Priya Sharma', email: 'admin2@construction.com', password, role: 'ADMIN', phone: '9876543211' },
            // State Head
            { id:' 3', name: 'Vikram Singh', email: 'statehead@construction.com', password, role: 'STATE_HEAD', phone: '9876543212', stateId: '1' },
            // District Heads
            { id:' 4', name: 'Amit Verma', email: 'dh.lucknow@construction.com', password, role: 'DISTRICT_HEAD', phone: '9876543213', districtId: '1' },
            { id:' 5', name: 'Sunil Gupta', email: 'dh.varanasi@construction.com', password, role: 'DISTRICT_HEAD', phone: '9876543214', districtId: '2' },
            // Block Managers
            { id:' 6', name: 'Rahul Mishra', email: 'bm.chinhat@construction.com', password, role: 'BLOCK_MANAGER', phone: '9876543215', blockId: '1', districtId: '1' },
            { id:' 7', name: 'Deepak Yadav', email: 'bm.aliganj@construction.com', password, role: 'BLOCK_MANAGER', phone: '9876543216', blockId: '2', districtId: '1' },
            { id:' 8', name: 'Sanjay Tiwari', email: 'bm.sarnath@construction.com', password, role: 'BLOCK_MANAGER', phone: '9876543217', blockId: '3', districtId: '2' },
            { id:' 9', name: 'Manoj Pandey', email: 'bm.ramnagar@construction.com', password, role: 'BLOCK_MANAGER', phone: '9876543218', blockId: '4', districtId: '2' },
            // Store Managers
            { id: '10', name: 'Arun Dubey', email: 'sm.chinhat@construction.com', password, role: 'STORE_MANAGER', phone: '9876543219', blockId: '1', districtId: '1' },
            { id: '11', name: 'Vijay Srivastava', email: 'sm.aliganj@construction.com', password, role: 'STORE_MANAGER', phone: '9876543220', blockId: '2', districtId: '1' },
            { id: '12', name: 'Rakesh Chauhan', email: 'sm.sarnath@construction.com', password, role: 'STORE_MANAGER', phone: '9876543221', blockId: '3', districtId: '2' },
            { id: '13', name: 'Suresh Patel', email: 'sm.ramnagar@construction.com', password, role: 'STORE_MANAGER', phone: '9876543222', blockId: '4', districtId: '2' },
            // Site Engineers
            { id: '14', name: 'Karan Singh', email: 'se1.chinhat@construction.com', password, role: 'SITE_ENGINEER', phone: '9876543223', blockId: '1', districtId: '1', siteId: '1' },
            { id: '15', name: 'Nitin Agarwal', email: 'se2.chinhat@construction.com', password, role: 'SITE_ENGINEER', phone: '9876543224', blockId: '1', districtId: '1', siteId: '2' },
            { id: '16', name: 'Rohit Saxena', email: 'se1.aliganj@construction.com', password, role: 'SITE_ENGINEER', phone: '9876543225', blockId: '2', districtId: '1', siteId: '3' },
            { id: '17', name: 'Ajay Maurya', email: 'se2.aliganj@construction.com', password, role: 'SITE_ENGINEER', phone: '9876543226', blockId: '2', districtId: '1', siteId: '4' },
            { id: '18', name: 'Pankaj Jaiswal', email: 'se1.sarnath@construction.com', password, role: 'SITE_ENGINEER', phone: '9876543227', blockId: '3', districtId: '2', siteId: '5' },
            { id: '19', name: 'Vivek Tripathi', email: 'se2.sarnath@construction.com', password, role: 'SITE_ENGINEER', phone: '9876543228', blockId: '3', districtId: '2', siteId: '6' },
            { id: '20', name: 'Gaurav Shukla', email: 'se1.ramnagar@construction.com', password, role: 'SITE_ENGINEER', phone: '9876543229', blockId: '4', districtId: '2', siteId: '7' },
            { id: '21', name: 'Manish Dwivedi', email: 'se2.ramnagar@construction.com', password, role: 'SITE_ENGINEER', phone: '9876543230', blockId: '4', districtId: '2', siteId: '8' }
        ]
    });
    console.log('✅ All users created');

    // ===== Seed Inventory Items in batch =====
    const materials = [
        { materialName: 'Cement (OPC 43 Grade)', quantity: 500, unit: 'Bags', minThreshold: 50 },
        { materialName: 'TMT Steel Bars (12mm)', quantity: 200, unit: 'Quintals', minThreshold: 20 },
        { materialName: 'River Sand', quantity: 100, unit: 'Cubic Meters', minThreshold: 15 },
        { materialName: 'Bricks (Red)', quantity: 10000, unit: 'Pieces', minThreshold: 1000 },
        { materialName: 'Coarse Aggregate (20mm)', quantity: 80, unit: 'Cubic Meters', minThreshold: 10 },
        { materialName: 'PVC Pipes (4 inch)', quantity: 150, unit: 'Pieces', minThreshold: 20 },
        { materialName: 'Electrical Wire (1.5mm)', quantity: 500, unit: 'Meters', minThreshold: 50 },
        { materialName: 'Paint (Exterior)', quantity: 100, unit: 'Liters', minThreshold: 15 }
    ];

    const itemData = [];
    for (const invId of ['1', '2', '3', '4']) {
        for (const mat of materials) {
            itemData.push({
                inventoryId: invId,
                materialName: mat.materialName,
                quantity: mat.quantity + Math.floor(Math.random() * 100),
                unit: mat.unit,
                minThreshold: mat.minThreshold
            });
        }
    }
    await prisma.inventoryItem.createMany({ data: itemData });
    console.log('✅ Inventory items seeded');

    // ===== Seed Sample Material Requests =====
    // Request 1: Pending
    const req1 = await prisma.materialRequest.create({
        data: { siteEngineerId: '14', blockId: '1', siteId: '1', status: 'PENDING', remarks: 'Urgent requirement for foundation work' }
    });
    await prisma.materialRequestItem.createMany({
        data: [
            { materialRequestId: req1.id, materialName: 'Cement (OPC 43 Grade)', quantity: 50, unit: 'Bags' },
            { materialRequestId: req1.id, materialName: 'TMT Steel Bars (12mm)', quantity: 10, unit: 'Quintals' },
            { materialRequestId: req1.id, materialName: 'River Sand', quantity: 5, unit: 'Cubic Meters' }
        ]
    });

    // Request 2: Approved by BM
    const req2 = await prisma.materialRequest.create({
        data: { siteEngineerId: '16', blockId:'2', siteId:'3', status: 'APPROVED_BY_BM', remarks: 'For column casting', bmRemarks: 'Approved - priority work' }
    });
    await prisma.materialRequestItem.createMany({
        data: [
            { materialRequestId: req2.id, materialName: 'Cement (OPC 43 Grade)', quantity: 30, unit: 'Bags' },
            { materialRequestId: req2.id, materialName: 'Coarse Aggregate (20mm)', quantity: 8, unit: 'Cubic Meters' }
        ]
    });

    // Request 3: Approved by DH (Block 3 - Sarnath)
    const req3 = await prisma.materialRequest.create({
        data: { siteEngineerId: '18', blockId: '3', siteId: '5', status: 'APPROVED_BY_DH', remarks: 'Plumbing work phase 2', bmRemarks: 'Verified and approved', dhRemarks: 'Proceed with dispatch' }
    });
    await prisma.materialRequestItem.createMany({
        data: [
            { materialRequestId: req3.id, materialName: 'PVC Pipes (4 inch)', quantity: 25, unit: 'Pieces' },
            { materialRequestId: req3.id, materialName: 'Cement (OPC 43 Grade)', quantity: 10, unit: 'Bags' }
        ]
    });

    // Request 4: Fulfilled (Block 4 - Ramnagar)
    const req4 = await prisma.materialRequest.create({
        data: { siteEngineerId: '20', blockId: '4', siteId: '7', status: 'FULFILLED', remarks: 'Electrical wiring Phase 1', bmRemarks: 'OK', dhRemarks: 'Approved', smRemarks: 'Dispatched via truck' }
    });
    await prisma.materialRequestItem.createMany({
        data: [
            { materialRequestId: req4.id, materialName: 'Electrical Wire (1.5mm)', quantity: 200, unit: 'Meters' },
            { materialRequestId: req4.id, materialName: 'PVC Pipes (4 inch)', quantity: 10, unit: 'Pieces' }
        ]
    });

    // Request 5: Approved by DH (Block 1 - Chinhat) — for store manager to fulfill
    const req5 = await prisma.materialRequest.create({
        data: { siteEngineerId: '15', blockId: '1', siteId: '2', status: 'APPROVED_BY_DH', remarks: 'Roof casting materials needed', bmRemarks: 'Approved for phase 3', dhRemarks: 'Dispatch immediately' }
    });
    await prisma.materialRequestItem.createMany({
        data: [
            { materialRequestId: req5.id, materialName: 'Cement (OPC 43 Grade)', quantity: 80, unit: 'Bags' },
            { materialRequestId: req5.id, materialName: 'TMT Steel Bars (12mm)', quantity: 15, unit: 'Quintals' },
            { materialRequestId: req5.id, materialName: 'Coarse Aggregate (20mm)', quantity: 12, unit: 'Cubic Meters' }
        ]
    });

    // Request 6: Approved by DH (Block 2 - Aliganj) — for store manager to fulfill
    const req6 = await prisma.materialRequest.create({
        data: { siteEngineerId: '17', blockId: '2', siteId: '4', status: 'APPROVED_BY_DH', remarks: 'Boundary wall construction', bmRemarks: 'Material verified', dhRemarks: 'Approved – proceed' }
    });
    await prisma.materialRequestItem.createMany({
        data: [
            { materialRequestId: req6.id, materialName: 'Bricks (Red)', quantity: 3000, unit: 'Pieces' },
            { materialRequestId: req6.id, materialName: 'Cement (OPC 43 Grade)', quantity: 40, unit: 'Bags' },
            { materialRequestId: req6.id, materialName: 'River Sand', quantity: 8, unit: 'Cubic Meters' }
        ]
    });

    // Request 7: Approved by DH (Block 4 - Ramnagar) — for store manager to fulfill
    const req7 = await prisma.materialRequest.create({
        data: { siteEngineerId: '21', blockId: '4', siteId: '8', status: 'APPROVED_BY_DH', remarks: 'Painting and finishing work', bmRemarks: 'Approved for final phase', dhRemarks: 'OK to dispatch' }
    });
    await prisma.materialRequestItem.createMany({
        data: [
            { materialRequestId: req7.id, materialName: 'Paint (Exterior)', quantity: 30, unit: 'Liters' },
            { materialRequestId: req7.id, materialName: 'PVC Pipes (4 inch)', quantity: 15, unit: 'Pieces' }
        ]
    });
    console.log('✅ Sample material requests seeded');

    // ===== Seed Sample Replenish Requests =====
    // Replenish 1: Pending from Chinhat store manager
    const rep1 = await prisma.replenishRequest.create({
        data: { storeManagerId: '10', inventoryId: '1', status: 'PENDING', remarks: 'Cement stock running low, need urgent replenishment' }
    });
    await prisma.replenishRequestItem.createMany({
        data: [
            { replenishRequestId: rep1.id, materialName: 'Cement (OPC 43 Grade)', quantity: 200, unit: 'Bags' },
            { replenishRequestId: rep1.id, materialName: 'River Sand', quantity: 50, unit: 'Cubic Meters' }
        ]
    });

    // Replenish 2: Pending from Aliganj store manager
    const rep2 = await prisma.replenishRequest.create({
        data: { storeManagerId: '11', inventoryId: '2', status: 'PENDING', remarks: 'Steel bars below threshold for upcoming project' }
    });
    await prisma.replenishRequestItem.createMany({
        data: [
            { replenishRequestId: rep2.id, materialName: 'TMT Steel Bars (12mm)', quantity: 100, unit: 'Quintals' },
            { replenishRequestId: rep2.id, materialName: 'Bricks (Red)', quantity: 5000, unit: 'Pieces' }
        ]
    });

    // Replenish 3: Approved from Sarnath store manager
    const rep3 = await prisma.replenishRequest.create({
        data: { storeManagerId: '12', inventoryId: '3', status: 'APPROVED', remarks: 'Pipe stock depleted after Phase 2', stateHeadRemarks: 'Approved, dispatch from central warehouse' }
    });
    await prisma.replenishRequestItem.createMany({
        data: [
            { replenishRequestId: rep3.id, materialName: 'PVC Pipes (4 inch)', quantity: 80, unit: 'Pieces' },
            { replenishRequestId: rep3.id, materialName: 'Electrical Wire (1.5mm)', quantity: 300, unit: 'Meters' }
        ]
    });

    // Replenish 4: Fulfilled from Ramnagar store manager
    const rep4 = await prisma.replenishRequest.create({
        data: { storeManagerId: '13', inventoryId: '4', status: 'FULFILLED', remarks: 'Routine monthly restocking', stateHeadRemarks: 'Fulfilled via central supply' }
    });
    await prisma.replenishRequestItem.createMany({
        data: [
            { replenishRequestId: rep4.id, materialName: 'Paint (Exterior)', quantity: 50, unit: 'Liters' },
            { replenishRequestId: rep4.id, materialName: 'Coarse Aggregate (20mm)', quantity: 40, unit: 'Cubic Meters' }
        ]
    });
    console.log('✅ Sample replenish requests seeded');

    // Print login credentials
    console.log('\n📋 ====== LOGIN CREDENTIALS ======');
    console.log('All passwords: password123\n');
    console.log('ADMINS:        admin@construction.com  /  admin2@construction.com');
    console.log('STATE HEAD:    statehead@construction.com');
    console.log('DISTRICT HEADS: dh.lucknow@construction.com  /  dh.varanasi@construction.com');
    console.log('BLOCK MANAGERS: bm.chinhat / bm.aliganj / bm.sarnath / bm.ramnagar @construction.com');
    console.log('STORE MANAGERS: sm.chinhat / sm.aliganj / sm.sarnath / sm.ramnagar @construction.com');
    console.log('SITE ENGINEERS: se1.chinhat / se2.chinhat / se1.aliganj / etc @construction.com');
    console.log('================================\n');
}

main()
    .catch((e) => { console.error('Seed error:', e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });

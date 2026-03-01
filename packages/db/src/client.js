"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
var client_js_1 = require("./generated/prisma/client.js");
var adapter_pg_1 = require("@prisma/adapter-pg");
var adapter = new adapter_pg_1.PrismaPg({
    connectionString: process.env.DATABASE_URL,
});
var globalForPrisma = globalThis;
exports.prisma = globalForPrisma.prisma ||
    new client_js_1.PrismaClient({
        adapter: adapter,
    });
if (process.env.NODE_ENV !== "production")
    globalForPrisma.prisma = exports.prisma;

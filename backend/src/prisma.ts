// Singleton prisma instance for best practice
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default prisma;

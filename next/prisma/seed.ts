import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DIRECT_URL or DATABASE_URL must be set before seeding.");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const departments = [
  { name: "DESH (FY)", shortName: "DESH (FY)" },
  { name: "Computer Engineering (CE)", shortName: "Computer Engg (CE)" },
  {
    name: "Computer Engineering (Software Engineering)",
    shortName: "CE (Software Engg)",
  },
  { name: "Information Technology (IT)", shortName: "IT" },
  {
    name: "Computer Science & Engineering (Artificial Intelligence)",
    shortName: "CSE (AI)",
  },
  {
    name: "Computer Science & Engineering (Artificial Intelligence & Machine Learning)",
    shortName: "CSE (AI & ML)",
  },
  {
    name: "Computer Science & Engineering (Data Science)",
    shortName: "CSE (Data Science)",
  },
  {
    name: "Computer Science & Engineering (IoT & Cyber Security including Blockchain Technology)",
    shortName: "CSE (IoT & Cyber Security)",
  },
  {
    name: "Artificial Intelligence & Data Science (AI&DS)",
    shortName: "AI & DS",
  },
  {
    name: "Electronics & Telecommunication Engineering (E&TC)",
    shortName: "E&TC",
  },
  {
    name: "Instrumentation & Control Engineering",
    shortName: "Instrumentation & Control",
  },
  { name: "Mechanical Engineering", shortName: "Mechanical" },
  { name: "Civil Engineering", shortName: "Civil" },
] as const;

async function main() {
  for (const department of departments) {
    await prisma.department.upsert({
      where: { name: department.name },
      update: { shortName: department.shortName, active: true },
      create: department,
    });
  }

  console.log(`Seeded ${departments.length} departments.`);
}

main()
  .catch((error) => {
    console.error("Database seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

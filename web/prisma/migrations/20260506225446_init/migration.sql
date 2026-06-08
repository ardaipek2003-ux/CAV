-- CreateEnum
CREATE TYPE "Role" AS ENUM ('BUYER', 'ADMIN');

-- CreateEnum
CREATE TYPE "SpotStatus" AS ENUM ('EMPTY', 'OCCUPIED', 'RESERVED', 'IN_TRANSIT');

-- CreateEnum
CREATE TYPE "CropType" AS ENUM ('LETTUCE', 'TOMATO');

-- CreateEnum
CREATE TYPE "PlantStatus" AS ENUM ('PLANTED', 'IN_TRANSIT', 'HARVESTED');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'GROWING', 'HARVESTED', 'DELIVERED', 'NEEDS_ATTENTION');

-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('PLANT', 'RELOCATE', 'HARVEST');

-- CreateEnum
CREATE TYPE "RobotJobStatus" AS ENUM ('QUEUED', 'IN_PROGRESS', 'DONE', 'FAILED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT,
    "role" "Role" NOT NULL DEFAULT 'BUYER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spots" (
    "id" TEXT NOT NULL,
    "module_number" INTEGER NOT NULL,
    "row_number" INTEGER NOT NULL,
    "spot_number" INTEGER NOT NULL,
    "growth_multiplier" DOUBLE PRECISION NOT NULL,
    "status" "SpotStatus" NOT NULL DEFAULT 'EMPTY',
    "plant_id" TEXT,

    CONSTRAINT "spots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plants" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "crop_type" "CropType" NOT NULL,
    "spot_id" TEXT,
    "planted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expected_harvest" TIMESTAMP(3) NOT NULL,
    "status" "PlantStatus" NOT NULL DEFAULT 'PLANTED',
    "relocated_from" TEXT,

    CONSTRAINT "plants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "buyer_id" TEXT NOT NULL,
    "crop_type" "CropType" NOT NULL,
    "quantity_kg" DOUBLE PRECISION NOT NULL,
    "spots_needed" INTEGER NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "quoted_harvest" TIMESTAMP(3),
    "actual_harvest" TIMESTAMP(3),
    "confirmed_at" TIMESTAMP(3),
    "delivered_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "robot_jobs" (
    "id" TEXT NOT NULL,
    "job_type" "JobType" NOT NULL,
    "plant_id" TEXT NOT NULL,
    "from_spot_id" TEXT,
    "to_spot_id" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 2,
    "status" "RobotJobStatus" NOT NULL DEFAULT 'QUEUED',
    "queued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "robot_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "spots_plant_id_key" ON "spots"("plant_id");

-- CreateIndex
CREATE INDEX "spots_status_idx" ON "spots"("status");

-- CreateIndex
CREATE INDEX "spots_module_number_idx" ON "spots"("module_number");

-- CreateIndex
CREATE UNIQUE INDEX "spots_module_number_row_number_spot_number_key" ON "spots"("module_number", "row_number", "spot_number");

-- CreateIndex
CREATE INDEX "plants_order_id_idx" ON "plants"("order_id");

-- CreateIndex
CREATE INDEX "orders_buyer_id_idx" ON "orders"("buyer_id");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE INDEX "robot_jobs_status_idx" ON "robot_jobs"("status");

-- AddForeignKey
ALTER TABLE "spots" ADD CONSTRAINT "spots_plant_id_fkey" FOREIGN KEY ("plant_id") REFERENCES "plants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plants" ADD CONSTRAINT "plants_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "robot_jobs" ADD CONSTRAINT "robot_jobs_plant_id_fkey" FOREIGN KEY ("plant_id") REFERENCES "plants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "robot_jobs" ADD CONSTRAINT "robot_jobs_from_spot_id_fkey" FOREIGN KEY ("from_spot_id") REFERENCES "spots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "robot_jobs" ADD CONSTRAINT "robot_jobs_to_spot_id_fkey" FOREIGN KEY ("to_spot_id") REFERENCES "spots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

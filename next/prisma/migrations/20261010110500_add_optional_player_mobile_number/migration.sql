ALTER TABLE "Player" ADD COLUMN "mobileNumber" TEXT;

CREATE UNIQUE INDEX "Player_mobileNumber_key" ON "Player"("mobileNumber");

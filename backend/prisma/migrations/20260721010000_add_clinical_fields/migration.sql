-- AlterTable
ALTER TABLE "Doctor" ADD COLUMN     "address" TEXT,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "consultationDuration" INTEGER DEFAULT 30;

-- AlterTable
ALTER TABLE "MedicalRecord" ADD COLUMN     "appointmentId" TEXT,
ADD COLUMN     "bloodPressure" TEXT,
ADD COLUMN     "bodyTemperature" TEXT,
ADD COLUMN     "chiefComplaint" TEXT NOT NULL,
ADD COLUMN     "height" DOUBLE PRECISION,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "pulseRate" TEXT,
ADD COLUMN     "weight" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Prescription" ADD COLUMN     "diagnosis" TEXT NOT NULL,
ADD COLUMN     "followUpDate" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "MedicalRecord" ADD CONSTRAINT "MedicalRecord_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

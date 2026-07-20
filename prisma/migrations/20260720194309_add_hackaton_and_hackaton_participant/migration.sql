-- CreateTable
CREATE TABLE "hackaton" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "hackaton_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hackaton_participant" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hackatonId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "hackaton_participant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "hackaton_authorId_idx" ON "hackaton"("authorId");

-- CreateIndex
CREATE UNIQUE INDEX "hackaton_participant_hackatonId_userId_key" ON "hackaton_participant"("hackatonId", "userId");

-- AddForeignKey
ALTER TABLE "hackaton" ADD CONSTRAINT "hackaton_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hackaton_participant" ADD CONSTRAINT "hackaton_participant_hackatonId_fkey" FOREIGN KEY ("hackatonId") REFERENCES "hackaton"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hackaton_participant" ADD CONSTRAINT "hackaton_participant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

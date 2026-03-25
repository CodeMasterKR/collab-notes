-- CreateTable
CREATE TABLE "note_versions" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "noteId" TEXT NOT NULL,
    "savedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "note_versions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "note_versions" ADD CONSTRAINT "note_versions_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

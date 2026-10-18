-- Ekstensi untuk pencarian fuzzy (trigram). Teks sudah dinormalisasi di aplikasi
-- (src/lib/arabic/normalize.ts), sehingga ekstensi unaccent tidak diperlukan.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STUDENT', 'TEACHER', 'EDITOR', 'ADMIN');
CREATE TYPE "EntryStatus" AS ENUM ('DRAFT', 'REVIEW', 'PUBLISHED');
CREATE TYPE "PartOfSpeech" AS ENUM ('NOUN', 'VERB', 'ADJECTIVE', 'PHRASE');
CREATE TYPE "Gender" AS ENUM ('MASCULINE', 'FEMININE');

-- CreateTable
CREATE TABLE "Major" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameId" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "accent" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Major_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameId" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "accent" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "majorId" TEXT,
    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Entry" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "headword" TEXT NOT NULL,
    "headwordNorm" TEXT NOT NULL,
    "translit" TEXT NOT NULL,
    "translitNorm" TEXT NOT NULL,
    "pos" "PartOfSpeech" NOT NULL,
    "gender" "Gender",
    "root" TEXT,
    "plural" TEXT,
    "forms" JSONB,
    "usageNote" TEXT,
    "status" "EntryStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Entry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Meaning" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "lang" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "textNorm" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Meaning_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Example" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "arabic" TEXT NOT NULL,
    "translation" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Example_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EntryCategory" (
    "entryId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    CONSTRAINT "EntryCategory_pkey" PRIMARY KEY ("entryId","categoryId")
);

CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT,
    "role" "Role" NOT NULL DEFAULT 'STUDENT',
    "majorId" TEXT,
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Favorite" (
    "userId" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("userId","entryId")
);

CREATE TABLE "SearchHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "queryNorm" TEXT NOT NULL,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SearchHistory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SearchMiss" (
    "queryNorm" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "lastAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SearchMiss_pkey" PRIMARY KEY ("queryNorm")
);

CREATE TABLE "SrsCard" (
    "userId" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "ease" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "intervalD" INTEGER NOT NULL DEFAULT 0,
    "reps" INTEGER NOT NULL DEFAULT 0,
    "dueAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastReview" TIMESTAMP(3),
    CONSTRAINT "SrsCard_pkey" PRIMARY KEY ("userId","entryId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Major_slug_key" ON "Major"("slug");
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");
CREATE INDEX "Category_majorId_idx" ON "Category"("majorId");
CREATE UNIQUE INDEX "Entry_slug_key" ON "Entry"("slug");
CREATE INDEX "Entry_status_updatedAt_idx" ON "Entry"("status", "updatedAt");
CREATE INDEX "Entry_status_id_idx" ON "Entry"("status", "id");
CREATE INDEX "Entry_headwordNorm_idx" ON "Entry"("headwordNorm");
CREATE INDEX "Entry_translitNorm_idx" ON "Entry"("translitNorm");
CREATE INDEX "Entry_headwordNorm_trgm_idx" ON "Entry" USING GIN ("headwordNorm" gin_trgm_ops);
CREATE INDEX "Entry_translitNorm_trgm_idx" ON "Entry" USING GIN ("translitNorm" gin_trgm_ops);
CREATE INDEX "Meaning_entryId_lang_sortOrder_idx" ON "Meaning"("entryId", "lang", "sortOrder");
CREATE INDEX "Meaning_textNorm_idx" ON "Meaning"("textNorm");
CREATE INDEX "Meaning_textNorm_trgm_idx" ON "Meaning" USING GIN ("textNorm" gin_trgm_ops);
CREATE INDEX "Example_entryId_idx" ON "Example"("entryId");
CREATE INDEX "EntryCategory_categoryId_idx" ON "EntryCategory"("categoryId");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_majorId_idx" ON "User"("majorId");
CREATE INDEX "Favorite_userId_createdAt_idx" ON "Favorite"("userId", "createdAt");
CREATE UNIQUE INDEX "SearchHistory_userId_queryNorm_key" ON "SearchHistory"("userId", "queryNorm");
CREATE INDEX "SearchHistory_userId_at_idx" ON "SearchHistory"("userId", "at");
CREATE INDEX "SrsCard_userId_dueAt_idx" ON "SrsCard"("userId", "dueAt");

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_majorId_fkey" FOREIGN KEY ("majorId") REFERENCES "Major"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Meaning" ADD CONSTRAINT "Meaning_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "Entry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Example" ADD CONSTRAINT "Example_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "Entry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EntryCategory" ADD CONSTRAINT "EntryCategory_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "Entry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EntryCategory" ADD CONSTRAINT "EntryCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "User" ADD CONSTRAINT "User_majorId_fkey" FOREIGN KEY ("majorId") REFERENCES "Major"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "Entry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SearchHistory" ADD CONSTRAINT "SearchHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SrsCard" ADD CONSTRAINT "SrsCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SrsCard" ADD CONSTRAINT "SrsCard_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "Entry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

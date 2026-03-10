-- CreateTable
CREATE TABLE "ForumPostUpvote" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ForumPostUpvote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ForumReplyUpvote" (
    "id" TEXT NOT NULL,
    "replyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ForumReplyUpvote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ForumPostUpvote_postId_idx" ON "ForumPostUpvote"("postId");

-- CreateIndex
CREATE INDEX "ForumPostUpvote_userId_idx" ON "ForumPostUpvote"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ForumPostUpvote_postId_userId_key" ON "ForumPostUpvote"("postId", "userId");

-- CreateIndex
CREATE INDEX "ForumReplyUpvote_replyId_idx" ON "ForumReplyUpvote"("replyId");

-- CreateIndex
CREATE INDEX "ForumReplyUpvote_userId_idx" ON "ForumReplyUpvote"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ForumReplyUpvote_replyId_userId_key" ON "ForumReplyUpvote"("replyId", "userId");

-- AddForeignKey
ALTER TABLE "ForumPostUpvote" ADD CONSTRAINT "ForumPostUpvote_postId_fkey" FOREIGN KEY ("postId") REFERENCES "ForumPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumPostUpvote" ADD CONSTRAINT "ForumPostUpvote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumReplyUpvote" ADD CONSTRAINT "ForumReplyUpvote_replyId_fkey" FOREIGN KEY ("replyId") REFERENCES "ForumReply"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumReplyUpvote" ADD CONSTRAINT "ForumReplyUpvote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- DropIndex
DROP INDEX `User_username_idx` ON `User`;

-- CreateIndex
CREATE INDEX `User_username_idx` ON `User`(`username`);

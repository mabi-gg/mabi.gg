CREATE INDEX `session_sessionToken_index` ON `session` (`sessionToken`);--> statement-breakpoint
CREATE INDEX `session_userId_index` ON `session` (`userId`);--> statement-breakpoint
CREATE INDEX `user_email_index` ON `user` (`email`);
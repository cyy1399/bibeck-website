export type PrivateAttachment = { filename: string; mimeType: string; size: number; bytes: Uint8Array };

export interface PrivateAttachmentStorageProvider {
  store(attachments: readonly PrivateAttachment[], expiresAt: Date): Promise<readonly { id: string }[]>;
  delete(ids: readonly string[]): Promise<void>;
}

/** No private expiring storage is configured; attachments must never fall back to public storage. */
export const privateAttachmentStorageProvider: PrivateAttachmentStorageProvider | null = null;

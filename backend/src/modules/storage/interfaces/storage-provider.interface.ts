export interface IStorageProvider {
  /**
   * Uploads a file to the storage provider
   * @param file The file object (usually from multer)
   * @param path Optional explicit path or folder within the storage
   * @returns The public URL or identifying path of the uploaded file
   */
  uploadFile(file: Express.Multer.File, path?: string): Promise<string>;

  /**
   * Deletes a file from the storage provider
   * @param fileUrl The URL or identifying path of the file to delete
   */
  deleteFile(fileUrl: string): Promise<void>;

  /**
   * Retrieves the generic static public URL for a given file path
   * @param path The identifying path of the file
   */
  getFileUrl(path: string): string;

  /**
   * Generates a temporary, publicly accessible URL for a given file
   * @param path The identifying path of the file
   * @param expiresInSeconds Duration in seconds until the URL expires
   */
  generatePresignedUrl(path: string, expiresInSeconds: number): Promise<string> | string;
}

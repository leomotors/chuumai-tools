import type { S3Client } from "@aws-sdk/client-s3";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { downloadImage, listFilesInFolder, uploadImage } from "@repo/utils/s3";

import { uploadMissingMusicImages } from "./upload-music-images";

// Mock the S3 utilities
vi.mock("@repo/utils/s3", () => ({
  downloadImage: vi.fn(),
  listFilesInFolder: vi.fn(),
  uploadImage: vi.fn(),
}));

// Mock cli-progress to avoid console output during tests
vi.mock("@leomotors/cli-progress", () => ({
  default: {
    SingleBar: vi.fn().mockImplementation(() => ({
      start: vi.fn(),
      update: vi.fn(),
      stop: vi.fn(),
    })),
    Preset: {
      shadesClassic: {},
    },
  },
}));

// Mock console methods to avoid noise in test output
const mockConsoleLog = vi.spyOn(console, "log").mockImplementation(() => {});
const mockConsoleError = vi
  .spyOn(console, "error")
  .mockImplementation(() => {});
const mockConsoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});

// Common test data
const baseMusicItem1 = {
  id: 1,
  catname: "POPS & ANIME" as const,
  title: "Test Song 1",
  artist: "Test Artist 1",
  image: "image1.jpg",
  newflag: 0,
  reading: "テストソング1",
  lev_bas: "3",
  lev_adv: "6",
  lev_exp: "9",
  lev_mas: "12",
  lev_ult: "",
  we_kanji: "",
  we_star: "",
};

const baseMusicItem2 = {
  id: 2,
  catname: "niconico" as const,
  title: "Test Song 2",
  artist: "Test Artist 2",
  image: "image2.jpg",
  newflag: 1,
  reading: "テストソング2",
  lev_bas: "2",
  lev_adv: "5",
  lev_exp: "8",
  lev_mas: "11",
  lev_ult: "",
  we_kanji: "",
  we_star: "",
};

const singleMusicItem = {
  id: 1,
  catname: "POPS & ANIME" as const,
  title: "Test Song 1",
  artist: "Test Artist 1",
  image: "image1.jpg",
  newflag: 0,
  reading: "テストソング1",
  lev_bas: "3",
  lev_adv: "6",
  lev_exp: "9",
  lev_mas: "12",
  lev_ult: "",
  we_kanji: "",
  we_star: "",
};

const testMusicItem = {
  id: 1,
  catname: "POPS & ANIME" as const,
  title: "Test Song 1",
  artist: "Test Artist 1",
  image: "test.jpg",
  newflag: 0,
  reading: "テストソング1",
  lev_bas: "3",
  lev_adv: "6",
  lev_exp: "9",
  lev_mas: "12",
  lev_ult: "",
  we_kanji: "",
  we_star: "",
};

const successMusicItem = {
  id: 1,
  catname: "POPS & ANIME" as const,
  title: "Test Song 1",
  artist: "Test Artist 1",
  image: "success.jpg",
  newflag: 0,
  reading: "テストソング1",
  lev_bas: "3",
  lev_adv: "6",
  lev_exp: "9",
  lev_mas: "12",
  lev_ult: "",
  we_kanji: "",
  we_star: "",
};

const failureMusicItem = {
  id: 2,
  catname: "niconico" as const,
  title: "Test Song 2",
  artist: "Test Artist 2",
  image: "failure.jpg",
  newflag: 1,
  reading: "テストソング2",
  lev_bas: "2",
  lev_adv: "5",
  lev_exp: "8",
  lev_mas: "11",
  lev_ult: "",
  we_kanji: "",
  we_star: "",
};

describe("uploadMissingMusicImages", () => {
  // Import the mocked functions with proper typing
  const mockDownloadImage = vi.mocked(downloadImage);
  const mockListFilesInFolder = vi.mocked(listFilesInFolder);
  const mockUploadImage = vi.mocked(uploadImage);

  const mockS3Client = {} as S3Client;
  const bucketName = "test-bucket";
  const s3Folder = "musicImages";

  beforeEach(() => {
    vi.clearAllMocks();
    mockConsoleLog.mockClear();
    mockConsoleError.mockClear();
    mockConsoleWarn.mockClear();
  });

  it("should upload missing images successfully", async () => {
    const musicData = [baseMusicItem1, baseMusicItem2];

    // Mock existing images (image1.jpg already exists)
    mockListFilesInFolder.mockResolvedValue([
      "musicImages/image1.jpg",
      "musicImages/other.jpg",
    ]);

    // Mock successful image download
    const mockImageBuffer = new ArrayBuffer(1024);
    mockDownloadImage.mockResolvedValue(mockImageBuffer);

    // Mock successful upload
    mockUploadImage.mockResolvedValue(undefined);

    const result = await uploadMissingMusicImages(
      mockS3Client,
      bucketName,
      s3Folder,
      musicData,
    );

    expect(result).toEqual({
      uploadedCount: 1,
      skippedCount: 1, // image1.jpg was skipped because it already exists
      failedCount: 0,
      errors: [],
    });

    // Verify S3 operations
    expect(mockListFilesInFolder).toHaveBeenCalledWith(
      mockS3Client,
      bucketName,
      s3Folder,
    );

    // Should only download image2.jpg since image1.jpg already exists
    expect(mockDownloadImage).toHaveBeenCalledTimes(1);
    expect(mockDownloadImage).toHaveBeenCalledWith(
      "https://new.chunithm-net.com/chuni-mobile/html/mobile/img/image2.jpg",
    );

    // Should only upload image2.jpg
    expect(mockUploadImage).toHaveBeenCalledTimes(1);
    expect(mockUploadImage).toHaveBeenCalledWith({
      s3: mockS3Client,
      bucketName,
      folder: s3Folder,
      imageName: "image2.jpg",
      buffer: expect.any(Buffer),
      contentType: "image/jpeg",
    });

    // Verify console output
    expect(mockConsoleLog).toHaveBeenCalledWith("New images count: 1");
    expect(mockConsoleLog).toHaveBeenCalledWith(
      "Image upload completed: 1 uploaded, 0 failed",
    );
  });

  it("should handle case when no new images are needed", async () => {
    const musicData = [singleMusicItem];

    // Mock all images already exist
    mockListFilesInFolder.mockResolvedValue(["musicImages/image1.jpg"]);

    const result = await uploadMissingMusicImages(
      mockS3Client,
      bucketName,
      s3Folder,
      musicData,
    );

    expect(result).toEqual({
      uploadedCount: 0,
      skippedCount: 1,
    });

    // Should not attempt to download or upload anything
    expect(mockDownloadImage).not.toHaveBeenCalled();
    expect(mockUploadImage).not.toHaveBeenCalled();

    // Verify console output
    expect(mockConsoleLog).toHaveBeenCalledWith("New images count: 0");
    expect(mockConsoleLog).toHaveBeenCalledWith("No new images to upload");
  });

  it("should handle download failures gracefully", async () => {
    const musicData = [baseMusicItem1, baseMusicItem2];

    // Mock no existing images
    mockListFilesInFolder.mockResolvedValue([]);

    // Mock download failures
    mockDownloadImage.mockRejectedValue(new Error("Network error"));

    const result = await uploadMissingMusicImages(
      mockS3Client,
      bucketName,
      s3Folder,
      musicData,
    );

    expect(result).toEqual({
      uploadedCount: 0,
      skippedCount: 0,
      failedCount: 2,
      errors: [
        {
          imageName: "image1.jpg",
          error: expect.any(Error),
        },
        {
          imageName: "image2.jpg",
          error: expect.any(Error),
        },
      ],
    });

    // Should attempt to download both images
    expect(mockDownloadImage).toHaveBeenCalledTimes(2);

    // Should not upload anything due to download failures
    expect(mockUploadImage).not.toHaveBeenCalled();

    // Verify error handling
    expect(mockConsoleError).toHaveBeenCalledTimes(2);
    expect(mockConsoleLog).toHaveBeenCalledWith(
      "Image upload completed: 0 uploaded, 2 failed",
    );
    expect(mockConsoleWarn).toHaveBeenCalledWith(
      "Failed uploads: image1.jpg, image2.jpg",
    );
  });

  it("should handle upload failures gracefully", async () => {
    const musicData = [singleMusicItem];

    // Mock no existing images
    mockListFilesInFolder.mockResolvedValue([]);

    // Mock successful download
    const mockImageBuffer = new ArrayBuffer(1024);
    mockDownloadImage.mockResolvedValue(mockImageBuffer);

    // Mock upload failure
    mockUploadImage.mockRejectedValue(new Error("S3 upload error"));

    const result = await uploadMissingMusicImages(
      mockS3Client,
      bucketName,
      s3Folder,
      musicData,
    );

    expect(result).toEqual({
      uploadedCount: 0,
      skippedCount: 0,
      failedCount: 1,
      errors: [
        {
          imageName: "image1.jpg",
          error: expect.any(Error),
        },
      ],
    });

    // Should attempt download and upload
    expect(mockDownloadImage).toHaveBeenCalledTimes(1);
    expect(mockUploadImage).toHaveBeenCalledTimes(1);

    // Verify error handling
    expect(mockConsoleError).toHaveBeenCalledWith(
      "Failed to upload image image1.jpg:",
      expect.any(Error),
    );
  });

  it("should handle mixed success and failure scenarios", async () => {
    const musicData = [successMusicItem, failureMusicItem];

    // Mock no existing images
    mockListFilesInFolder.mockResolvedValue([]);

    // Mock download success for first image, failure for second
    const mockImageBuffer = new ArrayBuffer(1024);
    mockDownloadImage
      .mockResolvedValueOnce(mockImageBuffer)
      .mockRejectedValueOnce(new Error("Download failed"));

    // Mock upload success
    mockUploadImage.mockResolvedValue(undefined);

    const result = await uploadMissingMusicImages(
      mockS3Client,
      bucketName,
      s3Folder,
      musicData,
    );

    expect(result).toEqual({
      uploadedCount: 1,
      skippedCount: 0,
      failedCount: 1,
      errors: [
        {
          imageName: "failure.jpg",
          error: expect.any(Error),
        },
      ],
    });

    // Should attempt to download both images
    expect(mockDownloadImage).toHaveBeenCalledTimes(2);

    // Should only upload the successful one
    expect(mockUploadImage).toHaveBeenCalledTimes(1);
    expect(mockUploadImage).toHaveBeenCalledWith({
      s3: mockS3Client,
      bucketName,
      folder: s3Folder,
      imageName: "success.jpg",
      buffer: expect.any(Buffer),
      contentType: "image/jpeg",
    });
  });

  it("should handle empty music data", async () => {
    const musicData: never[] = [];

    // Mock empty S3 folder
    mockListFilesInFolder.mockResolvedValue([]);

    const result = await uploadMissingMusicImages(
      mockS3Client,
      bucketName,
      s3Folder,
      musicData,
    );

    expect(result).toEqual({
      uploadedCount: 0,
      skippedCount: 0,
    });

    // Should still check S3 but not attempt any downloads/uploads
    expect(mockListFilesInFolder).toHaveBeenCalledWith(
      mockS3Client,
      bucketName,
      s3Folder,
    );
    expect(mockDownloadImage).not.toHaveBeenCalled();
    expect(mockUploadImage).not.toHaveBeenCalled();

    expect(mockConsoleLog).toHaveBeenCalledWith("New images count: 0");
    expect(mockConsoleLog).toHaveBeenCalledWith("No new images to upload");
  });

  it("should correctly parse S3 folder structure", async () => {
    const musicData = [testMusicItem];

    // Mock S3 folder structure with nested paths
    mockListFilesInFolder.mockResolvedValue([
      "musicImages/subfolder/test.jpg",
      "musicImages/another/folder/other.jpg",
      "musicImages/test.jpg", // This should match
    ]);

    const mockImageBuffer = new ArrayBuffer(1024);
    mockDownloadImage.mockResolvedValue(mockImageBuffer);
    mockUploadImage.mockResolvedValue(undefined);

    const result = await uploadMissingMusicImages(
      mockS3Client,
      bucketName,
      s3Folder,
      musicData,
    );

    // Should detect that test.jpg already exists and skip upload
    expect(result).toEqual({
      uploadedCount: 0,
      skippedCount: 1,
    });

    expect(mockDownloadImage).not.toHaveBeenCalled();
    expect(mockUploadImage).not.toHaveBeenCalled();
  });
});

import type { ReactNode } from "react";

export interface MediaFile {
  id: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  width: number | null;
  height: number | null;
  source: "upload" | "youtube" | "external_url";
  altText: string | null;
  diskPath: string;
  url: string;
  uploadedAt: string;
}

export interface MediaListResponse {
  data: MediaFile[];
  meta: { total: number; page: number; limit: number };
}

export type MediaFilter = "all" | "image" | "video" | "youtube";

/**
 * Props for the MediaManager modal component.
 *
 * @example Basic usage as a picker
 * ```tsx
 * <MediaManager onSelect={(url) => setLogo(url)}>
 *   <button>Chọn ảnh</button>
 * </MediaManager>
 * ```
 *
 * @example With file type filter
 * ```tsx
 * <MediaManager onSelect={handlePick} accept="image/*">
 *   <Button>Chọn ảnh</Button>
 * </MediaManager>
 * ```
 */
export interface MediaManagerProps {
  /** Called when user selects a media item. Receives the public URL. */
  onSelect: (url: string) => void;

  /** Restrict displayed files. Defaults to showing all types. */
  filter?: MediaFilter;

  /**
   * Restrict the file input accept attribute.
   * @example "image/*"
   * @example "image/*,video/*"
   * @example ".pdf,.doc"
   */
  accept?: string;

  /**
   * Trigger element that opens the media picker modal.
   * If omitted, a default "Chọn từ thư viện" button is rendered.
   */
  children?: ReactNode;

  /** Label for the trigger button when no children provided. */
  triggerLabel?: string;

  /** Show the trigger as a block button instead of inline. */
  block?: boolean;

  /** Current value — highlighted in the grid as selected. */
  value?: string;
}

/**
 * Internal component props — used by the modal overlay logic.
 * @internal
 */
export interface MediaManagerModalProps
  extends Omit<MediaManagerProps, "children" | "triggerLabel" | "block"> {
  open: boolean;
  onClose: () => void;
}

"use client";

import { MediaManagerEmbed } from "@/components/admin/media-manager";

export default function AdminMediaPage() {
  return (
    <MediaManagerEmbed
      sortable
      enableDetail
      enableBulkDelete
      enableYoutube
      enableDragDrop
      enableClipboard
    />
  );
}

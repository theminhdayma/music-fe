import { api } from "@/api/api"
import type { ApiResponse } from "@/types/home"
import type { DownloadUrlResponse } from "@/types/library"
import { toast } from "sonner"

export async function downloadSignedTrack(musicId: number, fallbackLabel: string) {
  try {
    const response = await api.get<ApiResponse<DownloadUrlResponse>>(`/buyer/library/${musicId}/download`)
    const downloadUrl = response.data?.data?.downloadUrl

    if (!downloadUrl) {
      toast.error("Download URL unavailable")
      return false
    }

    const fileResponse = await fetch(downloadUrl)

    if (!fileResponse.ok) {
      toast.error("Could not download file")
      return false
    }

    const fileBlob = await fileResponse.blob()

    if (fileBlob.size === 0) {
      toast.error("Downloaded file is empty")
      return false
    }

    const objectUrl = URL.createObjectURL(fileBlob)
    const anchor = document.createElement("a")
    anchor.href = objectUrl
    anchor.download = fallbackLabel
    anchor.rel = "noopener noreferrer"
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)

    toast.success("Download started")
    return true
  } catch (error) {
    console.error(error)
    toast.error("Could not generate download URL")
    return false
  }
}
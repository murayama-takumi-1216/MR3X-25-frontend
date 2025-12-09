
import { toast } from 'sonner'

export function useToast() {
  return {
    toasts: [] as any[],
    toast,
    dismiss: (toastId?: string) => {
      if (toastId) {
        toast.dismiss(toastId)
      } else {
        toast.dismiss()
      }
    },
  }
}

export { toast }

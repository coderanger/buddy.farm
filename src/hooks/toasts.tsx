import { useState } from "react"

export interface Toast {
  // Toast instance ID.
  id: string
  // Title content.
  title: React.ReactNode
  // Body content.
  body: React.ReactNode
  // Autohide delay.
  delay?: number | undefined
  // Toast is currently hiding.
  hiding?: boolean | undefined
}

export const useToasts = () => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (toast: Omit<Toast, "id">) => {
    const toastWithID = toast as Toast
    toastWithID.id = crypto.randomUUID()
    setToasts((t) => t.concat(toastWithID))
  }

  const removeToast = (id: string) => {
    setToasts((t) => t.map(toast => toast.id === id ? { ...toast, hiding: true } : toast))
    window.setTimeout(() => setToasts((t) => t.filter(toast => toast.id !== id)), 150)
  }

  return [toasts, addToast, removeToast] as [typeof toasts, typeof addToast, typeof removeToast]
}

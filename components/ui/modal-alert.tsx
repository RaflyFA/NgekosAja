"use client"

import * as React from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle2, Info, XCircle, X } from "lucide-react"

interface ModalAlertProps {
    isOpen: boolean
    onClose: () => void
    title: string
    message: string
    type?: "success" | "error" | "info" | "warning"
}

export function ModalAlert({
    isOpen,
    onClose,
    title,
    message,
    type = "info",
}: ModalAlertProps) {
    const iconMap = {
        success: <CheckCircle2 className="w-12 h-12 text-green-500 mb-2" />,
        error: <XCircle className="w-12 h-12 text-red-500 mb-2" />,
        info: <Info className="w-12 h-12 text-blue-500 mb-2" />,
        warning: <AlertCircle className="w-12 h-12 text-yellow-500 mb-2" />,
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px] rounded-3xl p-8 border-none dark:bg-slate-900 shadow-2xl">
                <DialogHeader className="flex flex-col items-center">
                    {iconMap[type]}
                    <DialogTitle className="text-2xl font-bold text-center dark:text-white">
                        {title}
                    </DialogTitle>
                    <DialogDescription className="text-center text-slate-500 dark:text-slate-400 mt-2 text-base">
                        {message}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-8">
                    <Button
                        onClick={onClose}
                        className="w-full h-12 rounded-xl font-bold text-base shadow-lg transition-transform active:scale-95"
                    >
                        Tutup
                    </Button>
                </DialogFooter>
                <DialogClose className="absolute right-4 top-4 rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <X className="h-5 w-5 text-slate-400" />
                    <span className="sr-only">Close</span>
                </DialogClose>
            </DialogContent>
        </Dialog>
    )
}

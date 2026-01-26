"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Facebook, Share2, Copy, Check, MessageCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface ShareDialogProps {
    isOpen: boolean
    onClose: () => void
    url: string
    title: string
}

export function ShareDialog({ isOpen, onClose, url, title }: ShareDialogProps) {
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        if (typeof window !== "undefined") {
            navigator.clipboard.writeText(url)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const shareLinks = [
        {
            name: "WhatsApp",
            icon: MessageCircle,
            color: "bg-green-500",
            href: `https://wa.me/?text=${encodeURIComponent(title + ": " + url)}`
        },
        {
            name: "Facebook",
            icon: Facebook,
            color: "bg-blue-600",
            href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        }
    ]

    return (
        <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="rounded-[3rem] p-12 max-w-md border-none bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl shadow-2xl focus:outline-none">
                <div className="space-y-10">
                    <div className="flex flex-col items-center text-center gap-4">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-primary/10 flex items-center justify-center text-primary mb-2">
                            <Share2 className="w-8 h-8" />
                        </div>
                        <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none">Bagikan <br /> <span className="text-primary italic">Hunian</span></h2>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {shareLinks.map((link) => (
                            <a key={link.name} href={link.href} target="_blank" rel="noopener noreferrer" className="block">
                                <Button className={`w-full h-24 rounded-[2rem] ${link.color} hover:opacity-90 flex flex-col gap-2 shadow-xl shadow-slate-200 dark:shadow-none transition-all active:scale-95 text-white border-none italic`}>
                                    <link.icon className="w-7 h-7" />
                                    <span className="text-[9px] font-black uppercase tracking-widest not-italic">{link.name}</span>
                                </Button>
                            </a>
                        ))}
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-white/5">
                        <div className="flex items-center justify-between px-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Salin Tautan</p>
                            {copied && (
                                <motion.span initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="text-[9px] font-black text-green-500 uppercase tracking-widest">
                                    Berhasil Disalin!
                                </motion.span>
                            )}
                        </div>
                        <div className="relative group">
                            <div className="h-16 w-full bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center px-6 border border-slate-100 dark:border-white/5 overflow-hidden">
                                <p className="text-sm font-bold text-slate-500 truncate mr-12">{url}</p>
                            </div>
                            <Button
                                onClick={handleCopy}
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-xl bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all"
                            >
                                <AnimatePresence mode="wait">
                                    {copied ? (
                                        <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                            <Check className="w-5 h-5" />
                                        </motion.div>
                                    ) : (
                                        <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                            <Copy className="w-5 h-5" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

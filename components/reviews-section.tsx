"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star, MessageSquare, Send } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { ModalAlert } from "@/components/ui/modal-alert"

interface Review {
    id: string
    rating: number
    comment: string | null
    created_at: string
    profiles: {
        full_name: string
    }
}

interface ReviewsSectionProps {
    propertyId: string
    reviews: Review[]
    onReviewAdded: () => void
}

export function ReviewsSection({ propertyId, reviews, onReviewAdded }: ReviewsSectionProps) {
    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [comment, setComment] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Alert State
    const [alertConfig, setAlertConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: "success" | "error" | "info" | "warning";
    }>({
        isOpen: false,
        title: "",
        message: "",
        type: "info",
    });

    const showAlert = (title: string, message: string, type: "success" | "error" | "info" | "warning" = "info") => {
        setAlertConfig({ isOpen: true, title, message, type });
    };

    const handleSubmit = async () => {
        if (rating === 0) {
            showAlert("Rating Diperlukan", "Silakan pilih rating terlebih dahulu dengan mengklik bintang.", "warning")
            return
        }

        setIsSubmitting(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                showAlert("Perlu Login", "Anda harus login terlebih dahulu untuk memberikan ulasan.", "info")
                return
            }

            const { error } = await supabase
                .from('reviews')
                .insert({
                    property_id: propertyId,
                    user_id: user.id,
                    rating: rating,
                    comment: comment || null
                })

            if (error) {
                if (error.code === '23505') {
                    showAlert("Sudah Mengulas", "Anda sudah memberikan review untuk kosan ini sebelumnya.", "warning")
                } else {
                    throw error
                }
                return
            }

            showAlert("Berhasil", "Review Anda telah berhasil ditambahkan. Terima kasih!", "success")
            setRating(0)
            setComment("")
            onReviewAdded()
        } catch (error: any) {
            showAlert("Gagal", "Gagal menambahkan review: " + error.message, "error")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Ulasan & Rating</h2>
            </div>

            {/* Add Review Form Premium */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Berikan Ulasan Terbaik Anda</h3>

                {/* Star Rating */}
                <div className="mb-8">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Seberapa puas Anda dengan kosan ini?</p>
                    <div className="flex gap-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                className="focus:outline-none transition-transform active:scale-90"
                            >
                                <Star
                                    className={`w-10 h-10 transition-colors duration-200 ${star <= (hoverRating || rating)
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-slate-200 dark:text-slate-700 hover:text-yellow-200'
                                        }`}
                                />
                            </button>
                        ))}
                        {rating > 0 && (
                            <span className="ml-2 flex items-center text-sm font-bold text-yellow-600 dark:text-yellow-500 bg-yellow-50 dark:bg-yellow-500/10 px-3 rounded-full">
                                {rating}/5 Skor
                            </span>
                        )}
                    </div>
                </div>

                {/* Comment */}
                <div className="mb-8 relative">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Ceritakan Pengalaman Anda</p>
                    <Textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Apa yang Anda suka dari kosan ini? (Fasilitas, Kebersihan, atau Pemilik)"
                        className="h-32 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-none px-6 py-4 focus-visible:ring-primary focus-visible:ring-1 transition-all resize-none"
                    />
                </div>

                <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || rating === 0}
                    className="h-12 px-8 rounded-xl font-bold text-base shadow-lg shadow-primary/20 gap-2 transition-all active:scale-95"
                >
                    {isSubmitting ? (
                        "Sedang Mengirim..."
                    ) : (
                        <>
                            Kirim Ulasan Sekarang
                            <Send className="w-4 h-4" />
                        </>
                    )}
                </Button>
            </div>

            {/* Reviews List */}
            <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">Semua Ulasan ({reviews.length})</h3>
                </div>

                {reviews.length === 0 ? (
                    <div className="text-center py-16 bg-slate-50 dark:bg-slate-800/20 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-700">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MessageSquare className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 font-medium italic">Belum ada ulasan untuk kosan ini. Jadilah yang pertama memberikan ulasan!</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {reviews.map((review) => (
                            <div key={review.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 transition-all hover:shadow-lg dark:hover:bg-slate-800/50">
                                <div className="flex items-start gap-4">
                                    {/* Avatar */}
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shadow-inner">
                                        {review.profiles.full_name.charAt(0).toUpperCase()}
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                                            <p className="font-bold text-slate-900 dark:text-white">{review.profiles.full_name}</p>
                                            <div className="flex gap-0.5 bg-yellow-50 dark:bg-yellow-500/10 px-2 py-1 rounded-lg">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-3.5 h-3.5 ${i < review.rating
                                                            ? 'fill-yellow-400 text-yellow-400'
                                                            : 'text-slate-200 dark:text-slate-700'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        {review.comment && (
                                            <div className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-2xl mb-4 italic text-slate-700 dark:text-slate-300 relative">
                                                <span className="absolute -top-2 left-4 text-4xl text-primary/10 font-serif leading-none">"</span>
                                                <p className="text-sm leading-relaxed">{review.comment}</p>
                                            </div>
                                        )}

                                        <p className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {new Date(review.created_at).toLocaleDateString('id-ID', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <ModalAlert
                isOpen={alertConfig.isOpen}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    )
}

import { Calendar } from "lucide-react"

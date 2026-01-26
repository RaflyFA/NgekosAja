"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { createNotification } from "@/lib/notifications"
import { Upload, CreditCard } from "lucide-react"

interface PaymentUploadDialogProps {
    roomId: string
    propertyId: string
    ownerId: string
    monthlyRent: number
    propertyName: string
    onPaymentUploaded?: () => void
}

export function PaymentUploadDialog({
    roomId,
    propertyId,
    ownerId,
    monthlyRent,
    propertyName,
    onPaymentUploaded
}: PaymentUploadDialogProps) {
    const { toast } = useToast()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [paymentDate, setPaymentDate] = useState("")
    const [paymentMethod, setPaymentMethod] = useState("cash")
    const [proofFile, setProofFile] = useState<File | null>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setProofFile(e.target.files[0])
        }
    }

    const handleSubmit = async () => {
        if (!paymentDate) {
            toast({
                title: "Error",
                description: "Tanggal pembayaran harus diisi",
                variant: "destructive"
            })
            return
        }

        if (!proofFile) {
            toast({
                title: "Error",
                description: "Bukti pembayaran harus diupload",
                variant: "destructive"
            })
            return
        }

        setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("User not authenticated")

            // Get user profile for tenant_name and phone
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('full_name, phone')
                .eq('id', user.id)
                .single()

            console.log('Profile data:', profile, 'Error:', profileError)

            // Fallback to user email if profile not found
            const tenantName = profile?.full_name || user.email || 'Unknown'
            const tenantPhone = profile?.phone || '-'

            // Upload bukti pembayaran ke storage
            const fileExt = proofFile.name.split('.').pop()
            const fileName = `${user.id}-${Date.now()}.${fileExt}`
            const filePath = `payment-proofs/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('payment-proofs')
                .upload(filePath, proofFile)

            if (uploadError) throw uploadError

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('payment-proofs')
                .getPublicUrl(filePath)

            // Buat transaksi
            // Calculate due_date (1 month from payment date) and period_month
            const paymentDateObj = new Date(paymentDate)
            const dueDate = new Date(paymentDateObj)
            dueDate.setMonth(dueDate.getMonth() + 1)

            const periodMonth = paymentDateObj.toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long'
            })

            const { error: transactionError } = await supabase
                .from('transactions')
                .insert({
                    room_id: roomId,
                    tenant_name: tenantName,
                    tenant_phone: tenantPhone,
                    amount: monthlyRent,
                    due_date: dueDate.toISOString().split('T')[0],
                    period_month: periodMonth,
                    payment_date: paymentDate,
                    payment_method: paymentMethod,
                    proof_image_url: publicUrl,
                    status: 'pending'
                })

            if (transactionError) throw transactionError

            // Buat notifikasi untuk pemilik
            await createNotification(
                ownerId,
                "Pembayaran Baru",
                `Ada bukti pembayaran baru untuk ${propertyName}`,
                'payment_uploaded',
                roomId
            )

            toast({
                title: "Berhasil!",
                description: "Bukti pembayaran telah dikirim"
            })

            setOpen(false)
            setPaymentDate("")
            setPaymentMethod("cash")
            setProofFile(null)

            if (onPaymentUploaded) {
                onPaymentUploaded()
            }
        } catch (error: any) {
            console.error("Error uploading payment:", error)
            toast({
                title: "Gagal",
                description: error.message,
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <CreditCard className="w-4 h-4" />
                    Bayar Sewa
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Upload Bukti Pembayaran</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Jumlah Pembayaran</Label>
                        <Input
                            value={`Rp ${monthlyRent.toLocaleString('id-ID')}`}
                            disabled
                            className="bg-secondary"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="payment-date">Tanggal Pembayaran</Label>
                        <Input
                            id="payment-date"
                            type="date"
                            value={paymentDate}
                            onChange={(e) => setPaymentDate(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="payment-method">Metode Pembayaran</Label>
                        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                            <SelectTrigger id="payment-method">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="cash">Cash</SelectItem>
                                <SelectItem value="transfer">Transfer Bank</SelectItem>
                                <SelectItem value="e-wallet">E-Wallet</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="proof">Bukti Pembayaran</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="proof"
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                required
                            />
                            {proofFile && (
                                <Upload className="w-4 h-4 text-green-500" />
                            )}
                        </div>
                        {proofFile && (
                            <p className="text-sm text-muted-foreground">
                                {proofFile.name}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={loading}
                    >
                        Batal
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? "Mengirim..." : "Kirim Bukti"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

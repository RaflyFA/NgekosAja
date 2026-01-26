"use client"
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface PhotoGalleryProps {
  images: string[]
  selectedIndex: number
  onSelectImage: (index: number) => void
}

export function PhotoGallery({ images, selectedIndex, onSelectImage }: PhotoGalleryProps) {
  const mainImage = images[selectedIndex] || "/placeholder.svg"

  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelectImage(selectedIndex === 0 ? images.length - 1 : selectedIndex - 1)
  }

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelectImage(selectedIndex === images.length - 1 ? 0 : selectedIndex + 1)
  }

  return (
    <div className="space-y-6">
      {/* Main Image Viewport */}
      <div className="relative h-[400px] sm:h-[600px] w-full bg-slate-100 dark:bg-white/5 rounded-[2.5rem] overflow-hidden group shadow-2xl">
        <AnimatePresence mode="wait">
          <motion.img
            key={selectedIndex}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            src={mainImage}
            alt={`Property view ${selectedIndex + 1}`}
            className="w-full h-full object-cover"
          />
        </AnimatePresence>

        {/* Glossy Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />

        {/* Navigation Controls */}
        <div className="absolute inset-0 flex items-center justify-between px-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <button
            onClick={handlePrevious}
            className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/20 text-white flex items-center justify-center hover:bg-white/40 transition-all active:scale-95 shadow-2xl"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button
            onClick={handleNext}
            className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/20 text-white flex items-center justify-center hover:bg-white/40 transition-all active:scale-95 shadow-2xl"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>

        {/* Counter Badge */}
        <div className="absolute top-6 right-6 px-4 py-2 rounded-2xl bg-slate-950/40 backdrop-blur-xl border border-white/10 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
          <Maximize2 className="w-3 h-3" />
          <span>{selectedIndex + 1} / {images.length}</span>
        </div>
      </div>

      {/* Thumbnails Track */}
      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => onSelectImage(index)}
            className={`relative flex-shrink-0 w-24 sm:w-32 h-20 sm:h-24 rounded-[1.25rem] overflow-hidden border-2 transition-all duration-500 transform ${selectedIndex === index
                ? "border-primary scale-95 shadow-lg shadow-primary/20"
                : "border-transparent opacity-60 hover:opacity-100"
              }`}
          >
            <img
              src={image || "/placeholder.svg"}
              alt={`Thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
            />
            {selectedIndex === index && (
              <div className="absolute inset-0 bg-primary/10" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

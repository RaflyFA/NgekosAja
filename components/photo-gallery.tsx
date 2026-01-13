"use client"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PhotoGalleryProps {
  images: string[]
  selectedIndex: number
  onSelectImage: (index: number) => void
}

export function PhotoGallery({ images, selectedIndex, onSelectImage }: PhotoGalleryProps) {
  const mainImage = images[selectedIndex] || "/placeholder.svg"
  const thumbnails = images.slice(0, 4)

  const handlePrevious = () => {
    onSelectImage(selectedIndex === 0 ? images.length - 1 : selectedIndex - 1)
  }

  const handleNext = () => {
    onSelectImage(selectedIndex === images.length - 1 ? 0 : selectedIndex + 1)
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative h-96 sm:h-[500px] w-full bg-muted rounded-lg overflow-hidden group">
        <img
          src={mainImage || "/placeholder.svg"}
          alt={`Property view ${selectedIndex + 1}`}
          className="w-full h-full object-cover"
        />

        {/* Navigation Buttons */}
        <button
          onClick={handlePrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors opacity-0 group-hover:opacity-100"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors opacity-0 group-hover:opacity-100"
          aria-label="Next image"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Image Counter */}
        <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full bg-black/50 text-white text-sm font-medium">
          {selectedIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnails */}
      <div className="grid grid-cols-4 gap-4">
        {thumbnails.map((image, index) => (
          <button
            key={index}
            onClick={() => onSelectImage(index)}
            className={`h-24 rounded-lg overflow-hidden border-2 transition-all ${
              selectedIndex === index ? "border-primary" : "border-border hover:border-muted-foreground"
            }`}
            aria-label={`View image ${index + 1}`}
          >
            <img
              src={image || "/placeholder.svg"}
              alt={`Thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  )
}

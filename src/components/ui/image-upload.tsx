'use client'

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'

interface ImageUploadProps {
  onImagesChange: (files: File[]) => void
  maxImages?: number
  className?: string
}

export function ImageUpload({ onImagesChange, maxImages = 10, className = '' }: ImageUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`)
        return false
      }
      if (file.size > 10 * 1024 * 1024) { 
        toast.error(`${file.name} is too large (max 10MB)`)
        return false
      }
      return true
    })

    const totalFiles = selectedFiles.length + validFiles.length
    if (totalFiles > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`)
      return
    }

    const newFiles = [...selectedFiles, ...validFiles]
    setSelectedFiles(newFiles)
    onImagesChange(newFiles)

    const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file))
    setPreviewUrls(prev => [...prev, ...newPreviewUrls])

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeImage = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    const newPreviewUrls = previewUrls.filter((_, i) => i !== index)
    
    setSelectedFiles(newFiles)
    setPreviewUrls(newPreviewUrls)
    onImagesChange(newFiles)

    URL.revokeObjectURL(previewUrls[index])
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <Label>Property Images</Label>
      
      {}
      <div className="flex items-center gap-2">
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          onClick={openFileDialog}
          className="flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Choose Images
        </Button>
        <span className="text-sm text-muted-foreground">
          {selectedFiles.length}/{maxImages} images selected
        </span>
      </div>

      {}
      {previewUrls.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {previewUrls.map((url, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden border">
                <img
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(index)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {}
      {previewUrls.length === 0 && (
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
          <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">No images selected</p>
          <p className="text-sm text-muted-foreground/75">
            Click "Choose Images" to upload property photos
          </p>
        </div>
      )}
    </div>
  )
}

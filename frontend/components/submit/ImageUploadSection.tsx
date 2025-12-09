import { useDropzone } from 'react-dropzone'
import { FaUpload, FaTimes } from 'react-icons/fa'

interface ImageUploadSectionProps {
  images: File[]
  onImagesAdd: (files: File[]) => void
  onImageRemove: (index: number) => void
  maxImages?: number
}

export function ImageUploadSection({
  images,
  onImagesAdd,
  onImageRemove,
  maxImages = 5,
}: ImageUploadSectionProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles: maxImages,
    onDrop: acceptedFiles => {
      onImagesAdd(acceptedFiles)
    },
  })

  return (
    <div>
      <label className="block text-sm font-bold mb-3 text-gray-900 dark:text-gray-100">
        📷 画像（最大{maxImages}枚） <span className="text-red-500 dark:text-red-400">*</span>
      </label>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
          isDragActive
            ? 'border-purple-500 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/30 scale-105'
            : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 hover:border-purple-400 dark:hover:border-purple-600'
        }`}
      >
        <input {...getInputProps()} />
        <FaUpload className="mx-auto text-6xl text-purple-500 dark:text-purple-400 mb-6 animate-float" />
        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
          {isDragActive
            ? '✨ ここにドロップしてください'
            : 'クリックまたはドラッグ＆ドロップで画像をアップロード'}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">PNG, JPG, JPEG, WEBP対応</p>
      </div>

      {/* プレビュー */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-6">
          {images.map((file, index) => (
            <div
              key={index}
              className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 transform-gpu"
            >
              <img
                src={URL.createObjectURL(file)}
                alt={`Preview ${index + 1}`}
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => onImageRemove(index)}
                  className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all hover:scale-110 transform-gpu shadow-lg"
                >
                  <FaTimes size={20} />
                </button>
              </div>
              <div className="absolute top-2 left-2 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-bold">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

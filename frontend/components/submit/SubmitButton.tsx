interface SubmitButtonProps {
  isSubmitting: boolean;
  disabled?: boolean;
}

export function SubmitButton({ isSubmitting, disabled = false }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={isSubmitting || disabled}
      className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 transform-gpu disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
    >
      {isSubmitting ? (
        <>
          <span className="animate-spin">⏳</span>
          投稿中...
        </>
      ) : (
        <>
          <span className="text-2xl">🚀</span>
          投稿する
        </>
      )}
    </button>
  );
}


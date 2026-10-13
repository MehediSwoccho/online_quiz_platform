import { useState, useEffect } from 'react'
import { useRatingStore } from '../store/useRatingStore'

export const RatingModal = ({ isOpen, onClose, classId, className, currentRating }) => {
  const [selectedRating, setSelectedRating] = useState(currentRating || '')
  const { submitRating, deleteRating, loading, error, clearError } = useRatingStore()

  useEffect(() => {
    setSelectedRating(currentRating || '')
  }, [currentRating])

  const handleSubmitRating = async () => {
    if (!selectedRating) return

    try {
      await submitRating(classId, selectedRating)
      onClose()
      // Refresh the page to show updated rating
      window.location.reload()
    } catch (error) {
      console.error('Error submitting rating:', error)
    }
  }

  const handleDeleteRating = async () => {
    try {
      await deleteRating(classId)
      setSelectedRating('')
      onClose()
      // Refresh the page to show updated rating
      window.location.reload()
    } catch (error) {
      console.error('Error deleting rating:', error)
    }
  }

  const getRatingIcon = (rating) => {
    switch (rating) {
      case 'good':
        return (
          <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        )
      case 'average':
        return (
          <svg className="w-8 h-8 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h2v2h-2v-2zm0-12h2v8h-2V5z"/>
          </svg>
        )
      case 'bad':
        return (
          <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z"/>
          </svg>
        )
      default:
        return null
    }
  }

  const getRatingColor = (rating) => {
    switch (rating) {
      case 'good':
        return 'border-green-500 bg-green-50'
      case 'average':
        return 'border-yellow-500 bg-yellow-50'
      case 'bad':
        return 'border-red-500 bg-red-50'
      default:
        return 'border-gray-300 bg-white'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Rate Teacher</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
            <button 
              onClick={clearError}
              className="float-right text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            How would you rate the teacher for <strong>{className}</strong>?
          </p>

          <div className="space-y-3">
            {['good', 'average', 'bad'].map((rating) => (
              <button
                key={rating}
                onClick={() => setSelectedRating(rating)}
                className={`w-full p-4 border-2 rounded-lg flex items-center space-x-3 transition-colors ${
                  selectedRating === rating 
                    ? getRatingColor(rating)
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {getRatingIcon(rating)}
                <div className="text-left">
                  <div className="font-medium capitalize">{rating}</div>
                  <div className="text-sm text-gray-500">
                    {rating === 'good' && 'Excellent teaching and support'}
                    {rating === 'average' && 'Good teaching with room for improvement'}
                    {rating === 'bad' && 'Needs significant improvement'}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleSubmitRating}
            disabled={!selectedRating || loading}
            className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : currentRating ? 'Update Rating' : 'Submit Rating'}
          </button>
          
          {currentRating && (
            <button
              onClick={handleDeleteRating}
              disabled={loading}
              className="px-4 py-2 border border-red-300 text-red-600 rounded hover:bg-red-50 disabled:opacity-50"
            >
              Remove
            </button>
          )}
          
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useConsultationStore } from '../store/useConsultationStore'
import { authStore } from '../store/useAuthStore'

export const ConsultationModal = ({ isOpen, onClose, classId, className }) => {
  const [message, setMessage] = useState('')
  const [activeConsultation, setActiveConsultation] = useState(null)
  const { 
    requestConsultation, 
    getStudentConsultations, 
    sendMessage, 
    getConsultationDetails,
    completeConsultation,
    loading, 
    error,
    clearError 
  } = useConsultationStore()
  const { authUser } = authStore()

  useEffect(() => {
    if (isOpen && classId) {
      loadStudentConsultations()
    }
  }, [isOpen, classId])

  const loadStudentConsultations = async () => {
    try {
      const consultations = await getStudentConsultations()
      const classConsultation = consultations.find(c => 
        c.class._id === classId && (c.status === 'pending' || c.status === 'accepted')
      )
      setActiveConsultation(classConsultation || null)
      
      if (classConsultation) {
        await getConsultationDetails(classConsultation._id)
      }
    } catch (error) {
      console.error('Error loading consultations:', error)
    }
  }

  const handleRequestConsultation = async () => {
    try {
      await requestConsultation(classId)
      await loadStudentConsultations()
    } catch (error) {
      console.error('Error requesting consultation:', error)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!message.trim() || !activeConsultation) return

    try {
      await sendMessage(activeConsultation._id, message)
      setMessage('')
      await loadStudentConsultations()
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleCompleteConsultation = async () => {
    if (!activeConsultation) return

    try {
      await completeConsultation(activeConsultation._id)
      setActiveConsultation(null)
      await loadStudentConsultations()
    } catch (error) {
      console.error('Error completing consultation:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Consultation - {className}</h2>
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

        {!activeConsultation ? (
          <div className="text-center py-8">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Request Consultation</h3>
            <p className="text-gray-600 mb-4">
              Request a consultation with your teacher for this class. Your teacher will be notified and can accept your request.
            </p>
            <button
              onClick={handleRequestConsultation}
              disabled={loading}
              className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Requesting...' : 'Request Consultation'}
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Consultation Status</h3>
                  <p className="text-sm text-gray-600">
                    Teacher: {activeConsultation.teacher?.fullName}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    activeConsultation.status === 'pending' 
                      ? 'bg-yellow-100 text-yellow-800'
                      : activeConsultation.status === 'accepted'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {activeConsultation.status.charAt(0).toUpperCase() + activeConsultation.status.slice(1)}
                  </span>
                  {activeConsultation.status === 'accepted' && (
                    <button
                      onClick={handleCompleteConsultation}
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-xs hover:bg-blue-200"
                    >
                      Complete
                    </button>
                  )}
                </div>
              </div>
            </div>

            {activeConsultation.status === 'pending' && (
              <div className="text-center py-8 text-gray-600">
                <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Waiting for teacher to accept your consultation request...
              </div>
            )}

            {activeConsultation.status === 'accepted' && (
              <div>
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Messages</h4>
                  <div className="border rounded-lg p-4 max-h-60 overflow-y-auto bg-gray-50">
                    {activeConsultation.messages && activeConsultation.messages.length > 0 ? (
                      <div className="space-y-3">
                        {activeConsultation.messages.map((msg, index) => (
                          <div
                            key={index}
                            className={`flex ${msg.sender._id === authUser.id || msg.sender._id === authUser._id ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              msg.sender._id === authUser.id || msg.sender._id === authUser._id
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white text-gray-900 border'
                            }`}>
                              <p className="text-sm">{msg.message}</p>
                              <p className={`text-xs mt-1 ${
                                msg.sender._id === authUser.id || msg.sender._id === authUser._id
                                  ? 'text-indigo-200'
                                  : 'text-gray-500'
                              }`}>
                                {msg.sender.fullName} • {new Date(msg.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center">No messages yet. Start the conversation!</p>
                    )}
                  </div>
                </div>

                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    disabled={loading || !message.trim()}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    Send
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

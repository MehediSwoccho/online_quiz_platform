import { useEffect, useState } from 'react'
import { useConsultationStore } from '../store/useConsultationStore'
import { authStore } from '../store/useAuthStore'

export const ConsultationsPage = () => {
  const [selectedConsultation, setSelectedConsultation] = useState(null)
  const [message, setMessage] = useState('')
  const { 
    consultations, 
    getTeacherConsultations, 
    getStudentConsultations,
    acceptConsultation, 
    sendMessage, 
    getConsultationDetails,
    completeConsultation,
    loading, 
    error,
    clearError 
  } = useConsultationStore()
  const { authUser } = authStore()

  const isTeacher = authUser?.userType === 'teacher'

  useEffect(() => {
    if (isTeacher) {
      getTeacherConsultations()
    } else {
      getStudentConsultations()
    }
  }, [isTeacher])

  const handleAcceptConsultation = async (consultationId) => {
    try {
      await acceptConsultation(consultationId)
      if (isTeacher) {
        await getTeacherConsultations()
      }
    } catch (error) {
      console.error('Error accepting consultation:', error)
    }
  }

  const handleViewConsultation = async (consultation) => {
    try {
      const details = await getConsultationDetails(consultation._id)
      setSelectedConsultation(details)
    } catch (error) {
      console.error('Error fetching consultation details:', error)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!message.trim() || !selectedConsultation) return

    try {
      const updatedConsultation = await sendMessage(selectedConsultation._id, message)
      setMessage('')
      setSelectedConsultation(updatedConsultation.consultation)
      
      // Refresh the consultations list
      if (isTeacher) {
        await getTeacherConsultations()
      } else {
        await getStudentConsultations()
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleCompleteConsultation = async (consultationId) => {
    try {
      await completeConsultation(consultationId)
      setSelectedConsultation(null)
      
      // Refresh the consultations list
      if (isTeacher) {
        await getTeacherConsultations()
      } else {
        await getStudentConsultations()
      }
    } catch (error) {
      console.error('Error completing consultation:', error)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'accepted':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading && consultations.length === 0) {
    return <div className="text-center py-8">Loading consultations...</div>
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">
          {isTeacher ? 'Student Consultations' : 'My Consultations'}
        </h1>
        <p className="text-gray-600">
          {isTeacher 
            ? 'Manage consultation requests from your students' 
            : 'View your consultation requests and messages with teachers'
          }
        </p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Consultations List */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            {isTeacher ? 'Consultation Requests' : 'Your Consultations'}
          </h2>
          
          {consultations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {isTeacher 
                ? 'No consultation requests yet.' 
                : 'You haven\'t requested any consultations yet.'
              }
            </div>
          ) : (
            <div className="space-y-4">
              {consultations.map((consultation) => (
                <div
                  key={consultation._id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedConsultation?._id === consultation._id 
                      ? 'border-indigo-500 bg-indigo-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleViewConsultation(consultation)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium">
                        {isTeacher ? consultation.student.fullName : consultation.teacher.fullName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Class: {consultation.class.name}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(consultation.status)}`}>
                        {consultation.status.charAt(0).toUpperCase() + consultation.status.slice(1)}
                      </span>
                      {isTeacher && consultation.status === 'pending' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleAcceptConsultation(consultation._id)
                          }}
                          className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
                        >
                          Accept
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Requested: {new Date(consultation.requestedAt).toLocaleString()}
                  </p>
                  {consultation.messages && consultation.messages.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Last message: {new Date(consultation.messages[consultation.messages.length - 1].timestamp).toLocaleString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Consultation Details */}
        <div className="bg-white shadow rounded-lg p-6">
          {selectedConsultation ? (
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold">
                    {isTeacher ? selectedConsultation.student.fullName : selectedConsultation.teacher.fullName}
                  </h2>
                  <p className="text-gray-600">Class: {selectedConsultation.class.name}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedConsultation.status)}`}>
                    {selectedConsultation.status.charAt(0).toUpperCase() + selectedConsultation.status.slice(1)}
                  </span>
                  {selectedConsultation.status === 'accepted' && (
                    <button
                      onClick={() => handleCompleteConsultation(selectedConsultation._id)}
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-xs hover:bg-blue-200"
                    >
                      Complete
                    </button>
                  )}
                </div>
              </div>

              {selectedConsultation.status === 'pending' && (
                <div className="text-center py-8 text-gray-600">
                  <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {isTeacher 
                    ? 'Accept this consultation to start messaging with the student.'
                    : 'Waiting for teacher to accept your consultation request...'
                  }
                </div>
              )}

              {selectedConsultation.status === 'accepted' && (
                <div>
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Messages</h4>
                    <div className="border rounded-lg p-4 max-h-80 overflow-y-auto bg-gray-50">
                      {selectedConsultation.messages && selectedConsultation.messages.length > 0 ? (
                        <div className="space-y-3">
                          {selectedConsultation.messages.map((msg, index) => (
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

              {selectedConsultation.status === 'completed' && (
                <div className="text-center py-8 text-gray-600">
                  <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  This consultation has been completed.
                  
                  {selectedConsultation.messages && selectedConsultation.messages.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Message History</h4>
                      <div className="border rounded-lg p-4 max-h-60 overflow-y-auto bg-gray-50 text-left">
                        <div className="space-y-3">
                          {selectedConsultation.messages.map((msg, index) => (
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
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Select a consultation to view details and messages
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

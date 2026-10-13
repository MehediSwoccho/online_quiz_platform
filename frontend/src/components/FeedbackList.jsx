import React, { useEffect } from 'react';
import { useFeedbackStore } from '../store/useFeedbackStore';
import { authStore } from '../store/useAuthStore';

export const FeedbackList = ({ classId }) => {
  const { feedback, loading, error, getClassFeedback } = useFeedbackStore();
  const { authUser } = authStore();

  useEffect(() => {
    if (classId) {
      getClassFeedback(classId);
    }
  }, [classId, getClassFeedback]);

  if (loading) {
    return <div className="text-center py-4">Loading feedback...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {error}
      </div>
    );
  }

  if (feedback.length === 0) {
    return <div className="text-center py-4 text-gray-500">No feedback or comments yet.</div>;
  }

  // Group feedback by type
  const teacherFeedback = feedback.filter(item => item.feedbackType === 'teacher');
  const studentComments = feedback.filter(item => item.feedbackType === 'student');

  return (
    <div className="space-y-6">
      {/* Teacher Feedback Section */}
      {teacherFeedback.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-blue-800 mb-3">Teacher Feedback</h3>
          <div className="space-y-4">
            {teacherFeedback.map(item => (
              <div key={item._id} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-start">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    {item.userId.profilePic ? (
                      <img 
                        src={item.userId.profilePic} 
                        alt={item.userId.fullName} 
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-blue-800 font-medium">
                        {item.userId.fullName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-medium">{item.userId.fullName}</h4>
                      <span className="text-xs text-gray-500">
                        {new Date(item.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-700">{item.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Student Comments Section */}
      {studentComments.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Student Comments</h3>
          <div className="space-y-4">
            {studentComments.map(item => (
              <div 
                key={item._id} 
                className={`bg-white rounded-lg p-4 shadow-sm ${item.userId._id === authUser.id ? 'border-l-4 border-indigo-500' : ''}`}
              >
                <div className="flex items-start">
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                    {item.userId.profilePic ? (
                      <img 
                        src={item.userId.profilePic} 
                        alt={item.userId.fullName} 
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-800 font-medium">
                        {item.userId.fullName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-medium">
                        {item.userId._id === authUser.id ? `${item.userId.fullName} (You)` : item.userId.fullName}
                      </h4>
                      <span className="text-xs text-gray-500">
                        {new Date(item.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-700">{item.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
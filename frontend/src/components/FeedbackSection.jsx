import { useState, useEffect } from 'react';
import { useFeedbackStore } from '../store/useFeedbackStore';
import { authStore } from '../store/useAuthStore';

export const FeedbackSection = ({ classId }) => {
  const [content, setContent] = useState('');
  const { authUser } = authStore();
  const { 
    feedback, 
    loading, 
    error, 
    getClassFeedback, 
    createTeacherFeedback, 
    createStudentComment,
    clearFeedback 
  } = useFeedbackStore();

  const isTeacher = authUser?.userType === 'teacher';

  useEffect(() => {
    if (classId) {
      getClassFeedback(classId);
    }

    return () => {
      clearFeedback();
    };
  }, [classId, getClassFeedback, clearFeedback]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    const result = isTeacher 
      ? await createTeacherFeedback(classId, content)
      : await createStudentComment(classId, content);

    if (result.success) {
      setContent('');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Classroom Feedback</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-1">
            {isTeacher ? 'Add Teacher Feedback' : 'Add Student Comment'}
          </label>
          <textarea
            id="feedback"
            rows="3"
            className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder={isTeacher ? 'Share feedback with your students...' : 'Share your thoughts with the class...'}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>

      <div className="space-y-4">
        <h3 className="font-medium text-lg">Recent Feedback</h3>
        {loading && feedback.length === 0 ? (
          <div className="text-center py-4 text-gray-500">Loading feedback...</div>
        ) : feedback.length === 0 ? (
          <div className="text-center py-4 text-gray-500">No feedback yet. Be the first to add feedback!</div>
        ) : (
          <div className="space-y-4">
            {feedback.map((item) => (
              <div key={item._id} className="border rounded-md p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3 flex-shrink-0">
                    {item.userId?.profilePic ? (
                      <img 
                        src={item.userId.profilePic} 
                        alt={item.userId.fullName} 
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-indigo-800 font-medium">
                        {item.userId?.fullName?.charAt(0).toUpperCase() || '?'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <div>
                        <span className="font-medium">{item.userId?.fullName}</span>
                        <span className="ml-2 text-sm text-gray-500">
                          {item.feedbackType === 'teacher' ? '(Teacher)' : '(Student)'}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">{formatDate(item.createdAt)}</span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-line">{item.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
import User from "../models/user.model.js";
import Class from "../models/class.model.js";
import Quiz from "../models/quiz.model.js";
import Submission from "../models/submission.model.js";

// In-memory conversation storage (in production, use Redis or database)
const conversationMemory = new Map();

// Advanced AI chatbot with enhanced capabilities
const generateAdvancedAIResponse = async (message, userId, conversationId) => {
  try {
    const user = await User.findById(userId);
    if (!user || user.userType !== 'student') {
      return "I'm sorry, I can only help students. Please make sure you're logged in as a student.";
    }

    // Get conversation context
    const conversation = conversationMemory.get(conversationId) || [];
    const recentMessages = conversation.slice(-5); // Last 5 messages for context

    const lowerMessage = message.toLowerCase();
    const words = lowerMessage.split(' ');
    
    // Get user's academic data for contextual responses
    const enrolledClasses = await Class.find({ students: userId });
    const classNames = enrolledClasses.map(cls => cls.name);
    
    // Get user's quiz performance
    const submissions = await Submission.find({ student: userId, status: 'graded' });
    const totalQuizzes = submissions.length;
    const averageScore = totalQuizzes > 0 
      ? (submissions.reduce((sum, sub) => sum + sub.totalScore, 0) / totalQuizzes).toFixed(1)
      : 0;

    // Get upcoming quizzes
    const upcomingQuizzes = await Quiz.find({
      classId: { $in: enrolledClasses.map(cls => cls._id) },
      isPublished: true,
      startTime: { $gt: new Date() }
    }).populate('classId', 'name');

    // Sentiment analysis
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'happy', 'excited', 'love', 'like'];
    const negativeWords = ['bad', 'terrible', 'awful', 'worried', 'stressed', 'anxious', 'hate', 'dislike', 'difficult'];
    const urgentWords = ['help', 'urgent', 'emergency', 'now', 'quick', 'fast', 'immediate'];
    
    const isPositive = positiveWords.some(word => lowerMessage.includes(word));
    const isNegative = negativeWords.some(word => lowerMessage.includes(word));
    const isUrgent = urgentWords.some(word => lowerMessage.includes(word));

    // Context awareness from recent conversation
    const hasAskedAboutQuizzes = recentMessages.some(msg => 
      msg.toLowerCase().includes('quiz') || msg.toLowerCase().includes('test')
    );
    const hasAskedAboutClasses = recentMessages.some(msg => 
      msg.toLowerCase().includes('class') || msg.toLowerCase().includes('course')
    );

    // Advanced greeting with context awareness
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      const timeOfDay = new Date().getHours();
      let greeting = '';
      
      if (timeOfDay < 12) greeting = 'Good morning';
      else if (timeOfDay < 17) greeting = 'Good afternoon';
      else greeting = 'Good evening';

      let contextInfo = '';
      if (upcomingQuizzes.length > 0) {
        contextInfo = `\n\n📚 **Quick Update:** You have ${upcomingQuizzes.length} upcoming quiz${upcomingQuizzes.length > 1 ? 'zes' : ''} to prepare for!`;
      }
      if (totalQuizzes > 0) {
        contextInfo += `\n📊 **Performance:** Your average score is ${averageScore}% - ${averageScore >= 80 ? 'Excellent work!' : averageScore >= 60 ? 'Good progress!' : 'Keep practicing!'}`;
      }

      return `${greeting} ${user.fullName}! 👋 I'm your advanced AI study assistant.\n\nI can help you with:\n\n• 🧠 **Smart Study Planning** - Personalized study schedules\n• 📝 **Quiz Mastery** - Advanced preparation strategies\n• 🎯 **Performance Analytics** - Detailed progress insights\n• 💡 **Learning Optimization** - AI-powered study tips\n• 📚 **Resource Management** - Class and material organization\n• 🚀 **Motivation & Support** - Personalized encouragement\n\n${contextInfo}\n\nHow can I assist you today?`;
    }

    // Motivation and encouragement (check this FIRST for emotional support)
    if (isNegative || lowerMessage.includes('stress') || lowerMessage.includes('worried') || lowerMessage.includes('anxious') || lowerMessage.includes('nervous') || lowerMessage.includes('scared')) {
      let response = "💪 **I Understand How You Feel**\n\n";
      
      if (lowerMessage.includes('quiz') || lowerMessage.includes('test') || lowerMessage.includes('exam')) {
        response += "📝 **Quiz Anxiety is Normal:**\n• Even top students feel nervous\n• It shows you care about your performance\n• Use it as motivation to prepare well\n\n";
      }
      
      response += "🧠 **Stress Management Techniques:**\n• Take deep breaths (4-7-8 technique)\n• Break tasks into smaller parts\n• Focus on what you can control\n• Practice positive self-talk\n• Get regular exercise and sleep\n\n";
      
      response += "💡 **Remember:**\n• You've overcome challenges before\n• Every expert was once a beginner\n• Progress, not perfection, is the goal\n• Your worth isn't defined by grades\n\n";
      
      response += "🌟 **You've Got This!** Would you like me to help you:\n• Create a manageable study plan?\n• Break down your tasks?\n• Find study resources?\n• Just chat and relax?";
      
      return response;
    }

        // Subject-specific struggles and learning difficulties (check this BEFORE general quiz logic)
    if ((lowerMessage.includes('struggle') || lowerMessage.includes('difficult') || lowerMessage.includes('hard') || lowerMessage.includes('confused')) && 
        (lowerMessage.includes('math') || lowerMessage.includes('mathematics') || lowerMessage.includes('calculation'))) {
      let response = `🧮 **Math Learning Support & Strategy**\n\n`;
      
      response += "🌟 **Understanding Math Struggles:**\n• Math anxiety is very common\n• Many students struggle with abstract concepts\n• It's normal to need multiple approaches\n• Practice builds confidence over time\n\n";
      
      response += "💡 **Math-Specific Learning Techniques:**\n\n";
      response += "🔢 **Foundation Building:**\n• Start with basic arithmetic (addition, subtraction, multiplication, division)\n• Use visual aids and manipulatives\n• Practice mental math daily\n• Build number sense gradually\n\n";
      
      response += "📐 **Concept Understanding:**\n• Draw diagrams for geometry problems\n• Use real-world examples\n• Break complex problems into smaller steps\n• Practice explaining solutions to others\n\n";
      
      response += "⏰ **Problem-Solving Strategy:**\n• Read the problem carefully (twice!)\n• Identify what you're asked to find\n• Draw a picture or diagram\n• Work step-by-step\n• Check your answer\n\n";
      
      response += "🎯 **Immediate Math Help:**\n1. **Today:** Practice basic operations for 15 minutes\n2. **This Week:** Focus on one specific concept\n3. **Next Week:** Try more challenging problems\n4. **Ongoing:** Use math apps and online resources\n\n";
      
      response += "📚 **Recommended Math Resources:**\n• Khan Academy (free online tutorials)\n• IXL Math (practice problems)\n• Mathway (step-by-step solutions)\n• YouTube math channels\n• Math games and puzzles\n\n";
      
      response += "Would you like me to:\n• Create a math-specific study plan?\n• Help you with specific math concepts?\n• Suggest math practice exercises?\n• Help you overcome math anxiety?";
      
      return response;
    }
    
    if ((lowerMessage.includes('struggle') || lowerMessage.includes('difficult') || lowerMessage.includes('hard') || lowerMessage.includes('confused')) && 
        (lowerMessage.includes('science') || lowerMessage.includes('physics') || lowerMessage.includes('chemistry') || lowerMessage.includes('biology'))) {
      let response = `🔬 **Science Learning Support & Strategy**\n\n`;
      
      response += "🌟 **Understanding Science Learning:**\n• Science combines theory and practical application\n• Visual learning is very effective\n• Understanding concepts is more important than memorizing\n• Real-world examples help comprehension\n\n";
      
      response += "💡 **Science-Specific Learning Techniques:**\n\n";
      response += "🧪 **Concept Mastery:**\n• Use the Feynman Technique (explain to others)\n• Create concept maps and diagrams\n• Connect concepts to real-world examples\n• Practice with experiments and simulations\n\n";
      
      response += "📊 **Data Analysis:**\n• Practice reading graphs and charts\n• Work with real data sets\n• Understand units and measurements\n• Practice scientific notation\n\n";
      
      response += "🔍 **Critical Thinking:**\n• Ask \"why\" questions\n• Challenge assumptions\n• Look for evidence\n• Consider alternative explanations\n\n";
      
      response += "🎯 **Immediate Science Help:**\n1. **Today:** Review one key concept thoroughly\n2. **This Week:** Practice with sample problems\n3. **Next Week:** Apply concepts to new situations\n4. **Ongoing:** Stay curious and ask questions\n\n";
      
      response += "Would you like me to:\n• Create a science study plan?\n• Help you with specific science concepts?\n• Suggest science experiments or activities?\n• Help you develop scientific thinking?";
      
      return response;
    }
    
    if ((lowerMessage.includes('struggle') || lowerMessage.includes('difficult') || lowerMessage.includes('hard') || lowerMessage.includes('confused')) && 
        (lowerMessage.includes('english') || lowerMessage.includes('language') || lowerMessage.includes('writing') || lowerMessage.includes('reading'))) {
      let response = `📚 **Language Arts Learning Support & Strategy**\n\n`;
      
      response += "🌟 **Understanding Language Learning:**\n• Language skills develop over time\n• Reading and writing are interconnected\n• Practice is essential for improvement\n• Everyone has different strengths\n\n";
      
      response += "💡 **Language-Specific Learning Techniques:**\n\n";
      response += "📖 **Reading Improvement:**\n• Read actively (take notes, ask questions)\n• Practice speed reading techniques\n• Summarize what you read\n• Discuss books with others\n\n";
      
      response += "✍️ **Writing Enhancement:**\n• Write daily (journal, essays, stories)\n• Practice different writing styles\n• Get feedback from others\n• Edit and revise your work\n\n";
      
      response += "🗣️ **Communication Skills:**\n• Practice speaking clearly\n• Listen actively to others\n• Participate in discussions\n• Present your ideas confidently\n\n";
      
      response += "🎯 **Immediate Language Help:**\n1. **Today:** Read for 20 minutes\n2. **This Week:** Write a short essay or story\n3. **Next Week:** Practice public speaking\n4. **Ongoing:** Expand your vocabulary\n\n";
      
      response += "Would you like me to:\n• Create a language study plan?\n• Help you with specific writing skills?\n• Suggest reading materials?\n• Help you improve communication?";
      
      return response;
    }

    // Quiz failure recovery and improvement (check this FIRST before general quiz logic)
    if ((lowerMessage.includes('fail') || lowerMessage.includes('failed') || lowerMessage.includes('poor') || lowerMessage.includes('bad') || lowerMessage.includes('low') || lowerMessage.includes('struggle')) && 
        (lowerMessage.includes('quiz') || lowerMessage.includes('test') || lowerMessage.includes('exam') || lowerMessage.includes('result') || lowerMessage.includes('last'))) {
      let response = `💪 **Quiz Recovery & Improvement Strategy**\n\n`;
      
      // Provide specific failure recovery advice
      if (totalQuizzes === 0) {
        response += "🌟 **First Quiz Experience:**\n• Don't worry about your first attempt\n• Every expert was once a beginner\n• Use this as a learning opportunity\n• Focus on understanding, not just memorizing\n\n";
      } else if (averageScore < 50) {
        response += "🔧 **Fundamental Improvement Needed:**\n• Your scores indicate gaps in basic understanding\n• Let's rebuild your foundation step by step\n• Focus on one topic at a time\n• Master basics before moving to advanced concepts\n\n";
      } else if (averageScore < 70) {
        response += "📚 **Conceptual Understanding Focus:**\n• You're on the right track but need deeper understanding\n• Review concepts you thought you knew\n• Practice explaining topics to others\n• Ask \"why\" questions, not just \"what\"\n\n";
      } else {
        response += "🎯 **Fine-tuning Your Approach:**\n• You're doing well overall\n• Focus on specific areas for improvement\n• Review your mistakes carefully\n• Build on your strengths\n\n";
      }
      
      response += "🚨 **Immediate Recovery Steps:**\n\n";
      response += "📖 **Review & Analysis (Next 24 hours):**\n• Go through your quiz answers carefully\n• Identify exactly where you went wrong\n• Note down concepts you misunderstood\n• Don't just look at correct answers\n\n";
      
      response += "🔍 **Root Cause Analysis (This week):**\n• Was it lack of understanding or test anxiety?\n• Did you run out of time?\n• Were there specific topics you struggled with?\n• Did you study the right material?\n\n";
      
      response += "📚 **Learning Strategy Adjustment:**\n• Modify your study methods based on what you learned\n• Focus more on weak areas\n• Practice with similar question types\n• Use different learning resources\n\n";
      
      response += "💡 **Specific Improvement Actions:**\n\n";
      response += "**Week 1: Foundation Building**\n• Review basic concepts thoroughly\n• Create summary notes\n• Practice with simple questions\n• Build confidence gradually\n\n";
      
      response += "**Week 2: Skill Development**\n• Practice application questions\n• Work on time management\n• Review your notes regularly\n• Take practice quizzes\n\n";
      
      response += "**Week 3: Mastery & Confidence**\n• Challenge yourself with harder questions\n• Simulate exam conditions\n• Review all materials\n• Build mental resilience\n\n";
      
      response += "🎯 **Success Metrics:**\n• Track your improvement weekly\n• Celebrate small wins\n• Focus on progress, not perfection\n• Set realistic, achievable goals\n\n";
      
      response += "Would you like me to:\n• Create a detailed recovery study plan?\n• Help you analyze your specific mistakes?\n• Suggest study techniques for your weak areas?\n• Set up a progress tracking system?";
      
      return response;
    }

    // Advanced quiz assistance
    if (lowerMessage.includes('quiz') || lowerMessage.includes('test') || lowerMessage.includes('exam')) {
      if (lowerMessage.includes('upcoming') || lowerMessage.includes('next') || lowerMessage.includes('schedule')) {
        if (upcomingQuizzes.length === 0) {
          return "🎉 **Great news!** You don't have any upcoming quizzes at the moment. This is perfect for:\n\n• 📚 **Review & Consolidation** - Strengthen your knowledge\n• 🎯 **Advanced Preparation** - Get ahead on future topics\n• 💪 **Skill Building** - Practice with sample questions\n• 📖 **Reading Ahead** - Explore upcoming course materials\n\nWould you like me to help you create a study plan or review previous quiz performance?";
        }
        
        let response = "📅 **Your Upcoming Quiz Schedule:**\n\n";
        upcomingQuizzes.forEach((quiz, index) => {
          const startDate = new Date(quiz.startTime).toLocaleDateString();
          const startTime = new Date(quiz.startTime).toLocaleTimeString();
          const daysUntil = Math.ceil((new Date(quiz.startTime) - new Date()) / (1000 * 60 * 60 * 24));
          
          response += `${index + 1}. 📝 **${quiz.title}**\n`;
          response += `   📚 Class: ${quiz.classId.name}\n`;
          response += `   📅 Date: ${startDate} (${daysUntil} day${daysUntil !== 1 ? 's' : ''} away)\n`;
          response += `   ⏰ Time: ${startTime}\n`;
          response += `   ⏱️ Duration: ${quiz.duration} minutes\n`;
          response += `   📊 Questions: ${quiz.questions.length}\n`;
          response += `   🎯 Total Points: ${quiz.questions.reduce((sum, q) => sum + q.points, 0)}\n\n`;
        });

        // Add personalized study recommendations
        if (upcomingQuizzes.length > 0) {
          const nextQuiz = upcomingQuizzes[0];
          const daysUntil = Math.ceil((new Date(nextQuiz.startTime) - new Date()) / (1000 * 60 * 60 * 24));
          
          response += "🎯 **Smart Study Recommendations:**\n\n";
          if (daysUntil <= 1) {
            response += "🚨 **Last-Minute Prep Mode:**\n• Review key concepts quickly\n• Practice with sample questions\n• Get a good night's sleep\n• Stay calm and focused\n\n";
          } else if (daysUntil <= 3) {
            response += "⚡ **Intensive Review Mode:**\n• Focus on weak areas\n• Create summary notes\n• Practice timed questions\n• Review class materials\n\n";
          } else {
            response += "📚 **Strategic Study Mode:**\n• Create a study schedule\n• Break topics into chunks\n• Practice regularly\n• Build confidence gradually\n\n";
          }
        }

        return response;
      }
      
      if (lowerMessage.includes('prepare') || lowerMessage.includes('study') || lowerMessage.includes('tips')) {
        const performanceLevel = averageScore >= 80 ? 'advanced' : averageScore >= 60 ? 'intermediate' : 'beginner';
        
        let response = `🎓 **Personalized Study Strategy for ${performanceLevel} level:**\n\n`;
        
        if (performanceLevel === 'beginner') {
          response += "🌱 **Foundation Building:**\n• Start with basic concepts\n• Use visual learning aids\n• Practice with simple questions\n• Build confidence step by step\n\n";
        } else if (performanceLevel === 'intermediate') {
          response += "🚀 **Skill Enhancement:**\n• Focus on application questions\n• Practice problem-solving\n• Review common mistakes\n• Build speed and accuracy\n\n";
        } else {
          response += "🏆 **Mastery Level:**\n• Challenge yourself with complex problems\n• Help other students\n• Explore advanced topics\n• Maintain high standards\n\n";
        }
        
        response += "⏰ **Time Management:**\n• Use the Pomodoro Technique (25 min work + 5 min break)\n• Study during your peak energy hours\n• Plan study sessions in advance\n• Avoid last-minute cramming\n\n";
        
        response += "🧠 **Learning Techniques:**\n• Active recall (test yourself)\n• Spaced repetition\n• Mind mapping\n• Teaching others\n• Practice with past questions\n\n";
        
        response += "💡 **Smart Tips:**\n• Study in a quiet, distraction-free environment\n• Take regular breaks to maintain focus\n• Use multiple learning resources\n• Connect new concepts to existing knowledge\n\n";
        
        response += "Would you like me to create a personalized study schedule for your upcoming quizzes?";
        
        return response;
      }
      
      if (lowerMessage.includes('performance') || lowerMessage.includes('score') || lowerMessage.includes('grade')) {
        let response = `📊 **Your Academic Performance Dashboard:**\n\n`;
        
        response += `🎯 **Quiz Statistics:**\n• Total Quizzes: ${totalQuizzes}\n• Average Score: ${averageScore}%\n• Performance Level: ${averageScore >= 80 ? '🏆 Excellent' : averageScore >= 60 ? '🚀 Good' : '📚 Developing'}\n\n`;
        
        if (totalQuizzes > 0) {
          const recentSubmissions = submissions.slice(-3);
          response += "📈 **Recent Performance:**\n";
          recentSubmissions.forEach(sub => {
            const quiz = upcomingQuizzes.find(q => q._id.toString() === sub.quiz.toString());
            const quizTitle = quiz ? quiz.title : 'Quiz';
            const percentage = ((sub.totalScore / sub.totalPoints) * 100).toFixed(1);
            response += `• ${quizTitle}: ${sub.totalScore}/${sub.totalPoints} (${percentage}%)\n`;
          });
          response += "\n";
          
          if (averageScore >= 80) {
            response += "🌟 **Outstanding Performance!**\n• You're demonstrating excellent understanding\n• Consider helping other students\n• Explore advanced topics\n• Maintain your high standards\n\n";
          } else if (averageScore >= 60) {
            response += "📈 **Good Progress!**\n• You're on the right track\n• Focus on areas for improvement\n• Practice more challenging questions\n• You can definitely improve further\n\n";
          } else {
            response += "💪 **Room for Growth!**\n• Don't get discouraged\n• Focus on fundamentals\n• Ask for help when needed\n• Every expert was once a beginner\n\n";
          }
        }
        
        response += "🎯 **Improvement Suggestions:**\n• Review questions you got wrong\n• Practice similar problems\n• Ask teachers for clarification\n• Form study groups\n• Use different learning methods\n\n";
        
        return response;
      }
      
      return "🧠 **Advanced Quiz Assistance Available:**\n\nI can help you with:\n\n• 📅 **Smart Scheduling** - Personalized quiz preparation plans\n• 🎯 **Performance Analysis** - Detailed insights and improvement areas\n• 📚 **Study Strategies** - AI-powered learning techniques\n• ⏰ **Time Management** - Optimal study schedules\n• 💡 **Learning Optimization** - Personalized study recommendations\n\nWhat specific aspect would you like to explore? Try asking:\n• \"Create a study plan for my next quiz\"\n• \"Analyze my quiz performance\"\n• \"Give me study tips for [specific topic]\"";
    }

    // Study improvement and learning enhancement
    if (lowerMessage.includes('improve') || lowerMessage.includes('better') || lowerMessage.includes('enhance') || lowerMessage.includes('progress') || lowerMessage.includes('skill')) {
      if (lowerMessage.includes('study') || lowerMessage.includes('learning') || lowerMessage.includes('academic') || lowerMessage.includes('method')) {
        let response = `🎯 **Personalized Study Improvement Plan for You**\n\n`;
        
        // Analyze current performance and provide specific advice
        if (totalQuizzes === 0) {
          response += "🌟 **Starting Your Learning Journey:**\n• You're at the beginning - this is exciting!\n• Focus on building strong foundations\n• Don't rush - quality over quantity\n• Ask questions whenever you're unsure\n\n";
        } else if (averageScore < 50) {
          response += "💪 **Building Strong Foundations:**\n• Your current score shows you need to strengthen basics\n• Review fundamental concepts thoroughly\n• Practice with simpler problems first\n• Build confidence step by step\n\n";
        } else if (averageScore < 70) {
          response += "📈 **Moving to Intermediate Level:**\n• You're making good progress!\n• Focus on understanding concepts deeply\n• Practice application questions\n• Review your mistakes carefully\n\n";
        } else if (averageScore < 85) {
          response += "🚀 **Advancing to Higher Levels:**\n• Excellent work! You're doing great\n• Challenge yourself with complex problems\n• Help other students (teaching reinforces learning)\n• Explore advanced topics\n\n";
        } else {
          response += "🏆 **Mastery Level Achievement:**\n• Outstanding performance! You're a top student\n• Consider tutoring others\n• Explore research opportunities\n• Set even higher goals\n\n";
        }
        
        response += "🧠 **Specific Improvement Strategies:**\n\n";
        response += "📚 **Content Mastery:**\n• Create concept maps for each topic\n• Use the Feynman Technique (explain to others)\n• Practice active recall daily\n• Connect new concepts to existing knowledge\n\n";
        
        response += "⏰ **Time Management:**\n• Use the 2-Minute Rule (start small tasks immediately)\n• Implement the 52/17 Rule (52 min work, 17 min break)\n• Plan study sessions during your peak hours\n• Eliminate distractions completely\n\n";
        
        response += "💡 **Learning Techniques:**\n• Spaced repetition (review at increasing intervals)\n• Interleaving (mix different topics)\n• Dual coding (combine words and visuals)\n• Elaboration (explain concepts in detail)\n\n";
        
        response += "🎯 **Immediate Action Plan:**\n1. **This Week:** Review your weakest topic\n2. **Next Week:** Practice with sample questions\n3. **Following Week:** Take a practice quiz\n4. **Ongoing:** Maintain a study journal\n\n";
        
        response += "Would you like me to:\n• Create a detailed weekly study schedule?\n• Analyze your specific weak areas?\n• Suggest study resources for particular topics?\n• Help you set SMART learning goals?";
        
        return response;
      }
    }

    // Quiz failure recovery and improvement
    if (lowerMessage.includes('fail') || lowerMessage.includes('failed') || lowerMessage.includes('poor') || lowerMessage.includes('bad') || lowerMessage.includes('low') || lowerMessage.includes('struggle')) {
      if (lowerMessage.includes('quiz') || lowerMessage.includes('test') || lowerMessage.includes('exam') || lowerMessage.includes('result') || lowerMessage.includes('last')) {
        let response = `💪 **Quiz Recovery & Improvement Strategy**\n\n`;
        
        // Provide specific failure recovery advice
        if (totalQuizzes === 0) {
          response += "🌟 **First Quiz Experience:**\n• Don't worry about your first attempt\n• Every expert was once a beginner\n• Use this as a learning opportunity\n• Focus on understanding, not just memorizing\n\n";
        } else if (averageScore < 50) {
          response += "🔧 **Fundamental Improvement Needed:**\n• Your scores indicate gaps in basic understanding\n• Let's rebuild your foundation step by step\n• Focus on one topic at a time\n• Master basics before moving to advanced concepts\n\n";
        } else if (averageScore < 70) {
          response += "📚 **Conceptual Understanding Focus:**\n• You're on the right track but need deeper understanding\n• Review concepts you thought you knew\n• Practice explaining topics to others\n• Ask \"why\" questions, not just \"what\"\n\n";
        } else {
          response += "🎯 **Fine-tuning Your Approach:**\n• You're doing well overall\n• Focus on specific areas for improvement\n• Review your mistakes carefully\n• Build on your strengths\n\n";
        }
        
        response += "🚨 **Immediate Recovery Steps:**\n\n";
        response += "📖 **Review & Analysis (Next 24 hours):**\n• Go through your quiz answers carefully\n• Identify exactly where you went wrong\n• Note down concepts you misunderstood\n• Don't just look at correct answers\n\n";
        
        response += "🔍 **Root Cause Analysis (This week):**\n• Was it lack of understanding or test anxiety?\n• Did you run out of time?\n• Were there specific topics you struggled with?\n• Did you study the right material?\n\n";
        
        response += "📚 **Learning Strategy Adjustment:**\n• Modify your study methods based on what you learned\n• Focus more on weak areas\n• Practice with similar question types\n• Use different learning resources\n\n";
        
        response += "💡 **Specific Improvement Actions:**\n\n";
        response += "**Week 1: Foundation Building**\n• Review basic concepts thoroughly\n• Create summary notes\n• Practice with simple questions\n• Build confidence gradually\n\n";
        
        response += "**Week 2: Skill Development**\n• Practice application questions\n• Work on time management\n• Review your notes regularly\n• Take practice quizzes\n\n";
        
        response += "**Week 3: Mastery & Confidence**\n• Challenge yourself with harder questions\n• Simulate exam conditions\n• Review all materials\n• Build mental resilience\n\n";
        
        response += "🎯 **Success Metrics:**\n• Track your improvement weekly\n• Celebrate small wins\n• Focus on progress, not perfection\n• Set realistic, achievable goals\n\n";
        
        response += "Would you like me to:\n• Create a detailed recovery study plan?\n• Help you analyze your specific mistakes?\n• Suggest study techniques for your weak areas?\n• Set up a progress tracking system?";
        
        return response;
      }
    }

    // Advanced class management
    if (lowerMessage.includes('class') || lowerMessage.includes('course')) {
      if (lowerMessage.includes('enrolled') || lowerMessage.includes('my classes') || lowerMessage.includes('schedule')) {
        if (enrolledClasses.length === 0) {
          return "📚 **No Classes Enrolled Yet**\n\nDon't worry! Here's how to get started:\n\n🔑 **Enrollment Process:**\n• Ask your teachers for enrollment codes\n• Use the \"Enroll in Class\" feature\n• Join classes that interest you\n• Start your learning journey!\n\n💡 **Tips for New Students:**\n• Start with 2-3 classes to manage workload\n• Choose classes that align with your interests\n• Don't hesitate to ask questions\n• Build relationships with classmates\n\nWould you like me to help you find classes or explain the enrollment process?";
        }
        
        let response = "📚 **Your Academic Portfolio:**\n\n";
        enrolledClasses.forEach((cls, index) => {
          response += `${index + 1}. 🎓 **${cls.name}**\n`;
          response += `   📝 Description: ${cls.description}\n`;
          response += `   🔑 Code: ${cls.enrollmentCode}\n`;
          response += `   📊 Status: Active\n\n`;
        });
        
        response += "🎯 **Class Management Tips:**\n• Review materials regularly\n• Participate in discussions\n• Connect with classmates\n• Ask questions when confused\n• Stay organized with deadlines\n\n";
        
        response += "Would you like me to help you:\n• Create a study schedule for your classes?\n• Analyze your performance across classes?\n• Suggest study strategies for specific subjects?";
        
        return response;
      }
      
      return "🎓 **Advanced Class Management Available:**\n\nI can help you with:\n\n• 📚 **Class Overview** - Detailed information about your courses\n• 📅 **Schedule Management** - Optimal study and review schedules\n• 📊 **Performance Tracking** - Cross-class analytics\n• 💡 **Learning Strategies** - Subject-specific study techniques\n• 🔄 **Progress Monitoring** - Regular check-ins and updates\n\nWhat would you like to know about your classes?";
    }

    // Advanced study planning
    if (lowerMessage.includes('plan') || lowerMessage.includes('schedule') || lowerMessage.includes('organize')) {
      if (upcomingQuizzes.length === 0) {
        return "📅 **No Upcoming Quizzes to Plan For**\n\nThis is perfect for:\n\n🎯 **Long-term Planning:**\n• Review and consolidate previous topics\n• Build strong foundations\n• Explore advanced concepts\n• Prepare for future challenges\n\n💡 **Suggested Activities:**\n• Create comprehensive study notes\n• Practice with sample questions\n• Review class materials\n• Help other students\n• Explore related topics\n\nWould you like me to help you create a general study plan or focus on specific subjects?";
      }
      
      let response = "📅 **AI-Powered Study Plan Generator**\n\n";
      
      upcomingQuizzes.forEach((quiz, index) => {
        const daysUntil = Math.ceil((new Date(quiz.startTime) - new Date()) / (1000 * 60 * 60 * 24));
        const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
        
        response += `📝 **${quiz.title}** (${daysUntil} day${daysUntil !== 1 ? 's' : ''} away)\n`;
        response += `   📚 Class: ${quiz.classId.name}\n`;
        response += `   🎯 Points: ${totalPoints}\n`;
        response += `   ⏰ Duration: ${quiz.duration} minutes\n\n`;
        
        if (daysUntil <= 1) {
          response += "   🚨 **Emergency Prep Plan:**\n";
          response += "   • 2 hours: Quick concept review\n";
          response += "   • 1 hour: Practice questions\n";
          response += "   • 30 min: Final review\n";
          response += "   • 30 min: Rest and mental prep\n\n";
        } else if (daysUntil <= 3) {
          response += "   ⚡ **Intensive Plan:**\n";
          response += "   • Day 1: Topic review and notes\n";
          response += "   • Day 2: Practice and problem-solving\n";
          response += "   • Day 3: Final review and confidence building\n\n";
        } else {
          response += "   📚 **Strategic Plan:**\n";
          response += "   • Week 1: Foundation building\n";
          response += "   • Week 2: Practice and application\n";
          response += "   • Final days: Review and preparation\n\n";
        }
      });
      
      response += "🎯 **General Study Tips:**\n• Study in 25-minute focused sessions\n• Take 5-minute breaks between sessions\n• Review material within 24 hours\n• Practice active recall\n• Get adequate sleep\n\n";
      
      response += "Would you like me to create a detailed daily schedule for any specific quiz?";
      
      return response;
    }



    // Help and support
    if (lowerMessage.includes('help') || lowerMessage.includes('support') || lowerMessage.includes('confused')) {
      return `🤝 **I'm Here to Help!**\n\nHere's what I can assist you with:\n\n🧠 **Academic Support:**\n• Personalized study planning\n• Quiz preparation strategies\n• Performance analysis\n• Learning optimization\n\n📚 **Class Management:**\n• Course information and schedules\n• Enrollment assistance\n• Resource organization\n• Progress tracking\n\n💡 **Study Enhancement:**\n• Time management techniques\n• Learning strategies\n• Motivation and encouragement\n• Stress management\n\n🚀 **Advanced Features:**\n• AI-powered recommendations\n• Context-aware responses\n• Personalized insights\n• Adaptive learning support\n\n🎯 **Specific Help Available:**\n• \"How can I improve my study skills?\"\n• \"I failed my last quiz, what should I do?\"\n• \"I'm struggling with [specific topic]\"\n• \"Help me create a study schedule\"\n\nJust tell me what you need help with, and I'll provide personalized assistance! 😊`;
    }

    // Gratitude responses
    if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
      return "You're very welcome! 😊 It's my pleasure to help you succeed in your studies. Remember, I'm always here whenever you need:\n\n• 📚 Academic guidance\n• 💡 Study tips\n• 🎯 Performance insights\n• 🚀 Motivation and support\n\nKeep up the great work, and don't hesitate to ask for help anytime! 🌟";
    }

    // Farewell
    if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye') || lowerMessage.includes('see you')) {
      return "Goodbye! 👋 It's been wonderful helping you today.\n\nRemember:\n• 📚 Stay consistent with your studies\n• 💪 Believe in your abilities\n• 🎯 Focus on progress, not perfection\n• 🌟 You're capable of amazing things\n\nI'll be here whenever you need me. Good luck with your studies! 🚀";
    }

    // Context-aware follow-up questions
    if (recentMessages.length > 0) {
      const lastMessage = recentMessages[recentMessages.length - 1];
      if (lastMessage.toLowerCase().includes('quiz') && !lowerMessage.includes('quiz')) {
        return `I see you were asking about quizzes earlier. Would you like me to help you with:\n\n• 📅 Creating a study plan for your upcoming quizzes?\n• 📊 Analyzing your quiz performance?\n• 💡 Getting study tips and strategies?\n• 🎯 Setting quiz preparation goals?\n\nOr is there something else I can help you with?`;
      }
    }

    // Default intelligent response with better conversation flow
    return `🧠 **I Understand Your Question**\n\nYou're asking about "${message}". Let me provide you with comprehensive help!\n\nI can assist with:\n\n📚 **Academic Excellence:**\n• Quiz preparation and strategies\n• Class management and organization\n• Study planning and scheduling\n• Performance analysis and improvement\n\n💡 **Learning Enhancement:**\n• Personalized study techniques\n• Time management strategies\n• Motivation and encouragement\n• Stress management and support\n\n🎯 **Smart Recommendations:**\n• AI-powered study plans\n• Context-aware suggestions\n• Performance insights\n• Resource optimization\n\n💬 **Try asking me specific questions like:**\n• \"How can I improve my study skills?\"\n• \"I failed my last quiz, what should I do now?\"\n• \"Help me create a study plan for [subject]\"\n• \"I'm struggling with [topic], give me specific tips\"\n• \"What's the best way to prepare for my next quiz?\"\n\nI'm here to provide personalized, intelligent assistance! 😊`;
    
  } catch (error) {
    console.error("Error generating advanced AI response:", error);
    return "I'm sorry, I'm experiencing some technical difficulties right now. Please try again in a moment, or contact support if the issue persists. In the meantime, you can try:\n\n• Refreshing the page\n• Asking a different question\n• Checking your internet connection\n\nI'm here to help once we get this sorted out! 🤖";
  }
};

// Enhanced chat with AI chatbot
export const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user._id;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        message: "Message is required"
      });
    }

    // Generate or retrieve conversation ID (maintain conversation continuity)
    let conversationId = `conv_${userId}`;
    
    // Store conversation in memory
    if (!conversationMemory.has(conversationId)) {
      conversationMemory.set(conversationId, []);
    }
    conversationMemory.get(conversationId).push(message);

    // Generate advanced AI response
    const aiResponse = await generateAdvancedAIResponse(message.trim(), userId, conversationId);

    // Store AI response in conversation
    conversationMemory.get(conversationId).push(aiResponse);

    // Clean up old conversations (keep only last 50 per user)
    const userConversations = Array.from(conversationMemory.keys()).filter(key => key.startsWith(`conv_${userId}`));
    if (userConversations.length > 50) {
      // Keep only the most recent 50 conversations for this user
      const sortedKeys = userConversations.sort((a, b) => {
        const aTime = parseInt(a.split('_')[2]) || 0;
        const bTime = parseInt(b.split('_')[2]) || 0;
        return bTime - aTime;
      });
      
      // Remove older conversations
      sortedKeys.slice(50).forEach(key => conversationMemory.delete(key));
    }

    // Return the response
    res.status(200).json({
      message: "Advanced AI response generated successfully",
      response: aiResponse,
      timestamp: new Date(),
      userMessage: message.trim(),
      conversationId: conversationId,
      features: {
        contextAware: true,
        sentimentAnalysis: true,
        personalizedResponses: true,
        conversationMemory: true,
        smartRecommendations: true
      }
    });

  } catch (error) {
    console.error("Error in advanced chatbot controller:", error);
    res.status(500).json({
      message: "Internal server error"
    });
  }
};

// Get chat history (enhanced)
export const getChatHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Return conversation memory for the user
    const userConversations = Array.from(conversationMemory.entries())
      .filter(([key]) => key.startsWith(`conv_${userId}_`))
      .map(([key, messages]) => ({
        conversationId: key,
        messages: messages.slice(-10), // Last 10 messages
        timestamp: new Date()
      }));
    
    res.status(200).json({
      message: "Chat history retrieved successfully",
      conversations: userConversations,
      totalConversations: userConversations.length
    });

  } catch (error) {
    console.error("Error getting chat history:", error);
    res.status(500).json({
      message: "Internal server error"
    });
  }
};

// Get chatbot capabilities
export const getChatbotCapabilities = async (req, res) => {
  try {
    res.status(200).json({
      message: "Chatbot capabilities retrieved successfully",
      capabilities: {
        naturalLanguageProcessing: true,
        contextAwareness: true,
        conversationMemory: true,
        sentimentAnalysis: true,
        personalizedResponses: true,
        smartRecommendations: true,
        studyPlanning: true,
        performanceAnalysis: true,
        motivationSupport: true,
        stressManagement: true,
        academicGuidance: true,
        learningOptimization: true
      },
      features: [
        "AI-powered study planning",
        "Context-aware responses",
        "Personalized learning recommendations",
        "Performance analytics and insights",
        "Stress management and motivation",
        "Advanced quiz preparation strategies",
        "Intelligent class management",
        "Conversation memory and continuity",
        "Sentiment analysis and emotional support",
        "Adaptive learning suggestions"
      ]
    });
  } catch (error) {
    console.error("Error getting chatbot capabilities:", error);
    res.status(500).json({
      message: "Internal server error"
    });
  }
};

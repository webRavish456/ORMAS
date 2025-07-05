import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Star, Send, User, Mail, Phone, Heart } from 'lucide-react';
import { Layout } from '../components/common/Layout';
import { submitFeedbackToExhibition } from '../services/feedbackService';
import { useExhibition } from '../contexts/ExhibitionContext';

export const Feedback = () => {
  const { selectedExhibition } = useExhibition();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    gender: '',
    areaOfInterest: '',
    responses: {} as Record<string, string>
  });
  const [rating, setRating] = useState(0);
  const [foodRating, setFoodRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await submitFeedbackToExhibition(selectedExhibition, {
        ...formData,
        location: '',
        responses: [
          { question: 'Exhibition Rating', answer: rating.toString() },
          { question: 'Food Rating', answer: foodRating.toString() },
          { question: 'Message', answer: formData.responses.message || '' }
        ]
      });
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Layout>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto text-center py-16"
        >
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
            Thank You!
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Your feedback has been submitted successfully. We appreciate your input!
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setSubmitted(false);
              setRating(0);
              setFoodRating(0);
              setFormData({
                name: '',
                email: '',
                mobile: '',
                gender: '',
                areaOfInterest: '',
                responses: {}
              });
            }}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200"
          >
            Submit Another Feedback
          </motion.button>
        </motion.div>
      </Layout>
    );
  }

  return (
    <Layout 
      title="Visitor Feedback"
      subtitle="Share your experience and help us improve future exhibitions"
      backgroundGradient="from-pink-50 via-rose-50 to-red-50 dark:from-dark-900 dark:via-dark-800 dark:to-dark-900"
    >
      <div className="max-w-4xl mx-auto pb-8 sm:pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-dark-800 rounded-2xl shadow-xl p-4 sm:p-8 border border-gray-200 dark:border-dark-700"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-pink-500 to-red-600 rounded-full flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              We Value Your Feedback
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Help us improve by sharing your thoughts about the exhibition
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Personal Information - Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <User className="inline w-4 h-4 mr-2" />
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Mail className="inline w-4 h-4 mr-2" />
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
              </div>

            {/* Mobile Number and Exhibition Rating - Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Phone className="inline w-4 h-4 mr-2" />
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Enter your mobile number"
                />
              </div>

              {/* Exhibition Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Exhibition Rating *
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setRating(star)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      star <= rating 
                        ? 'bg-yellow-400 text-white' 
                        : 'bg-gray-200 dark:bg-dark-700 text-gray-400'
                    }`}
                  >
                    <Star className={`w-6 h-6 ${star <= rating ? 'fill-current' : ''}`} />
                  </motion.button>
                  ))}
                </div>
              </div>
            </div>

            {/* Food Rating - Row 3 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                Food Rating
              </label>
              <div className="flex gap-3">
                {[
                  { value: 1, emoji: '😞', label: 'Bad' },
                  { value: 2, emoji: '😐', label: 'Average' },
                  { value: 3, emoji: '😊', label: 'Good' },
                  { value: 4, emoji: '😍', label: 'Excellent' }
                ].map((option) => (
                  <div key={option.value} className="flex flex-col items-center">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setFoodRating(option.value)}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        foodRating === option.value
                          ? 'bg-orange-400 text-white'
                          : 'bg-gray-200 dark:bg-dark-700 text-gray-400 hover:bg-orange-200'
                      }`}
                    >
                      <span className="text-lg">{option.emoji}</span>
                    </motion.button>
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300 mt-1 text-center">
                      {option.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Message
              </label>
              <textarea
                value={formData.responses.message || ''}
                onChange={(e) => setFormData({
                  ...formData, 
                  responses: {...formData.responses, message: e.target.value}
                })}
                rows={4}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Share your thoughts about the exhibition..."
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4 sm:pt-6">
            <motion.button
              type="submit"
              disabled={loading || rating === 0}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-pink-500 to-red-600 hover:from-pink-600 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit Feedback
                </>
              )}
            </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </Layout>
  );
};

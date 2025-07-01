import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Image as ImageIcon } from 'lucide-react';
import { Layout } from '../components/common/Layout';
import { getEvents, type Event } from '../services/scheduleService';

export const Schedule = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const fetchedEvents = await getEvents();
        setEvents(fetchedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Group events by date and sort by time
  const groupedEvents = events.reduce((groups: { [key: string]: Event[] }, event) => {
    const dateKey = event.date;
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(event);
    return groups;
  }, {});

  // Sort dates in ascending order
  const sortedDates = Object.keys(groupedEvents).sort((a, b) => {
    return new Date(a).getTime() - new Date(b).getTime();
  });

  // Sort events within each date by time
  sortedDates.forEach(date => {
    groupedEvents[date].sort((a, b) => {
      const timeA = a.time.replace(/[^\d:]/g, '');
      const timeB = b.time.replace(/[^\d:]/g, '');
      return timeA.localeCompare(timeB);
    });
  });

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full"
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout 
      title="Event Schedule"
      subtitle="Stay updated with cultural programs, workshops, and special events"
      backgroundGradient="from-green-50 via-emerald-50 to-teal-50 dark:from-dark-900 dark:via-dark-800 dark:to-dark-900"
    >
      {/* Date-wise Schedule */}
      <div className="space-y-8">
        {sortedDates.map((date, dateIndex) => (
          <motion.div
            key={date}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: dateIndex * 0.1 }}
            className="space-y-4"
          >
            {/* Date Header */}
            <div className="sticky top-20 z-10 bg-white/80 dark:bg-dark-900/80 backdrop-blur-md rounded-xl p-3 sm:p-4 shadow-lg border border-gray-200 dark:border-dark-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">
                    {new Date(date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                    {groupedEvents[date].length} {groupedEvents[date].length === 1 ? 'event' : 'events'} scheduled
                  </p>
                </div>
              </div>
            </div>

            {/* Events for this date */}
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
              {groupedEvents[date].map((event, eventIndex) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (dateIndex * 0.1) + (eventIndex * 0.05) }}
                  className="group bg-white dark:bg-dark-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-dark-700"
                >
                  {/* Event Image */}
                  {event.images && event.images.length > 0 && event.images[0] && (
                    <div className="relative h-40 sm:h-48 overflow-hidden">
                      <img
                        src={event.images[0]}
                        alt={event.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      
                      {/* Time Badge */}
                      <div className="absolute top-3 left-3 bg-green-600 text-white backdrop-blur-sm rounded-xl px-3 py-1 shadow-lg">
                        <div className="text-sm font-bold">
                          {event.time}
                        </div>
                      </div>

                      {/* Multiple Images Indicator */}
                      {event.images.length > 1 && (
                        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1 text-white text-xs font-medium">
                          +{event.images.length - 1}
                        </div>
                      )}
                    </div>
                  )}

                  {/* No Image Placeholder */}
                  {(!event.images || event.images.length === 0 || !event.images[0]) && (
                    <div className="relative h-40 sm:h-48 bg-gradient-to-br from-green-100 to-emerald-200 dark:from-green-900 dark:to-emerald-800 flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-green-400 dark:text-green-600" />
                      
                      {/* Time Badge for no-image events */}
                      <div className="absolute top-3 left-3 bg-green-600 text-white backdrop-blur-sm rounded-xl px-3 py-1 shadow-lg">
                        <div className="text-sm font-bold">
                          {event.time}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="p-4 sm:p-5">
                    {/* Event Details */}
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors line-clamp-2">
                      {event.name}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm sm:text-base line-clamp-3 leading-relaxed">
                      {event.description}
                    </p>

                    {/* Event Meta */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg">
                          <Clock className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-700 dark:text-gray-300">
                            {event.time}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Duration varies
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg">
                          <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-700 dark:text-gray-300">
                            {event.venue}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Additional Images Preview */}
                    {event.images && event.images.length > 1 && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-dark-600">
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {event.images.slice(1, 4).map((image, idx) => (
                            <img
                              key={idx}
                              src={image}
                              alt={`${event.name} ${idx + 2}`}
                              className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-lg border-2 border-gray-200 dark:border-dark-600 flex-shrink-0"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ))}
                          {event.images.length > 4 && (
                            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 dark:bg-dark-700 rounded-lg border-2 border-gray-200 dark:border-dark-600 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                +{event.images.length - 4}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {events.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12 sm:py-16"
        >
          <div className="w-20 sm:w-24 h-20 sm:h-24 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-dark-700 dark:to-dark-600 rounded-full flex items-center justify-center">
            <Calendar className="w-10 sm:w-12 h-10 sm:h-12 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white mb-2">
            No events found
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
            Check back later for upcoming events and programs
          </p>
        </motion.div>
      )}
    </Layout>
  );
};

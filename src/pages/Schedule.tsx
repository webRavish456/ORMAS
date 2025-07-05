import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Image as ImageIcon, ArrowLeft, ChevronRight } from 'lucide-react';
import { Layout } from '../components/common/Layout';
import { getEventsByExhibition, type Event } from '../services/scheduleService';
import { useExhibition } from '../contexts/ExhibitionContext';

export const Schedule = () => {
  const { selectedExhibition } = useExhibition();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!selectedExhibition) {
        setEvents([]);
        setLoading(false);
        return;
      }

      try {
        const fetchedEvents = await getEventsByExhibition(selectedExhibition);
        setEvents(fetchedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [selectedExhibition]);

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

  const handleDateClick = (date: string) => {
    setSelectedDate(date);
  };

  const handleBackToDateList = () => {
    setSelectedDate(null);
  };

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

  if (selectedDate) {
    // Show events for selected date
    const selectedDateEvents = groupedEvents[selectedDate] || [];
    
    return (
      <Layout 
        title="Event Schedule"
        subtitle={`Events for ${new Date(selectedDate).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}`}
        backgroundGradient="from-green-50 via-emerald-50 to-teal-50 dark:from-dark-900 dark:via-dark-800 dark:to-dark-900"
      >
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={handleBackToDateList}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Date List</span>
          </button>
        </div>

        {/* Selected Date Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-white/80 dark:bg-dark-900/80 backdrop-blur-md rounded-xl p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-dark-700"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
                {new Date(selectedDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                {selectedDateEvents.length} {selectedDateEvents.length === 1 ? 'event' : 'events'} scheduled
              </p>
            </div>
          </div>
        </motion.div>

        {/* Events for Selected Date */}
        {selectedDateEvents.length > 0 ? (
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
            {selectedDateEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
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
                            className="w-16 h-16 object-cover rounded-lg flex-shrink-0 border-2 border-gray-200 dark:border-dark-600"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
              No events scheduled
            </h3>
            <p className="text-gray-500 dark:text-gray-500">
              No events are scheduled for this date.
            </p>
          </div>
        )}
      </Layout>
    );
  }

  // Show date selection view
  return (
    <Layout 
      title="Event Schedule"
      subtitle="Select a date to view events and activities"
      backgroundGradient="from-green-50 via-emerald-50 to-teal-50 dark:from-dark-900 dark:via-dark-800 dark:to-dark-900"
    >
      {/* Date Blocks */}
      {sortedDates.length > 0 ? (
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sortedDates.map((date, index) => (
            <motion.div
              key={date}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleDateClick(date)}
              className="group cursor-pointer bg-white dark:bg-dark-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-dark-700 hover:border-green-300 dark:hover:border-green-600"
            >
              <div className="relative p-6">
                {/* Date Display */}
                <div className="text-center mb-4">
                  <div className="text-3xl sm:text-4xl font-bold text-green-600 dark:text-green-400 mb-1">
                    {new Date(date).getDate()}
                  </div>
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    {new Date(date).toLocaleDateString('en-US', { month: 'short' })}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    {new Date(date).getFullYear()}
                  </div>
                </div>

                {/* Day of Week */}
                <div className="text-center mb-4">
                  <div className="text-lg font-semibold text-gray-800 dark:text-white">
                    {new Date(date).toLocaleDateString('en-US', { weekday: 'long' })}
                  </div>
                </div>

                {/* Event Count */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full">
                    <Calendar className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {groupedEvents[date].length} {groupedEvents[date].length === 1 ? 'event' : 'events'}
                  </span>
                </div>

                {/* Event Preview */}
                <div className="space-y-2">
                  {groupedEvents[date].slice(0, 2).map((event, idx) => (
                    <div key={event.id} className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="w-3 h-3 flex-shrink-0" />
                      <span className="font-medium">{event.time}</span>
                      <span className="truncate">{event.name}</span>
                    </div>
                  ))}
                  {groupedEvents[date].length > 2 && (
                    <div className="text-xs text-gray-400 dark:text-gray-500 text-center">
                      +{groupedEvents[date].length - 2} more events
                    </div>
                  )}
                </div>

                {/* Hover Arrow */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
            No events scheduled
          </h3>
          <p className="text-gray-500 dark:text-gray-500">
            No events have been scheduled yet. Check back later for updates.
          </p>
        </div>
      )}
    </Layout>
  );
};

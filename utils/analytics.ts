import { Friend, TimeRange } from '../types';

export const calculateOverlaps = (friends: Friend[]): TimeRange[] => {
  if (friends.length === 0) return [];

  const ranges: TimeRange[] = [];
  const hoursCount = 24;

  // 1. Calculate stats for each hour
  const hourlyStats = Array.from({ length: hoursCount }, (_, hour) => {
    let onlineCount = 0;
    const missing: string[] = [];
    
    friends.forEach(friend => {
      // Handle case where schedule might be undefined or wrong length
      const status = friend.schedule?.[hour] ?? 0;
      if (status === 1) {
        onlineCount++;
      } else {
        missing.push(friend.name);
      }
    });

    return { count: onlineCount, missing };
  });

  // 2. Group consecutive hours with the SAME availability count and SAME missing people
  let currentStart = 0;

  for (let i = 1; i <= hoursCount; i++) {
    const prev = hourlyStats[i - 1];
    const curr = i < hoursCount ? hourlyStats[i] : null;

    // Condition to break the range:
    // - End of day (curr is null)
    // - Count changed
    // - Different people are missing (even if count is same)
    const isDifferent = !curr || 
                        curr.count !== prev.count || 
                        curr.missing.sort().join(',') !== prev.missing.sort().join(',');

    if (isDifferent) {
      // Only add meaningful ranges (e.g., where at least 1 person is online)
      if (prev.count > 0) {
        ranges.push({
          start: currentStart,
          end: i - 1,
          duration: i - currentStart,
          count: prev.count,
          total: friends.length,
          missingFriends: prev.missing
        });
      }
      currentStart = i;
    }
  }

  // Sort by: 
  // 1. Count (descending) - most people first
  // 2. Duration (descending) - longest sessions first
  return ranges.sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return b.duration - a.duration;
  });
};

export const formatTime = (hour: number) => `${hour.toString().padStart(2, '0')}:00`;
export const formatTimeRange = (start: number, end: number) => {
    // End time is inclusive in data, but visual is usually "until start of next hour"
    // So 14:00 to 14:00 (1 hour) shows as 14:00 - 15:00
    return `${formatTime(start)} - ${formatTime(end + 1)}`;
}
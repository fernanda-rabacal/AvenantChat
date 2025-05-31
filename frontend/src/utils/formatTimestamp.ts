import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/en';

dayjs.extend(relativeTime);
dayjs.locale('en');

export const formatTimestamp = (date_value: Date | string) => {
  const now = dayjs();
  const date = dayjs(date_value);

  const diffInHours = now.diff(date, 'hour');

  if (diffInHours < 1) {
    return date.fromNow();
  } else {
    return date.format('MMM D [at] h:mm A'); // e.g., "May 31 at 2:45 PM"
  }
};

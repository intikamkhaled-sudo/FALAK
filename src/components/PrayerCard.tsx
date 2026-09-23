import { formatTime } from "../utils/timeFormat";

interface Props {
  name: string;

  time: Date | null;
}

export default function PrayerCard({ name, time }: Props) {
  return (
    <div className="prayer-mini-card">
      <span>🕌 {name}</span>

      <strong>{formatTime(time)}</strong>
    </div>
  );
}

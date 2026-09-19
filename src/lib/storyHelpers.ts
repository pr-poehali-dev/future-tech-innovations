export interface Story {
  id: number;
  category: string;
  text: string;
  reactions: number;
  comments_count: number;
  created_at: string;
}

export const CATEGORIES = ["Работа", "Отношения", "Здоровье", "Семья", "Одиночество", "Деньги", "Другое"];

export const categoryColors: Record<string, string> = {
  Работа: "bg-blue-100 text-blue-700",
  Отношения: "bg-pink-100 text-pink-700",
  Здоровье: "bg-green-100 text-green-700",
  Семья: "bg-orange-100 text-orange-700",
  Одиночество: "bg-purple-100 text-purple-700",
  Деньги: "bg-yellow-100 text-yellow-700",
  Другое: "bg-neutral-200 text-neutral-700",
};

export function timeAgo(isoDate: string) {
  const diff = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000);
  if (diff < 3600) return `${Math.floor(diff / 60)} мин. назад`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ч. назад`;
  if (diff < 172800) return "вчера";
  return `${Math.floor(diff / 86400)} дн. назад`;
}

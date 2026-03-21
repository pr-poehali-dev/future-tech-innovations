import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const STORIES_URL = "https://functions.poehali.dev/30c3a833-c1da-4950-ade7-7ab6cb5d1111";

const categoryColors: Record<string, string> = {
  Работа: "bg-blue-100 text-blue-700",
  Отношения: "bg-pink-100 text-pink-700",
  Здоровье: "bg-green-100 text-green-700",
  Семья: "bg-orange-100 text-orange-700",
  Одиночество: "bg-purple-100 text-purple-700",
  Деньги: "bg-yellow-100 text-yellow-700",
};

function timeAgo(isoDate: string) {
  const diff = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000);
  if (diff < 3600) return `${Math.floor(diff / 60)} мин. назад`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ч. назад`;
  if (diff < 172800) return "вчера";
  return `${Math.floor(diff / 86400)} дн. назад`;
}

interface Story {
  id: number;
  category: string;
  text: string;
  reactions: number;
  comments_count: number;
  created_at: string;
}

export default function Stories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchStories = async (newOffset = 0, append = false) => {
    setLoading(true);
    const res = await fetch(`${STORIES_URL}?limit=6&offset=${newOffset}`);
    const data = await res.json();
    setStories(prev => append ? [...prev, ...data.stories] : data.stories);
    setTotal(data.total);
    setOffset(newOffset + data.stories.length);
    setLoading(false);
  };

  useEffect(() => {
    fetchStories(0, false);
  }, []);

  return (
    <section className="bg-neutral-50 py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <p className="uppercase text-sm tracking-wide text-neutral-500 mb-3">Сообщество</p>
          <h2 className="text-3xl md:text-5xl font-bold text-neutral-900 leading-tight">
            Последние истории
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story, i) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="bg-white p-6 flex flex-col gap-4 hover:shadow-md transition-shadow duration-300 cursor-pointer group"
            >
              <div className="flex justify-between items-center">
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${categoryColors[story.category] ?? "bg-neutral-100 text-neutral-600"}`}>
                  {story.category}
                </span>
                <span className="text-xs text-neutral-400">{timeAgo(story.created_at)}</span>
              </div>

              <p className="text-neutral-700 text-sm leading-relaxed line-clamp-4 flex-1">
                {story.text}
              </p>

              <div className="flex items-center gap-5 pt-2 border-t border-neutral-100">
                <button className="flex items-center gap-1.5 text-neutral-400 hover:text-rose-500 transition-colors duration-200 text-sm">
                  <span>♥</span>
                  <span>{story.reactions}</span>
                </button>
                <button className="flex items-center gap-1.5 text-neutral-400 hover:text-neutral-700 transition-colors duration-200 text-sm">
                  <span>💬</span>
                  <span>{story.comments_count}</span>
                </button>
                <span className="ml-auto text-xs text-neutral-400 group-hover:text-neutral-600 transition-colors duration-200">
                  Читать →
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {loading && (
          <div className="mt-12 text-center text-neutral-400 text-sm">Загружаем истории...</div>
        )}

        {!loading && offset < total && (
          <div className="mt-12 text-center">
            <button
              onClick={() => fetchStories(offset, true)}
              className="border border-neutral-900 text-neutral-900 px-8 py-3 uppercase text-sm tracking-widest hover:bg-neutral-900 hover:text-white transition-all duration-300 cursor-pointer"
            >
              Показать больше
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

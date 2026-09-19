import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { STORIES_URL } from "@/config/api";
import { Story, categoryColors, timeAgo } from "@/lib/storyHelpers";

export default function Stories() {
  const navigate = useNavigate();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetch(`${STORIES_URL}?limit=6&offset=0`);
      const data = await res.json();
      setStories(data.stories);
      setLoading(false);
    })();
  }, []);

  return (
    <section className="bg-neutral-50 py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="uppercase text-sm tracking-wide text-neutral-500 mb-3">Сообщество</p>
            <h2 className="text-3xl md:text-5xl font-bold text-neutral-900 leading-tight">
              Последние истории
            </h2>
          </div>
          <button
            onClick={() => navigate("/stories")}
            className="text-sm uppercase tracking-widest text-neutral-500 hover:text-neutral-900 transition-colors duration-200 cursor-pointer w-fit"
          >
            Смотреть все →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story, i) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              onClick={() => navigate(`/stories/${story.id}`)}
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
                <span className="flex items-center gap-1.5 text-neutral-400 text-sm">
                  <span>♥</span>
                  <span>{story.reactions}</span>
                </span>
                <span className="flex items-center gap-1.5 text-neutral-400 text-sm">
                  <span>💬</span>
                  <span>{story.comments_count}</span>
                </span>
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

        <div className="mt-12 text-center">
          <button
            onClick={() => navigate("/stories")}
            className="border border-neutral-900 text-neutral-900 px-8 py-3 uppercase text-sm tracking-widest hover:bg-neutral-900 hover:text-white transition-all duration-300 cursor-pointer"
          >
            Показать больше
          </button>
        </div>
      </div>
    </section>
  );
}

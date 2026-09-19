import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Icon from "@/components/ui/icon";
import Footer from "@/components/Footer";
import { STORIES_URL } from "@/config/api";
import { Story, CATEGORIES, categoryColors, timeAgo } from "@/lib/storyHelpers";

export default function AllStories() {
  const navigate = useNavigate();
  const [stories, setStories] = useState<Story[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("Все");

  const fetchStories = async (newOffset: number, append: boolean, cat: string) => {
    setLoading(true);
    const url = `${STORIES_URL}?limit=9&offset=${newOffset}${cat !== "Все" ? `&category=${encodeURIComponent(cat)}` : ""}`;
    const res = await fetch(url);
    const data = await res.json();
    setStories(prev => append ? [...prev, ...data.stories] : data.stories);
    setTotal(data.total);
    setOffset(newOffset + data.stories.length);
    setLoading(false);
  };

  useEffect(() => {
    fetchStories(0, false, category);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-neutral-400 hover:text-neutral-700 transition-colors duration-200 mb-12 text-sm uppercase tracking-wide"
        >
          <Icon name="ArrowLeft" size={16} />
          Назад
        </button>

        <p className="uppercase text-sm tracking-wide text-neutral-500 mb-3">Сообщество</p>
        <h1 className="text-3xl md:text-5xl font-bold text-neutral-900 mb-10 leading-tight">
          Все истории
        </h1>

        <div className="flex flex-wrap gap-2 mb-12">
          {["Все", ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 text-sm border transition-all duration-200 cursor-pointer ${
                category === cat
                  ? "bg-neutral-900 text-white border-neutral-900"
                  : "bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {stories.length === 0 && !loading && (
          <p className="text-neutral-400 text-sm mb-12">В этой категории пока нет историй.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story, i) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: (i % 9) * 0.06 }}
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

        {!loading && offset < total && (
          <div className="mt-12 text-center">
            <button
              onClick={() => fetchStories(offset, true, category)}
              className="border border-neutral-900 text-neutral-900 px-8 py-3 uppercase text-sm tracking-widest hover:bg-neutral-900 hover:text-white transition-all duration-300 cursor-pointer"
            >
              Показать больше
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

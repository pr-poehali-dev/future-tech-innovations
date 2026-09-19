import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { STORIES_URL } from "@/config/api";
import { CATEGORIES } from "@/lib/storyHelpers";
import { getOwnerToken } from "@/lib/ownerToken";

export default function Share() {
  const navigate = useNavigate();
  const [category, setCategory] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !text.trim()) {
      setError("Выбери категорию и напиши свою историю");
      return;
    }
    setError("");
    setLoading(true);
    const res = await fetch(STORIES_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, text: text.trim(), owner_token: getOwnerToken() }),
    });
    setLoading(false);
    if (res.ok) {
      setDone(true);
    } else {
      setError("Что-то пошло не так. Попробуй ещё раз.");
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="text-5xl mb-6">🤍</div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">История опубликована</h2>
          <p className="text-neutral-500 mb-8">Спасибо, что поделился. Ты не один — кто-то обязательно это прочитает и поймёт.</p>
          <button
            onClick={() => navigate("/")}
            className="bg-neutral-900 text-white px-8 py-3 uppercase text-sm tracking-widest hover:bg-neutral-700 transition-all duration-300 cursor-pointer"
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-neutral-400 hover:text-neutral-700 transition-colors duration-200 mb-12 text-sm uppercase tracking-wide"
        >
          <Icon name="ArrowLeft" size={16} />
          Назад
        </button>

        <p className="uppercase text-sm tracking-wide text-neutral-500 mb-3">Эхо</p>
        <h1 className="text-3xl md:text-5xl font-bold text-neutral-900 mb-4 leading-tight">
          Расскажи свою историю
        </h1>
        <p className="text-neutral-500 mb-12">
          Анонимно. Без осуждения. Просто выговорись.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <label className="block text-sm uppercase tracking-wide text-neutral-500 mb-3">
              Категория
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
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
          </div>

          <div>
            <label className="block text-sm uppercase tracking-wide text-neutral-500 mb-3">
              Твоя история
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={1000}
              rows={8}
              placeholder="Напиши о том, что тебя тревожит, давит или не даёт покоя..."
              className="w-full bg-white border border-neutral-200 p-4 text-neutral-800 placeholder-neutral-400 resize-none focus:outline-none focus:border-neutral-500 transition-colors duration-200 text-sm leading-relaxed"
            />
            <div className="text-right text-xs text-neutral-400 mt-1">{text.length} / 1000</div>
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-neutral-900 text-white px-8 py-4 uppercase text-sm tracking-widest hover:bg-neutral-700 transition-all duration-300 cursor-pointer disabled:opacity-50 w-full"
          >
            {loading ? "Публикуем..." : "Опубликовать"}
          </button>
        </form>
      </div>
    </div>
  );
}
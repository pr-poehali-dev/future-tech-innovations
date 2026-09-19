import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Footer from "@/components/Footer";

const faqs = [
  {
    q: "Это действительно анонимно?",
    a: "Да. Мы не собираем имена, email или другие данные при публикации истории. Никто не сможет узнать, кто написал ту или иную историю.",
  },
  {
    q: "Кто модерирует истории и комментарии?",
    a: "Команда «Эхо» проверяет публикации на соответствие правилам сообщества: без оскорблений, спама и разжигания розни.",
  },
  {
    q: "Могу ли я удалить свою историю?",
    a: "Пока функция самостоятельного удаления в разработке. Если нужно удалить историю — напиши нам через страницу «Контакты».",
  },
  {
    q: "Это замена психологу?",
    a: "Нет. «Эхо» — место для поддержки и высказывания, но не медицинская или психологическая помощь. При серьёзных переживаниях рекомендуем обратиться к специалисту.",
  },
  {
    q: "Как работают реакции и комментарии?",
    a: "Любой посетитель может поставить реакцию «поддержать» и оставить комментарий под историей — анонимно, без регистрации.",
  },
];

export default function FAQ() {
  const navigate = useNavigate();
  const [open, setOpen] = useState<number | null>(null);

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

        <p className="uppercase text-sm tracking-wide text-neutral-500 mb-3">Вопросы и ответы</p>
        <h1 className="text-3xl md:text-5xl font-bold text-neutral-900 mb-12 leading-tight">
          FAQ
        </h1>

        <div className="flex flex-col divide-y divide-neutral-200 border-t border-b border-neutral-200">
          {faqs.map((item, i) => (
            <div key={i}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex justify-between items-center py-5 text-left cursor-pointer"
              >
                <span className="text-neutral-900 font-medium pr-4">{item.q}</span>
                <Icon
                  name={open === i ? "Minus" : "Plus"}
                  size={18}
                  className="text-neutral-400 shrink-0"
                />
              </button>
              {open === i && (
                <p className="text-neutral-600 text-sm leading-relaxed pb-5 pr-8">
                  {item.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}

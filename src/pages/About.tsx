import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Footer from "@/components/Footer";

export default function About() {
  const navigate = useNavigate();

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

        <p className="uppercase text-sm tracking-wide text-neutral-500 mb-3">О проекте</p>
        <h1 className="text-3xl md:text-5xl font-bold text-neutral-900 mb-8 leading-tight">
          Место, где тебя услышат
        </h1>

        <div className="flex flex-col gap-6 text-neutral-700 text-base leading-relaxed">
          <p>
            «Эхо» — площадка, где можно анонимно рассказать о том, что тревожит: о работе, отношениях, семье, деньгах или одиночестве. Иногда просто выговориться уже становится легче.
          </p>
          <p>
            Мы не заменяем психолога и не даём медицинских советов. Наша цель — дать пространство для честности, где нет осуждения, а есть поддержка таких же людей.
          </p>
          <p>
            Каждая история публикуется без имени и контактов автора. Никто не узнает, кто её написал — только сам человек и его переживания.
          </p>
          <p>
            Сообщество может реагировать на истории и оставлять комментарии поддержки. Мы модерируем контент, чтобы здесь всегда оставалось безопасно и уважительно.
          </p>
        </div>

        <button
          onClick={() => navigate("/share")}
          className="mt-12 bg-neutral-900 text-white px-8 py-4 uppercase text-sm tracking-widest hover:bg-neutral-700 transition-all duration-300 cursor-pointer"
        >
          Рассказать свою историю
        </button>
      </div>
      <Footer />
    </div>
  );
}

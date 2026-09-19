import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Footer from "@/components/Footer";

export default function Contacts() {
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

        <p className="uppercase text-sm tracking-wide text-neutral-500 mb-3">Мы на связи</p>
        <h1 className="text-3xl md:text-5xl font-bold text-neutral-900 mb-8 leading-tight">
          Контакты и помощь
        </h1>

        <p className="text-neutral-700 leading-relaxed mb-12">
          Если у тебя вопрос по работе платформы, жалоба на контент или просто хочешь что-то сказать команде — напиши нам любым удобным способом.
        </p>

        <div className="flex flex-col gap-6 mb-16">
          <div className="flex items-center gap-4 bg-white p-5">
            <Icon name="Mail" size={20} className="text-neutral-500" />
            <div>
              <p className="text-xs uppercase tracking-wide text-neutral-400 mb-1">Почта</p>
              <p className="text-neutral-900">support@echo-project.ru</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-white p-5">
            <Icon name="Send" size={20} className="text-neutral-500" />
            <div>
              <p className="text-xs uppercase tracking-wide text-neutral-400 mb-1">Telegram</p>
              <p className="text-neutral-900">@echo_support</p>
            </div>
          </div>
        </div>

        <div className="bg-neutral-900 text-white p-8">
          <h3 className="text-lg font-bold mb-3">Нужна настоящая поддержка прямо сейчас?</h3>
          <p className="text-neutral-300 text-sm leading-relaxed mb-4">
            Если тебе тяжело и нужна помощь специалиста — телефон психологической поддержки работает круглосуточно и бесплатно:
          </p>
          <p className="text-2xl font-bold tracking-wide">8 800 2000 122</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

import { motion } from "framer-motion";

const stories = [
  {
    id: 1,
    category: "Работа",
    time: "2 часа назад",
    text: "Уже полгода работаю на износ, но чувствую, что меня не замечают. Начальник хвалит других, хотя я делаю не меньше. Не знаю, продолжать или уходить.",
    reactions: 47,
    comments: 12,
  },
  {
    id: 2,
    category: "Отношения",
    time: "5 часов назад",
    text: "Расстались с парнем после трёх лет вместе. Он сказал, что ему нужно время для себя. Я не понимаю, что я сделала не так. Пустота внутри огромная.",
    reactions: 83,
    comments: 21,
  },
  {
    id: 3,
    category: "Здоровье",
    time: "вчера",
    text: "Тревога не отпускает уже несколько месяцев. Просыпаюсь ночью с ощущением, что что-то идёт не так, хотя всё вроде нормально. Устала бояться без причины.",
    reactions: 61,
    comments: 18,
  },
  {
    id: 4,
    category: "Семья",
    time: "вчера",
    text: "Мама постоянно сравнивает меня с братом. Он успешный, у него семья и своё дело. А я просто не такой. Чувствую себя лишним в собственной семье.",
    reactions: 55,
    comments: 9,
  },
  {
    id: 5,
    category: "Одиночество",
    time: "2 дня назад",
    text: "Переехал в новый город год назад. До сих пор нет друзей. Хожу на работу, возвращаюсь домой. Иногда кажется, что если я исчезну — никто не заметит.",
    reactions: 102,
    comments: 34,
  },
  {
    id: 6,
    category: "Деньги",
    time: "3 дня назад",
    text: "Взял кредит на лечение мамы. Теперь отдаю почти всю зарплату. Экономлю на еде. Стыдно говорить об этом вслух, но держать в себе уже невозможно.",
    reactions: 78,
    comments: 27,
  },
];

const categoryColors: Record<string, string> = {
  Работа: "bg-blue-100 text-blue-700",
  Отношения: "bg-pink-100 text-pink-700",
  Здоровье: "bg-green-100 text-green-700",
  Семья: "bg-orange-100 text-orange-700",
  Одиночество: "bg-purple-100 text-purple-700",
  Деньги: "bg-yellow-100 text-yellow-700",
};

export default function Stories() {
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
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${categoryColors[story.category]}`}>
                  {story.category}
                </span>
                <span className="text-xs text-neutral-400">{story.time}</span>
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
                  <span>{story.comments}</span>
                </button>
                <span className="ml-auto text-xs text-neutral-400 group-hover:text-neutral-600 transition-colors duration-200">
                  Читать →
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <button className="border border-neutral-900 text-neutral-900 px-8 py-3 uppercase text-sm tracking-widest hover:bg-neutral-900 hover:text-white transition-all duration-300 cursor-pointer">
            Показать больше
          </button>
        </div>
      </div>
    </section>
  );
}

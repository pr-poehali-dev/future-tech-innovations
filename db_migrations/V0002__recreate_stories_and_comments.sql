CREATE TABLE IF NOT EXISTS stories (
  id SERIAL PRIMARY KEY,
  category VARCHAR(50) NOT NULL,
  text TEXT NOT NULL,
  reactions INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO stories (category, text, reactions, comments_count, created_at)
SELECT * FROM (VALUES
('Работа', 'Уже полгода работаю на износ, но чувствую, что меня не замечают. Начальник хвалит других, хотя я делаю не меньше. Не знаю, продолжать или уходить.', 47, 12, NOW() - INTERVAL '2 hours'),
('Отношения', 'Расстались с парнем после трёх лет вместе. Он сказал, что ему нужно время для себя. Я не понимаю, что я сделала не так. Пустота внутри огромная.', 83, 21, NOW() - INTERVAL '5 hours'),
('Здоровье', 'Тревога не отпускает уже несколько месяцев. Просыпаюсь ночью с ощущением, что что-то идёт не так, хотя всё вроде нормально. Устала бояться без причины.', 61, 18, NOW() - INTERVAL '1 day'),
('Семья', 'Мама постоянно сравнивает меня с братом. Он успешный, у него семья и своё дело. А я просто не такой. Чувствую себя лишним в собственной семье.', 55, 9, NOW() - INTERVAL '1 day'),
('Одиночество', 'Переехал в новый город год назад. До сих пор нет друзей. Хожу на работу, возвращаюсь домой. Иногда кажется, что если я исчезну — никто не заметит.', 102, 34, NOW() - INTERVAL '2 days'),
('Деньги', 'Взял кредит на лечение мамы. Теперь отдаю почти всю зарплату. Экономлю на еде. Стыдно говорить об этом вслух, но держать в себе уже невозможно.', 78, 27, NOW() - INTERVAL '3 days')
) AS v(category, text, reactions, comments_count, created_at)
WHERE NOT EXISTS (SELECT 1 FROM stories);

CREATE TABLE IF NOT EXISTS story_comments (
  id SERIAL PRIMARY KEY,
  story_id INT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_story_comments_story_id ON story_comments(story_id);

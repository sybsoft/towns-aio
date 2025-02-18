# Towns

- Заполняем data/emails.txt
- Заполняем data/proxies.txt

### Установка зависимостей

В корневой папке вызываем команду `npm i --force`
В папке mail вызываем команды:

- `python -m venv venv`
- `source venv/bin/activate`
- `pip install -r requirements.txt`

### Запуск

Вызываем команду: `node index.js`
В папке mail: `uvicorn main:app --reload  --port 8197`

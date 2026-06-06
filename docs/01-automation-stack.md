# Док 1. Стек автоматизации Claude Code: `/loop`, Routines, Auto Mode

> Выверено по официальной документации `code.claude.com/docs` (июнь 2026).
> Источник-вдохновитель: тред «How to run Claude on autopilot in 14 steps» (@0xCodez).
> Ниже — только то, что подтверждается докой; мифы и преувеличения вынесены в конец.

## Три уровня автоматизации

| | Cloud (Routines) | Desktop tasks | `/loop` (в сессии) |
| :-- | :-- | :-- | :-- |
| Где исполняется | Облако Anthropic | Твоя машина | Твоя машина |
| Нужна включённая машина | Нет | Да | Да |
| Нужна открытая сессия | Нет | Нет | Да |
| Переживает рестарт | Да | Да | Восстанавливается через `--resume`, если не истёк |
| Доступ к локальным файлам | Нет (свежий clone) | Да | Да |
| Подтверждения прав | Нет (автономно) | Настраиваются | Наследует из сессии |
| Минимальный интервал | **1 час** | 1 минута | 1 минута |

Логика «промоушена»: обкатать промпт в `/loop` → перенести в Desktop для ежедневного → поднять в Routine, когда нужна независимость от железа.

## Tier 1 — `/loop` и cron (в сессии)

- Требуется **Claude Code v2.1.72+**.
- `/loop <interval> <prompt>` — пример: `/loop 5m check the deploy`.
  - Только промпт без интервала → Claude сам выбирает паузу **1 мин–1 ч** (динамический режим, может использовать **Monitor tool** — стриминг вместо поллинга).
  - Совсем без аргументов → встроенный maintenance-промпт (или твой `loop.md`).
  - Можно вкладывать команды: `/loop 20m /review-pr 1234`.
- Единицы: `s`/`m`/`h`/`d`. Секунды округляются вверх до минуты. «Грязные» интервалы (`7m`, `90m`) округляются до ближайшего валидного шага.
- Под капотом инструменты: `CronCreate`, `CronList`, `CronDelete`. ID задачи — **8 символов**.
- **Жёсткие лимиты:**
  - **7-дневный авто-expire** рекуррентных задач (сработает последний раз и удалится).
  - **Макс. 50 задач на сессию.**
  - **Нет catch-up**: если задача наступила, пока Claude занят, она сработает один раз после простоя, а не N раз.
  - **Сессионная привязка.** `--resume`/`--continue` восстанавливают неистёкшие задачи (рекуррентные < 7 дней, one-shot с ненаступившим временем). Background Bash/monitor не восстанавливаются.
- **Jitter (важно для точного времени):** рекуррентные задачи срабатывают с детерминированным сдвигом до **+30 мин** (или до половины интервала для частых); one-shot на `:00`/`:30` — до 90 сек раньше. Хочешь точно — бери минуту не `:00`/`:30` (например, `3 9 * * *`).
- Всё — в **локальной таймзоне**.
- Кастомный дефолт-промпт: `.claude/loop.md` (проект) или `~/.claude/loop.md` (личный), до 25 000 байт.
- Остановить ожидающий `/loop` — `Esc`.
- Отключить полностью: `CLAUDE_CODE_DISABLE_CRON=1`.

### Cron-синтаксис

5 полей: `minute hour day-of-month month day-of-week`.
Поддержка: `*`, одиночные значения, шаги `*/15`, диапазоны `1-5`, списки `1,15,30`.
День недели: `0` или `7` = воскресенье … `6` = суббота.
**Не поддерживается:** `L`, `W`, `?`, алиасы `MON`/`JAN`.
Когда заданы и день-месяца, и день-недели — матч по **любому** из них (vixie-cron).

Полезные паттерны:
```
*/5 9-17 * * 1-5   # каждые 5 мин в рабочие часы по будням
0 7 * * 1-5        # будни в 7:00
0 9 1 * *          # 1-е число месяца в 9:00
*/15 * * * *       # каждые 15 минут
30 2 * * *         # ночью в 2:30
0 */6 * * *        # каждые 6 часов
```

## Tier 2 — Desktop scheduled tasks

- Только **macOS / Windows**. Каждый запуск — свежая сессия, без общего контекста.
- Переживает рестарт, но **нужна бодрствующая машина**; при пробуждении делает один catch-up за последнее пропущенное время.
- Права/папка/модель настраиваются на каждую задачу.

## Tier 3 — Cloud Routines

- Research preview. Доступно на **Pro/Max/Team/Enterprise** с включённым Claude Code on the web.
- Routine = `prompt + репозиторий(и) + connectors + environment + триггер(ы)`. Исполняется в облаке.
- Создание: `claude.ai/code/routines` или `/schedule` в CLI. **CLI создаёт только schedule-триггеры**; API/GitHub добавляются на вебе.
- **Минимальный интервал — 1 час** (чаще — отклоняется). Запуск может задержаться на пару минут (stagger).
- **По умолчанию пуш только в ветки `claude/`** — защита от случайной записи в main. Снимается опцией «Allow unrestricted branch pushes» по репозиторию.
- **Environment**: по умолчанию **Trusted** (реестры пакетов разрешены, произвольный outbound — 403). Для своих сервисов — Custom allowed domains.
- **Зелёный статус ≠ успех задачи** — значит лишь, что сессия стартовала без инфраструктурной ошибки. Читай транскрипт.

### Триггеры

- **Schedule** — пресеты hourly/daily/weekdays/weekly или one-off. Custom cron — через `/schedule update`.
- **API** — эндпоинт `/fire`, bearer-токен **показывается один раз**. Тело принимает поле `text` как **сырой текст** (JSON не парсится — придёт литеральной строкой). Beta-заголовок `experimental-cc-routine-2026-04-01` (совместимость двух последних версий заголовка).
  ```bash
  curl -X POST https://api.anthropic.com/v1/claude_code/routines/<ID>/fire \
    -H "Authorization: Bearer <TOKEN>" \
    -H "anthropic-beta: experimental-cc-routine-2026-04-01" \
    -H "anthropic-version: 2023-06-01" \
    -H "Content-Type: application/json" \
    -d '{"text": "Sentry alert ... stack trace"}'
  ```
- **GitHub** — нужна установленная **Claude GitHub App** (`/web-setup` даёт только доступ к clone). Каждое событие = отдельная сессия.
  - ⚠️ **Поддерживаются только две категории событий: Pull request и Release.** (Push, issue, check run, workflow run, discussion, merge queue — НЕ поддерживаются, вопреки исходной статье.)
  - Фильтры PR: author, title, body, base/head branch, labels, is draft, is merged. Операторы: equals/contains/starts with/is one of/is not one of/matches regex.

## Auto Mode

- Альтернатива `--dangerously-skip-permissions`. Перед каждым tool-call отдельная модель-классификатор (**Sonnet 4.6**) оценивает риск и решает allow/block.
- Research preview. Доступно: **Max/Team/Enterprise/API**. **Недоступно: Pro, Bedrock, Vertex, Foundry.**
- Входит в цикл `Shift+Tab`.

## Безопасные права для unattended (корректный `settings.json`)

> ❗️Ключ называется **`allow`**, а не `autoApprove` (ошибка исходной статьи). Ключа `auditLog` в `permissions` нет. Файла `.claudeignore` у Claude Code тоже нет — защищай секреты через `deny`.

```json
{
  "permissions": {
    "allow": [
      "Read(*)",
      "Grep(*)",
      "Bash(npm test)",
      "Bash(git status)",
      "Bash(git diff*)",
      "Bash(git log*)"
    ],
    "deny": [
      "Bash(rm -rf*)",
      "Bash(git push*)",
      "Bash(*--force*)",
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(./secrets/**)"
    ]
  }
}
```

Правило «что авто-аппрувить»: дёшево откатить → можно; дорого (force-push в main) → никогда.

## ❌ Мифы и ошибки исходной статьи

- `"autoApprove"` в `settings.json` — **неверно**, нужен `allow`.
- `.claudeignore` — **не существует** в Claude Code.
- `"auditLog": true` — **не документированный** ключ permissions.
- «GitHub-триггеры: push, issue, check run, workflow run, discussion, merge queue» — **завышено**; реально только Pull request и Release.
- «JSON body становится контекстом» — поле `text`, **не парсится**.
- «Закрыл терминал → всё пропало» — преувеличение: неистёкшие задачи восстанавливаются через `--resume`.
- Цифры «93% approve», «Max = 5×», точные даты релизов — маркетинг/непроверяемо.

## Источники
- Scheduled tasks (`/loop`, cron): https://code.claude.com/docs/en/scheduled-tasks
- Routines: https://code.claude.com/docs/en/routines
- Claude Code on the web: https://code.claude.com/docs/en/claude-code-on-the-web
- Permissions/settings: https://code.claude.com/docs/en/settings
- Auto mode: https://claude.com/blog/auto-mode

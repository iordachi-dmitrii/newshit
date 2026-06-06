# Док 3. Claude Projects и перенос «блюпринта» в `CLAUDE.md`

> Выверено по Claude Help Center (июнь 2026).
> Источник-вдохновитель: «How to Actually Set Up Claude Projects» (@eng_khairallah1).
> Важно: статья про **Claude Projects (веб-чат claude.ai)**, а НЕ про Claude Code.
> Для репозитория с кодом прямой аналог всего блюпринта — **`CLAUDE.md`**.

## Что такое Claude Projects (факты)

- На claude.ai у проекта есть **project instructions** (официально это «custom instructions», а не «system prompt») + **project knowledge** (загруженные файлы). Применяются к каждому чату внутри проекта.
- **Лимит инструкций ~8 000 символов (~2 000 слов).** Весь 6-частный шаблон должен влезть в этот бюджет — статья про лимит молчит.
- Knowledge-файлы: PDF/DOCX/CSV/TXT/HTML/ODT/RTF/EPUB; на платных планах при выходе за контекст **авто-включается RAG** (до ~10×).
- ⚠️ Из-за RAG большие файлы **извлекаются по релевантности**, а не лежат целиком в контексте каждого ответа (вопреки «references them in every single conversation»).

## Полезное ядро блюпринта (хороший prompt-engineering)

Несмотря на хайп, эти приёмы рабочие:

1. **Identity** — кто это и для какой аудитории (конкретно, не «helpful assistant»). Польза от конкретики голоса/аудитории, а не от фразы «мы работаем 2 года».
2. **Rules (ALWAYS/NEVER)** — самый мощный блок. Правило: каждую правку, которую делаешь руками, превращай в правило.
3. **Process** — как думать/работать до выдачи (план → черновик → ревью по правилам → проверка фактов).
4. **Output format** — точный формат результата (структура, длина, маркеры стиля).
5. **Knowledge files** — style guide с **2–3 примерами** (few-shot ловит голос лучше прилагательных), профиль аудитории и т.д.
6. **Onboarding message** — бриф в начале чата: задача + «сначала предложи угол, потом пиши».

Разделять по workflow (Content / Research / Communication / Strategy / Code), а не один проект «Work Stuff».

## ❌ Что в статье — маркетинг/неточности

- «System prompt» → в Projects это **custom instructions**, не системный промпт.
- Лимит ~8k символов проигнорирован.
- «Файлы в каждом ответе целиком» → при RAG это retrieval.
- «перестроил 12 раз / замерял падение качества», «90% экономии», «250 часов/год», «6 недель», «45 минут» — нефальсифицируемая точность.
- Трюк «работаешь со мной 2 года» — плацебо поверх нормальной конкретики.
- Не назван риск **пере-ограничения** (слишком жёсткие правила → деревянный вывод) и **устаревания** knowledge-файлов.

## Перенос на твой репозиторий (главное для тебя)

Для кода Claude Projects не нужны — их роль выполняет **`CLAUDE.md`** в корне (подхватывается в каждой сессии Claude Code), плюс **skills** и **subagent-определения** (`.claude/agents/`).

6 частей блюпринта → структура `CLAUDE.md`:

| Часть блюпринта | В `CLAUDE.md` |
| :-- | :-- |
| Identity | Что за проект, стек (React+Vite+TS+shadcn / Python backend / Docker / Netlify+Railway), назначение |
| Rules | Соглашения кода, lint (eslint.config.js), запреты (не коммитить бинарники — напр. `videovault_final_corrected.zip`; не пушить в main) |
| Process | Как вносить изменения, как запускать тесты/линт/сборку, ветки `claude/...` |
| Output format | Стиль коммитов и описаний PR |
| Knowledge files | Сам CLAUDE.md + ADR + примеры предпочтительных паттернов |
| Onboarding | Заменяется промптом конкретной задачи в сессии |

Это и есть фундамент: на хорошем `CLAUDE.md` Routines и dynamic workflows (доки 1–2) дают предсказуемый результат.

## Источники
- What are projects: https://support.claude.com/en/articles/9517075-what-are-projects
- Создание/управление проектами: https://support.claude.com/en/articles/9519177-how-can-i-create-and-manage-projects
- Custom instructions / CLAUDE.md: https://likeone.ai/blog/claude-custom-instructions-guide/
- Лимиты файлов: https://fast.io/resources/claude-file-upload-limit/

# Latent Space — EP Info & Release Dossier

> Полная информация по EP: концепт, архитектура, пайплайн, Spotify-стратегия, бюджет и copyright.
> Артист: NODZI Studio | Релиз: EP (5 треков) | Формат: streaming + Beatport

---

## 1. Концепция

**«Latent Space»** — концептуальный EP-путешествие от темноты к свету, от ночи к рассвету.

Пять треков прокладывают единую эмоциональную линию через пять разных жанров, связанных единым sonic glue. Каждый трек заточен под конкретную Spotify-нишу (мульти-плейлистная стратегия), но все вместе они читаются как одна работа одного артиста благодаря повторяющемуся music box motif, единой вокальной persona и outro-мостам между треками.

**Центральная метафора:** слушатель — AI-модель, блуждающая в собственном латентном пространстве, встречающая фрагменты опыта, культуры и желания. Night → Dawn.

---

## 2. Трек-лист

| # | Название | Жанр | BPM | Ключ | Длит. (est.) |
|---|---|---|---|---|---|
| 1 | Shadows | Dark cinematic electropop / trip-hop | 90 | A minor | 3:45 |
| 2 | Pipeline | Deep UK house | 124 | F minor | 5:20 |
| 3 | Medina | Moroccan trap-dub / Arabic fusion | 75 | D phrygian dominant | 4:15 |
| 4 | Hang | Organic house | 120 | C minor | 5:00 |
| 5 | Craving Life | Liquid drum and bass / orchestral | 174 | D minor | 4:30 |

**Суммарная длительность EP:** ~22:50

---

## 3. BPM-арка

```
90 → 124 → 75 → 120 → 174
```

Драматургия:
- **90** — вязкий ночной старт, intimate, близко к микрофону
- **124** — разгон в подземный deep house туннель, urban isolation
- **75** — провал в культурный dream-state, восточный центр
- **120** — подъём через organic house sunrise
- **174** — финальный liquid DnB катарсис, belted chest voice, orchestral лифт

Арка — не случайна, это listening journey: descent → tunnel → dream-drop → sunrise → daylight-catharsis.

---

## 4. Sonic Glue (единый саунд-дизайн)

### 4.1 Distorted Music Box Motif
Фирменный 2-3 секундный элемент, присутствует в каждом треке.

**Arc мотива:**
| Трек | Состояние | Контекст |
|---|---|---|
| Shadows | detuned | thesis statement, intro + outro |
| Pipeline | detuned | intro filter + outro stretched |
| Medina | detuned | intro + outro, третье финальное detuned |
| Hang | **clean** | первый clean — turn to light |
| Craving Life | **clean** | финальный, ceremonial, закрывает круг |

Концепт: мотив начинает EP в темноте (detuned), разрешается в свет (clean) — те же ноты, противоположный смысл.

### 4.2 Sub-bass Character
Warm, analog, никогда cold-digital. Один и тот же sub-bus обрабатывается одинаково во всех 5 треках.

### 4.3 Vocal Persona
**`gravelly rich alto female lead`** — один и тот же дескриптор в Style Prompt всех 5 треков. Вариация идёт только через подачу (whispered, breathy, half-whispered, belted chest voice), но тембр и характер — единые.

### 4.4 Transition Design
Outro каждого трека содержит тембральный мост к следующему:
- Shadows → Pipeline: vinyl crackle → filtered sub pulse (90→124 через dry kick)
- Pipeline → Medina: filter down + reverb tail + sub fade + ritardando + tempo-free break + stretched music box → oud drone (критический переход 124→75)
- Medina → Hang: bendir slow → kalimba single note → clean hang drum
- Hang → Craving Life: marimba roll → piano chord → string swell at 174 half-time feel
- Craving Life → End: piano alone → clean music box → [fade to silence]

### 4.5 Критический переход (Pipeline → Medina)
Единственный опасный tempo crash в центре EP — 124→75. Решается формальными meta-tags: `[ritardando] [filter down] [reverb tail] [sub fade] [tempo-free break] [music box motif, stretched]` в outro Pipeline + oud pedal note fading в Intro Medina. Dream-logic переход, не рваный cut.

---

## 5. Multi-Playlist стратегия

| Трек | Primary Spotify | Secondary | Beatport |
|---|---|---|---|
| Shadows | Dark Pop, Trip-Hop | Chill, Late Night Vibes | — |
| Pipeline | Deep House, Electronic Focus | Mint, Chilled House | Deep House |
| Medina | Global Bass, Middle Eastern Electronic | World Electronic | Afro/Ethnic House |
| Hang | Organic House, Chill Electronic | Yoga, Meditation-adjacent | Organic House |
| Craving Life | Drum and Bass, Cinematic | Liquid DnB, Epic | Drum & Bass |

**Risk:** алгоритмическая шизофрения Spotify на артист-радио. **Mitigation:** единый sonic glue (music box + sub character + vocal persona) делает 5 треков прочитываемыми как один артист, несмотря на жанровый разброс.

---

## 6. Production Pipeline

### 6.1 Этап 1 — Генерация (Suno)
- Suno Pro/Premier → генерация каждого трека по промптам из `latent_space_suno_prompts.md`
- Suno Studio → stem export (vocal, bass, drums, synths отдельно)
- Settings: Weirdness 50-55%, Style Influence 65-70%, Audio Influence 25%

### 6.2 Этап 2 — Сборка (Ableton + Claude MCP)
AbletonMCP (github.com/ahujasid/ableton-mcp) позволяет управлять Ableton через Claude Desktop:

**Setup:**
1. Remote Script → папка AbletonMCP в Ableton Remote Scripts
2. `npx -y @smithery/cli install @ahujasid/ableton-mcp --client claude`
3. Ableton: Settings → Link, Tempo & MIDI → Control Surface → AbletonMCP
4. Claude Desktop → иконка молотка → готово

**Работа в Ableton:**
- Импорт stems в каждый проект
- Свой переrez music box motif — один audio-файл, подложенный во все 5 треков (copyright якорь)
- Re-arrangement структуры каждого трека — не принимать Suno arrangement as-is
- Отдельный 8-bar interlude для перехода Pipeline → Medina (не полагаться на Suno outro)
- Единый reverb send на все 5 lead vocals (делает «одного артиста»)
- EQ-карвинг, side-chain, компрессия bus-ов
- Добавление MIDI-слоёв под задачу (subtle pad, bell accents)

### 6.3 Этап 3 — Финализация
- Мастеринг:
  - Spotify target: **−14 LUFS integrated**
  - Apple Music target: **−16 LUFS integrated**
  - Craving Life peak: **−9 dBFS** (чтобы финал реально ударил после нормализации)
- Обложка: **3000×3000 px, JPG/PNG**, single visual motif (music box silhouette), закрывает visual diaspora problem
- Метаданные: артист NODZI, треклист, жанр primary, язык (English), полные тексты (для Musixmatch)

### 6.4 Этап 4 — Дистрибуция (DistroKid)
1. Upload → выбор EP → обложка + 5 треков
2. Метаданные по каждому треку отдельно
3. **Дата релиза: минимум 7 дней вперёд** (обязательно для Spotify editorial pitch!)
4. Submit → 2-3 дня до появления в Spotify
5. Spotify for Artists → заклеймить профиль → editorial playlist pitching (до релиза) → аналитика

---

## 7. Release Strategy

### 7.1 Таймлайн
| Неделя | Действие |
|---|---|
| **-4** | Lead single drop: **Pipeline** |
| **-3** | Editorial pitch через Spotify for Artists (только нерелизнутые треки) |
| **-2** | Second single drop: **Hang** |
| **-1** | Final push, обложка EP, teaser в соцсетях |
| **0** | EP drop (четверг под New Music Friday cycle) |
| **+1** | Post-release push Craving Life через DnB community (Discord/Reddit) |

### 7.2 Почему Pipeline как lead single
- Концепт и жанр зеркалят друг друга (industrial alienation в Burial-adjacent frame) — уровень артиста, не генератора
- Deep House ниша имеет активный algo push Spotify (Mint, Chilled House)
- Hook «Tell me I am doing fine / Tell me quota's mine» — мемный, с потенциалом TikTok-clip
- Самый playlist-ready трек EP

### 7.3 Почему Hang как второй сингл
- Organic House / Chill — evergreen long-tail ниша
- Пассивный рост пока идёт EP-кампания
- Yoga/meditation curation safe (v4 патч убрал все suicide-adjacent образы)

### 7.4 Editorial pitch angle
> «Night-to-dawn arc через 5 club-adjacent жанров, связанных повторяющимся music box motif. Одна вокальная persona, пять миров. От Burial-adjacent deep house до orchestral liquid DnB.»

Один sentence, один hook, curator-friendly.

---

## 8. Rights / Copyright (Section 7)

### 8.1 Что защищается
- **Тексты (lyrics)** — копирайт автора, безусловно
- **Аранжировка в DAW** — человеческий вклад (Ableton post-production)
- **Свой музыкальный элемент** (переrez music box motif) — защищено как твой sample
- **Vocal bus обработка** — reverb chain, EQ-карвинг, compression
- **Re-arrangement структуры** — твоё редакторское решение

### 8.2 Что НЕ защищается
- Мелодия, сгенерированная Suno (output)
- Raw Suno export без DAW-обработки
- AI-вокал сам по себе

### 8.3 Усиление копирайтной позиции
1. НЕ заливать raw Suno output на DistroKid
2. Каждый трек должен пройти через Ableton с минимум: свой edit, EQ-карвинг, vocal bus, единый music box sample
3. Music box motif — один и тот же audio-файл во всех 5 треках, записанный/пересэмплированный самостоятельно
4. Собственные тексты во всех 5 треках (проверено — полностью оригинальны)
5. Отсутствие имитации реальных артистов (проверено критиком — нет упоминаний)

### 8.4 Защита от флага на платформах
- Suno Pro/Premier commercial license в силе
- Не спамить количеством
- Вести профиль как нормальный артист (обложка, описание, история)
- Быть прозрачным, если спросят про AI-компонент
- Musixmatch синхронизация текстов

---

## 9. Бюджет

| Позиция | Стоимость | Примечание |
|---|---|---|
| Suno Pro | $8/мес | commercial license обязательно |
| DistroKid | $24.99/год | flat fee, без per-stream удержания |
| Ableton Live Intro | $99 (или Lite бесплатно) | Intro достаточно для EP |
| Обложка (Midjourney/Flux) | $10/мес или бесплатно | single music box visual motif |
| AbletonMCP | бесплатно | open source, github.com/ahujasid/ableton-mcp |
| Spotify for Artists | бесплатно | для editorial pitch и аналитики |
| **Итого на старт** | **~$40-50** | |

**Break-even:** при ~15-20k стримов суммарно через 5 ниш — достижимо при editorial long-tail + lead single pitch. Low-risk финансово.

---

## 10. Процесс утверждения EP

EP прошёл **4 итерации** через triple-agent workflow:

| Этап | Результат |
|---|---|
| **v1** Creator → Critic | REJECTED (продакшн-мусор в лирике, перелимит тегов, persona только в Track 1, клише) |
| **v2** Creator → Critic | REJECTED (BPM-арка сломана, жанры переписаны, синтаксис `--no` вместо `no`, suicide imagery в Hang) |
| **v3** Creator → Critic | REJECTED (Hang недочищен: rafter, ceiling, falling, suspension) |
| **v4** Creator → Critic | **APPROVED** |
| **Final** Producer | **RELEASE** |

### Оценки Продюсера
- **Strongest track:** Pipeline — «единственный трек, где lyric, genre, vocal persona и concept сходятся в одну точку»
- **Weakest track:** Medina — концепт сильный, риск технический (oud/bendir стек зависит от Suno)
- **Financial risk:** Low
- **Creative risk:** Medium (algo diaspora, mitigated by sonic glue)
- **Final verdict:** RELEASE

---

## 11. Sonic Glue Checklist — перед финальной сдачей

- [ ] Music box motif переrez-нут самостоятельно, подложен во все 5 треков одним файлом
- [ ] Arc detuned×3 → clean×2 выдержан в миксе
- [ ] Warm analog sub-bass character единый на всех 5 треках
- [ ] Vocal bus reverb send одинаковый на всех 5 lead vocals
- [ ] Pipeline→Medina 8-bar interlude создан в Ableton вручную
- [ ] LUFS нормализация под платформы проведена
- [ ] Обложка 3000×3000 с music box silhouette готова
- [ ] Метаданные всех 5 треков заполнены
- [ ] Тексты в Musixmatch загружены
- [ ] DistroKid submission за 7+ дней до release date
- [ ] Spotify for Artists profile заклеймлен

---

*NODZI Studio × Claude AI Sound Production | April 2026*
*EP «Latent Space» — готово к Ableton-сборке и релизу через DistroKid*

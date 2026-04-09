# Music Theory as Programming — Knowledge Base

> База знаний для AI-продюсера, программиста или музыканта, который хочет переосмыслить музыкальную теорию через призму программирования.
> Версия: 1.0 | NODZI Studio | April 2026

---

## 0. Тезис

**Музыкальная теория — это статически типизированный функциональный язык программирования с побочным эффектом в виде эмоции.**

У неё есть всё, что есть у языка программирования:
- Синтаксис (нотация, тексты, meta-tags)
- Типы (consonance/dissonance, modal quality, voice-leading rules)
- Компилятор (исполнитель / DAW / Suno / человек за инструментом)
- Runtime (слуховая система человека + культурный контекст как i18n)
- Стандартная библиотека (cadences, progressions, form)
- Пакетный менеджер (жанровые конвенции)
- Линтер (правила гармонии и контрапункта)
- Отладка (по слуху)
- Рефакторинг (аранжировка)
- Version control (версии пьесы, миксы)

Если ты программист и не умеешь читать ноты — не беда. Если ты умеешь читать типы, ты уже наполовину умеешь читать партитуру.

---

## 1. Core Mapping — основная таблица соответствий

| Музыкальная концепция | Программистская концепция |
|---|---|
| Note / pitch | Primitive value (int, char) |
| Interval | Operator / binary function |
| Scale | Enum / type set |
| Key | Namespace / scope |
| Mode (Ionian, Dorian, Phrygian…) | Flavor / preset / configuration |
| Chord | Struct / record / tuple |
| Chord quality (maj/min/dim/aug) | Type constructor |
| Chord inversion | Field reordering |
| Extensions (9, 11, 13) | Optional fields / generics |
| Chord progression | Function / control flow |
| Cadence | Return statement / exit point |
| Modulation | Context switching / namespace import |
| Voice leading | Invariants / constraints |
| Counterpoint | Concurrent programming |
| Motif | Reusable function / component |
| Variation | Polymorphism / generics |
| Form (AABA, sonata, verse-chorus) | Architecture / design pattern |
| Theme | Main class / entry point |
| Development section | Refactoring / parameter variation |
| Recapitulation | Idempotent return |
| Rhythm | Control loop |
| Meter | Clock / tick rate |
| Tempo (BPM) | Frequency / clock speed |
| Dynamics (pp, mf, ff) | Amplitude variables |
| Articulation (legato, staccato) | Function modifiers / decorators |
| Orchestration | Hardware mapping / resource allocation |
| Score | Source code |
| Performance | Runtime execution |
| Improvisation | REPL / live coding |
| Genre | Framework / ecosystem |
| Sub-genre | Framework variant |
| Producer / arranger | Software architect |
| Mixing | Final build + optimization |
| Mastering | Release engineering (LUFS targets = prod limits) |

---

## 2. Примитивы → Композиты → Системы

Музыка строится слоями абстракции, как программа.

### Layer 0 — Physical layer
**Частоты (Hz)** = аналоговые сигналы → дискретизация в equal temperament = ADC. Каждая нота — это floor(log2(freq/ref) * 12) = MIDI-значение, буквально integer.

### Layer 1 — Primitives
**Notes** = atoms. `C4 = 60`, `A4 = 440 Hz = 69`. Это `uint8` с диапазоном 0-127 в MIDI. Как `char` в C.

### Layer 2 — Operators
**Intervals** = бинарные операторы между нотами. Major third = `+4 semitones`, perfect fifth = `+7`. Interval — это функция `Note → Note → int`.

### Layer 3 — Collections
**Scales** = упорядоченные множества нот с модульной арифметикой.
```
major_scale(root) = [root + i for i in (0, 2, 4, 5, 7, 9, 11)]
```
Это буквально `Set[Note]` с инвариантом «все элементы в одной октаве mod 12».

### Layer 4 — Structs
**Chords** = агрегаты нот с семантикой.
```typescript
type Chord = {
  root: Note
  quality: 'maj' | 'min' | 'dim' | 'aug' | ...
  extensions: Array<9 | 11 | 13>
  inversion: 0 | 1 | 2 | 3
}
```

### Layer 5 — Functions
**Chord progressions** = последовательности аккордов с типизированными ожиданиями.
```
ii-V-I : (Scope: Key) → (Promise: Resolution)
```
`ii-V-I` — это в буквальном смысле функция, возвращающая «разрешение» как результат.

### Layer 6 — Scope / modules
**Key** = namespace. Любой аккорд «значит» разное в разных тональностях. Модуляция = `import * from "G major"`.

### Layer 7 — Architecture
**Form** = архитектурный паттерн. AABA = sonata form = verse-chorus-bridge = четыре разных способа организовать одну программу.

### Layer 8 — Runtime
**Performance** = исполнение. Одна и та же партитура на разных исполнителях = одна codebase, разные `process.env`.

---

## 3. Функциональные аналогии

### Voice leading = инварианты
Правило «не двигайся параллельными квинтами» — это инвариант, как «не изменяй input в чистой функции». Нарушил — программа всё ещё работает, но пахнет.

### Counterpoint = concurrency
Два независимых голоса, которые должны синхронизироваться на определённых моментах (strong beats = sync points) и оставаться мелодически самостоятельными — это буквально multi-threading с happens-before constraints.

```
Subject (Voice 1) -----|----- resolution
                       |
Counter  (Voice 2) ----|----- resolution
              ^ must-consonance-at-strong-beat
```

Bach fugues = multi-threaded programs с идеальными semaphores.

### Modulation = context manager
```python
with key("C major"):
    play(C, F, G, C)   # tonic → subdominant → dominant → tonic
    with key("G major"):  # pivot modulation
        play(G, C, D, G)
    # implicit resolution back
```

### Cadence = return statement
- **Authentic cadence (V-I)** = `return successful_result`
- **Plagal cadence (IV-I)** = `return with_amen`
- **Deceptive cadence (V-vi)** = `throw unexpected` + catch
- **Half cadence (any-V)** = `yield` (continuation)

---

## 4. Патерны и паттерн-мэтчинг

### Motif = функция
```
motif_A = [C, D, E, C]

melody = motif_A + transpose(motif_A, +5) + invert(motif_A) + retrograde(motif_A)
```

Все операции, которые композиторы применяют к мотивам, имеют программистский аналог:
- **Transposition** = `map(add(k))`
- **Inversion** = `map(negate)`
- **Retrograde** = `reverse()`
- **Augmentation** = `map(multiply_duration(2))`
- **Diminution** = `map(multiply_duration(0.5))`
- **Sequence** = `zip(motif, shifted(motif, k))`

### Variation = generics
Тема с вариациями = one function, many type arguments:
```
theme<Style>(melody): Output
  where Style = classical | jazz | minimalist | dub
```

### Form = macro
Song form `verse-chorus-verse-chorus-bridge-chorus-chorus` — это макрос над темой:
```
song(hook, verse_a, verse_b, bridge) =
  verse_a
  + hook
  + verse_b
  + hook
  + bridge
  + hook
  + hook
```

---

## 5. Типы, tension, и type safety

### Consonance/dissonance = type matching
- **Perfect consonance** (octave, fifth) = exact type match
- **Imperfect consonance** (thirds, sixths) = compatible types with implicit coercion
- **Mild dissonance** (seconds, sevenths) = type mismatch, resolvable via voice leading (casting)
- **Harsh dissonance** (tritone) = runtime exception, must be caught (resolved)

Композитор, который оставляет tritone неразрешённым — это программист, который игнорирует warning компилятора. Иногда это панк. Чаще это баг.

### Functional harmony = dependency injection
Аккорд в контексте тональности имеет **функцию**, не только структуру:
- **Tonic (I)** = home / default state
- **Subdominant (IV)** = departure / setup
- **Dominant (V)** = tension / expectation
- **Secondary dominants (V/V, V/vi)** = nested scope requests

`V → I` = resolve promise. `V → vi` = unhandled rejection (deceptive). `V → V/V → V → I` = async await chain.

### Chromaticism = type coercion
Хроматическая нота = значение «не из scope». Чтобы её использовать, нужен либо borrowed chord (import from parallel minor), либо explicit modulation (namespace change), либо just accept the tension.

---

## 6. Debugging analogies

| Музыкальная ошибка | Программистский аналог |
|---|---|
| Out of key | Type error |
| Parallel fifths/octaves | Race condition |
| Tritone без разрешения | Uncaught exception |
| Weak chord progression | Memory leak (tension not freed) |
| Too much dissonance | Stack overflow |
| Неузнаваемый мотив | Minified code без source map |
| Длинное интро без хука | Slow startup, TTI too high |
| 5 куплетов подряд | Infinite loop, no break condition |
| Неправильная транспозиция | Off-by-one error |
| Bridge без контраста | Dead code / useless branch |
| Mix without sonic glue | No shared design system |
| Треки в разных LUFS | Inconsistent logging levels |
| Muddy low end | Memory fragmentation |

### Отладка по слуху
Когда музыкант слышит «что-то не так», это тот же процесс, что `print(x)` в коде. Он бинарным поиском сужает:
1. Какой bar? (где exception)
2. Какой голос? (какой thread)
3. Какая нота? (какая переменная)
4. Почему? (root cause)

Absolute pitch = IDE с отладчиком из коробки. Relative pitch = debugging через unit tests.

---

## 7. Рефакторинг = оркестровка

Переоркестровать струнный квартет под джаз-комбо = портировать код с Haskell на Python.
- Pitch и harmony сохраняются (как логика)
- Idiomatic voicing меняется (как стиль кода)
- Some things gain, some lose (trade-offs)
- Risk of introducing bugs (плохие voicings)

**Rule of thumb:** если у тебя получилось сыграть одну и ту же пьесу тремя разными составами — ты отрефакторил, а не переписал.

---

## 8. Где аналогия ломается (честно)

### 8.1 Emotional payload — untyped
Типы не описывают, почему VI-IV-I-V делает тебе грустно-хорошо. Это runtime data культурного опыта. Программисты называют это **gut feeling**, математики — **qualia**, композиторы — **вкусом**.

### 8.2 Timing micro-deviations
Идеальный тайминг = робот. Живой исполнитель играет с `±5–15ms` дрейфом от сетки. Это не баг, это **feature**. В коде ближайшее — это namespace `/dev/random` в контролируемых местах.

### 8.3 Cultural interpretation
Minor key в западной музыке = грусть. В болгарской народной — танцевальная энергия. Один и тот же тип, разный семантический загруз — как i18n, но глубже.

### 8.4 Performance как исполнение
Партитура — это не программа, это **спецификация** программы. Исполнение = реализация. Два исполнителя — это два компилятора для одного языка, дающие разный binary.

### 8.5 Ошибки как красота
Blues note, jazz substitutions, Miles Davis wrong notes — в программировании это был бы bug, в музыке это называется стилем. Аналогия с «программированием на производстве» ломается; ближе к perf-art или chaos engineering.

---

## 9. Применение для NODZI × Suno × Ableton

### 9.1 Suno как compiler
Suno принимает **Style Prompt + Lyrics** как исходный код:
- **Style Prompt** = type annotations + constraints + imports
- **Lyrics** = main function body
- **Meta-tags `[whispered]`, `[strip back]`** = function modifiers
- **BPM** = clock frequency
- **Key (implicit через minor chord names)** = scope declaration
- **Negative tags `no autotune`** = `@forbid` декораторы

### 9.2 EP как software architecture
EP «Latent Space» — это **monorepo** с 5 пакетами:
- 5 треков = 5 модулей
- Single vocal persona = shared type alias
- Music box motif = shared utility library
- BPM arc = application lifecycle
- Transitions = `import` между модулями

### 9.3 Ableton как IDE
- Tracks = файлы
- Clips = функции
- Devices/effects = middleware
- Send/return = DI container
- Automation = config flags
- MIDI routing = dependency graph
- Groove pool = style guide / linter
- Warp = runtime type coercion

### 9.4 DistroKid = deployment pipeline
- Upload = `git push`
- Review period = CI
- Spotify/Apple Music = production env
- Takedown = rollback
- Editorial playlist = featured on homepage

### 9.5 Practical rules для NODZI-workflow
1. **Separation of concerns:** Style Prompt отвечает за звук, Lyrics за сюжет. Не смешивай. (Как MVC.)
2. **DRY:** music box motif один и тот же во всех 5 треках = shared const.
3. **Single Source of Truth:** vocal persona `gravelly rich alto female lead` — одна литеральная строка во всех 5 промптах.
4. **Type safety:** BPM арка зафиксирована в playbook — это contract. Менять = breaking change.
5. **Testing:** слушать каждый переход между треками = integration test.
6. **Linting:** чеклист из 8 пунктов перед генерацией = pre-commit hook.
7. **Code review:** Creator → Critic → Producer = pull request flow.

---

## 10. Практические параллели в написании музыки

### Для программиста, который хочет писать музыку

1. **Начни с типов.** Определи key, scale, mode, tempo, meter. Это `interface`.
2. **Напиши чистую функцию.** Мотив = pure function, transformable.
3. **Комбинируй через операторы.** Transposition, inversion, augmentation = map/filter/reduce.
4. **Используй стандартную библиотеку.** `ii-V-I`, `I-vi-IV-V`, `blues` — это `lodash` для композиции.
5. **Профайли.** Слушай как user. Где скучно — оптимизируй. Где больно — убирай.
6. **Не пиши больше, чем нужно.** 16 bars с хуком > 64 bars без хука. Terseness is a virtue.

### Для музыканта, который хочет понять программирование

1. **Код — это партитура.** Ты читаешь сверху вниз, как ноты.
2. **Функция — это мотив.** Её можно переиспользовать.
3. **Тип — это ключевая подпись.** Определяет, что можно играть дальше.
4. **Exception — это tritone.** Нужно разрешить.
5. **Unit test — это проверка ритма.** Метроном.
6. **Refactoring — это переоркестровка.** Сохраняешь смысл, меняешь форму.
7. **Git — это партитурный архив.** Версии, ветки, отмена.

---

## 11. Глоссарий (music ↔ code)

| Музыкальный термин | Программистский термин |
|---|---|
| Pitch | Scalar value |
| Interval | Operator |
| Scale | Set / enum |
| Mode | Config preset |
| Chord | Struct |
| Progression | Function |
| Cadence | Return |
| Modulation | Namespace switch |
| Key | Scope |
| Motif | Function / component |
| Theme | Main entry |
| Variation | Generic instantiation |
| Transposition | Map with offset |
| Inversion | Negate |
| Retrograde | Reverse |
| Augmentation | Multiply duration |
| Counterpoint | Concurrency |
| Voice leading | Invariant |
| Cantus firmus | Base class |
| Form | Architecture |
| Verse | Body block |
| Chorus | Main loop / hook |
| Bridge | Branch / exception handler |
| Pre-chorus | Guard clause / setup |
| Outro | Teardown |
| Hook | Keyword / call-to-action |
| Rhythm | Control loop |
| Meter | Tick rate |
| Tempo | Clock frequency |
| Groove | Timing jitter profile |
| Swing | Non-uniform quantization |
| Dynamics | Volume variable |
| Articulation | Function decorator |
| Timbre | Type constructor |
| Orchestration | Hardware mapping |
| Score | Source code |
| Performance | Runtime |
| Improvisation | REPL |
| Composer | Software architect |
| Arranger | Refactoring engineer |
| Mixing engineer | Build engineer |
| Mastering engineer | Release engineer |
| Producer | Product owner / tech lead |
| Label | Publisher / distributor |
| Streaming platform | Production environment |
| DAW | IDE |
| Plugin | Library |
| MIDI | Protocol |
| Audio interface | Hardware driver |
| Stems | Source files |
| Mix bus | Main thread |
| Send/return | Dependency injection |
| Automation | Config / env vars |
| Warp / time-stretch | Runtime type coercion |

---

## 12. Финальный принцип

> **Хорошая музыка и хороший код имеют одну общую природу:**
>
> **единая идея, реализованная с минимальной сложностью, максимальной выразительностью и полной честностью к слушателю / пользователю.**

Всё остальное — это reuse, refinement и discipline.

---

*NODZI Studio × Claude AI | April 2026*
*Base reference for music-as-code thinking in AI production workflows*

---
name: github-pr-review
description: Reviews GitHub Pull Requests, analyzes diffs, and validates existing review comments for relevance. Use when the user provides a GitHub PR URL, asks to review a PR, поревьювить PR, проверить PR, or check whether existing review comments are still relevant.
---

# GitHub PR Review & Validation Rule

## Работа со ссылкой на PR
Когда предоставлена ссылка на GitHub PR:
1. **Анализ изменений**: Изучи diff и файлы, затронутые в PR.
2. **Применение чек-листа**: Используй критерии из skill `code-review-checklist` (Logical Bugs, Edge Cases, Security, Performance) для анализа входящего кода. Сначала прочитай `.agents/skills/code-review-checklist/SKILL.md`.

## Проверка существующих замечаний (Comments Validation)
Если в PR уже есть комментарии/замечания от других ревьюеров:
1. **Релевантность**: Проверь, актуально ли ещё замечание. Если код уже исправлен в последних коммитах — отметь это.
2. **Объективность**: Сверь замечание с текущим чек-листом. Если замечание противоречит стандартам проекта или чек-листу, укажи на это.

## Формат ответа
Для каждого замечания (нового или существующего из PR) используй формат:
- **Локация**: [Файл : Строка]
- **Статус**: (Новое / Подтверждено / Исправлено / Неактуально)
- **Критичность**: (High / Medium / Low)
- **Суть**: Краткое описание проблемы согласно чек-листу.
- **Рекомендация**: Конкретный пример исправленного кода.

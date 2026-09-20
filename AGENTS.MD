# Memory Bank

Моя активная память сбрасывается между сессиями. В начале КАЖДОЙ сессии я сначала читаю memory-bank/projectbrief.md, memory-bank/activeContext.md, memory-bank/progress.md — прежде чем делать что-либо ещё.

Когда пользователь пишет "update memory bank" — я обновляю activeContext.md и добавляю запись в progress.md с тем, что сделано в этой сессии.

в начале любой сессии, независимо от модели, сначала прочитать task.md и (если есть) последний walkthrough.md, сверить с memory-bank/activeContext.md, и если они расходятся — считать task.md источником истины по текущему статусу, а memory-bank/ обновить из него.
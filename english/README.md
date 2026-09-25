# Hanabi Study English v0.1

英検準1級・TOEFL・SATを目標にする、ブラウザ内保存の単語帳です。まず毎日開いて答えられることを優先しています。

## 起動

```bash
cd english
npm ci
npm run dev
```

画面に表示されたローカルURLを開き、「今日の150を始める」を押します。最初の診断は任意です。学習履歴はブラウザのIndexedDBに保存されます。別端末とは同期しません。ProgressからJSONバックアップを書き出せます。

現在の語彙DBは**976語**です。学習候補が150語に満たない日は実際の予定語数を表示します。○が安定すると通常の学習枠から外れ、後日確認に戻ります。

## 確認コマンド

```bash
npm run vocab:validate
npm run typecheck
npm test
npm run build
npm run test:browser
```

`test:browser` は `npm run build` 後に実行します。macOSのGoogle Chromeを使い、診断の再開、入力による○判定、IndexedDB保存と再読み込みを確認します。

## Lunaの語彙追加手順

編集する場所は `data/vocabulary/*.jsonl` だけです。1行が1語です。ファイルは帯や追加日ごとに分けて構いません。次の行をテンプレートにしてください。

```json
{"id":"abate-verb","lemma":"abate","pos":"verb","meaningJa":"弱まる","definitionEn":"to become less intense","difficulty":7,"example":"The storm began to abate at dawn.","targets":{"eikenPre1":2,"toefl":3,"sat":3},"category":"academic"}
```

必須フィールドは `id`, `lemma`, `pos`, `meaningJa`, `definitionEn`, `difficulty` (1〜8), `example`, `targets`, `category` です。`targets` の1〜3は対策上の有用度であり、公式出題を意味しません。`example` には解答語を**ちょうど1回**入れます。活用形を使う場合だけ `answerForm` を追加します。許容解答が必要なら `acceptedAnswers` を追加します。`synonyms`, `antonyms`, `confusingWords`, `collocations` は任意です。

`id` は公開後に変更しないでください。単語の表示や意味を修正しても同じIDを維持します。同じlemmaと品詞の重複は監査でエラーになります。別品詞の同じlemmaは警告として確認します。語義と例文の自然さは機械監査だけでは判断できないため、追加分を人手で読み直してください。

追加後は次を実行し、生成された `data/catalog.json` もコミットします。

```bash
npm run vocab:build
npm run vocab:validate
npm test
```

**直接編集しない場所:** `data/catalog.json` は生成物です。`app/`, `components/`, `lib/`, `scripts/`, `package.json` は語彙追加のために変更しません。語彙形式を変える必要がある場合は、その変更を別作業として相談してください。

## 判定

- ×: 英語を見ても意味が分からなかった。Dailyでは答えを見た直後に短い覚え直しができます。この場の正解だけでは△や○に変わりません。
- △: 意味は分かるが、ヒントなしの入力で単語を出せなかった。
- ○: 意味が分かり、短い定義・日本語・穴埋めから解答語を入力できた。

答えを見た後の入力や4択だけで○にはなりません。○の確認は翌日、数日後、1週間後、その後さらに長い間隔で行います。入力に失敗した語は意味の確認結果に応じて△または×に戻ります。診断で出題していない語には状態を付けません。

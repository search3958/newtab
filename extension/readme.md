# Newtab7 拡張機能の使い方

Newtab7 では、IndexedDB に保存されたスクリプトを Newtab を開くたびに実行できます。
スクリプトは名前とエンコード済みの文字列で保存します。管理ダイアログの「拡張機能」欄で一覧を確認し、削除できます。

## 1. 保存先

| 項目 | 値 |
|---|---|
| データベース名 | `Newtab7Extensions` |
| バージョン | `1` |
| オブジェクトストア名 | `scripts` |
| キー（keyPath） | `id` |

データベースとストアが無い場合は、Newtab が自動で作成します。

## 2. レコードの形式

1件のスクリプトは次のオブジェクトです。

| フィールド | 型 | 必須 | 説明 |
|---|---|---|---|
| `id` | string | はい | 一意なID。削除や保存領域の識別に使います。 |
| `name` | string | はい | 管理画面に表示する名前。空文字は不可。 |
| `encoding` | string | はい | `"base122"` または `"plain"`。 |
| `code` | string | はい | スクリプト本体。`plain` なら JavaScript のソース、`base122` ならエンコード済みの文字列。 |
| `createdAt` | number | 任意 | 作成日時（ミリ秒）。 |
| `updatedAt` | number | 任意 | 更新日時（ミリ秒）。 |

`id`、`name`、`code` が空、または `encoding` が上記以外のレコードは、一覧に表示されず、コンソールに `[Ext] Skipped invalid record` と出力されます。

## 3. スクリプトを保存する

DevTools のコンソールで Newtab を開いた状態で実行します（Newtab のオリジン上で実行してください）。

```javascript
const req = indexedDB.open("Newtab7Extensions", 1);
req.onupgradeneeded = (e) => {
  const db = e.target.result;
  if (!db.objectStoreNames.contains("scripts")) {
    db.createObjectStore("scripts", { keyPath: "id" });
  }
};
req.onsuccess = () => {
  const db = req.result;
  const tx = db.transaction("scripts", "readwrite");
  tx.objectStore("scripts").put({
    id: crypto.randomUUID(),
    name: "テスト拡張",
    encoding: "plain",
    code: 'NT.log("こんにちは");',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
  tx.oncomplete = () => { console.log("保存しました"); db.close(); };
  tx.onerror = () => console.error(tx.error);
};
```

`encoding` を `"base122"` にする場合は、`code` にBase122でエンコードした文字列を入れてください。

## 4. 実行される環境

スクリプトは Newtab のページ内で実行されます。実行時に `NT` という引数が渡されます。

| 項目 | 説明 |
|---|---|
| `NT.id` | 拡張のID |
| `NT.name` | 拡張の名前 |
| `NT.log(...args)` | コンソールに `[Ext:名前]` 付きで出力します。 |
| `NT.storage.get(key)` | 拡張専用の値を読み出します（localStorage を使用）。 |
| `NT.storage.set(key, value)` | 拡張専用の値を保存します。 |
| `NT.storage.remove(key)` | 拡張専用の値を削除します。 |

ストレージのキーは内部で `ext:<id>:<key>` に変換されるため、他の拡張や Newtab 本体の設定と衝突しません。

### 記述例

```javascript
const count = Number(NT.storage.get("count") || 0) + 1;
NT.storage.set("count", count);
NT.log(`Newtab を ${count} 回開きました`);
```

`"use strict"` が先頭に付くため、暗黙のグローバル変数の作成はエラーになります。変数は `const` / `let` で宣言してください。

## 5. 実行のタイミング

- Newtab が開かれたときに、保存されている拡張をすべて順番に実行します。
- 1つの拡張でエラーが出ても、他の拡張の実行は続きます。エラーはコンソールに `[Ext] Failed: 名前` と出力されます。
- 追加・削除は、次に Newtab を開いたときに反映されます。
- 削除時は、その拡張が `localStorage` に保存した値（`ext:<id>:` で始まるキー）も削除されます。

## 6. 削除

管理ダイアログの「拡張機能」欄で「削除」を押し、確認ダイアログで承諾すると、IndexedDB のレコードと拡張用の保存値が削除されます。削除は元に戻せません。

## 7. Base122 の利用

`encoding: "base122"` のレコードを実行するには、Base122 のデコーダを読み込む必要があります。

1. デコーダを提供するスクリプトのURLを、Newtab の JavaScript の `BASE122_LIB_URL` に設定します。
2. そのスクリプトは、読み込み後に `window.base122.decode(文字列)` が呼べる状態にしてください。`decode` は `Uint8Array`（またはそれに変換できる配列）を返す必要があります。
3. 返されたバイト列は UTF-8 として文字列に変換され、JavaScript として実行されます。

デコーダが読み込めない場合、その拡張はスキップされ、コンソールにエラーが出ます。

## 8. 注意事項

- 拡張は Newtab と同じ権限で動きます。信頼できるコードだけを保存してください。
- 拡張のコードは、ブラウザの Content Security Policy で `unsafe-eval` が禁止されていると実行できません。
- 同じ `id` のレコードを保存すると上書きされます。
- 拡張が無限ループや重い処理を含むと、Newtab の表示が遅くなります。
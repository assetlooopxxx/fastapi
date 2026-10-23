# AGENTS.md — Base44 開発環境メモ

## 構成
- リポジトリ本体は FastAPI フレームワークのソース(フレームワーク自体は未使用・編集しない)。
- 実アプリは `app/` 配下: 添付されたレター作成・顧客管理の単一HTML(`app/static/index.html`)を FastAPI で配信するだけの薄いラッパー。

## 起動
- `docker compose -f docker-compose.base44.yml up -d --build`
- プレビュー: `http://localhost:3000/` → レター作成・顧客管理アプリ。
- `app/` 配下のファイルは uvicorn --reload でホットリロードされる(フレームワーク側コードは監視対象外)。

## アプリの仕様(添付アセット由来)
- データはブラウザの localStorage のみ(`letter-app-v2` / `letter-customers-v1`)。サーバー側に保存なし。
- 2タブ: レター作成 / 顧客管理。テンプレート3種(問い合わせ・見積依頼・フォローアップ)、EN/JA/両方プレビュー、コピー・印刷(PDF)。

## 検証
- `curl -s http://localhost:3000/ | head -c 200` で `<!DOCTYPE html>` と日本語タイトルが出れば配信OK。
- フレームワークのテストスイート(pyproject.toml / tests/)は本アプリと無関係なので実行不要。

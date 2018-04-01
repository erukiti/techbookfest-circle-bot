# 技術書典4向けの被サークルチェック数をSlackに垂れ流すbot

## setup

`.env`というファイルにEMAIL, PASSWORD, SLACK_WEBHOOK, SLACK_CHANNELを設定する。

```
EMAIL="hoge@example.com"
PASSWORD="技術書典のパスワード"
SLACK_WEBHOOK="https://hooks.slack.com/services/..............."
SLACK_CHANNEL="#hogehoge"
```

SLACKで予めINCOMING_WEBHOOKを設定しておいてください。
EMAIL, PASSWORDは技術書典のログイン情報です。取り扱いはご注意を。

## run

yarnを使う場合

```sh
$ yarn
$ node src/index.js
```

npmを使う場合

```
$ npm i
$ node src/index.js
```

6時間ごとに、指定したチャンネルに被サークルチェック数を発言します。

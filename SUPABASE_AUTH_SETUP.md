# 🔐 Supabase認証設定ガイド

## 📋 現在の状況

- **メール/パスワード認証**: ✅ 有効
- **Google OAuth認証**: ❌ 設定が必要

## 🛠️ Google OAuth設定手順

### 1. Google Cloud Console設定

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 新しいプロジェクトを作成または既存プロジェクトを選択
3. 「APIs & Services」→「Credentials」に移動
4. 「Create Credentials」→「OAuth 2.0 Client IDs」を選択
5. Application type: **Web application**
6. Name: `SUNO AI Complete Builder`
7. Authorized redirect URIs に以下を追加:
   ```
   https://ncarwqyhpohybnignsxq.supabase.co/auth/v1/callback
   ```

### 2. Supabase設定

1. [Supabase Dashboard](https://supabase.com/dashboard) にアクセス
2. プロジェクト `suno-ai-complete-builder` を選択
3. 左サイドバーから「Authentication」→「Providers」に移動
4. 「Google」プロバイダーを選択
5. 以下の情報を入力:
   - **Client ID**: Google Cloud Consoleで取得したClient ID
   - **Client Secret**: Google Cloud Consoleで取得したClient Secret
6. 「Save」をクリック

### 3. 設定完了後

Google OAuth設定完了後、以下のファイルを更新:

#### config.js
```javascript
auth: {
  enableEmailAuth: true,
  enableGoogleAuth: true,  // ← これをtrueに変更
  enableSignUp: true,
  requireEmailConfirmation: false
}
```

#### login.html
```javascript
// Google Sign In buttonの表示を有効化
document.getElementById('google-signin-btn').style.display = 'block';
```

## 🎯 現在の認証フロー

### メール/パスワード認証
1. ユーザーがメールアドレスとパスワードを入力
2. 既存ユーザー → ログイン
3. 新規ユーザー → 自動アカウント作成
4. メインページにリダイレクト

### エラーハンドリング
- 無効なメールアドレス
- パスワードが短すぎる（6文字未満）
- ネットワークエラー
- Supabase接続エラー

## 📊 プロジェクト情報

- **プロジェクトID**: ncarwqyhpohybnignsxq
- **URL**: https://ncarwqyhpohybnignsxq.supabase.co
- **リージョン**: ap-southeast-1
- **データベース**: PostgreSQL 17.4.1.054

## 🔧 トラブルシューティング

### よくあるエラー

1. **"Unsupported provider"**
   - Google OAuthが有効になっていない
   - 上記設定手順を完了してください

2. **"Invalid login credentials"**
   - メール/パスワードが間違っている
   - 新規ユーザーの場合は自動的にアカウント作成されます

3. **"User already registered"**
   - 既存のメールアドレスでサインアップを試行
   - ログインを試してください

## 📝 次のステップ

1. ✅ メール認証でのテストユーザー作成
2. ⏳ Google OAuth設定（手動で行う必要があります）
3. ⏳ メール確認機能の有効化
4. ⏳ パスワードリセット機能の追加
5. ⏳ プロフィール管理機能の追加

---

**更新日**: 2025年7月14日  
**ステータス**: メール認証のみ利用可能

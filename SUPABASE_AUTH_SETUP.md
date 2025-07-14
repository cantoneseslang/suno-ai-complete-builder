# Supabase認証設定ガイド

## 🚨 緊急対応：メール確認リンクエラー修正

現在、承認メールのリンクが `localhost:3000` に設定されているため、以下のエラーが発生しています：
```
http://localhost:3000/#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired
```

### 即座に修正が必要な設定

1. **Supabase管理画面にアクセス**
   - https://supabase.com/dashboard にログイン
   - プロジェクト `suno-ai-complete-builder` を選択

2. **Authentication設定を開く**
   - 左サイドバーから「Authentication」をクリック
   - 「Settings」タブを選択

3. **Site URL設定を修正**
   ```
   Site URL: https://suno-ai-complete-builder.vercel.app
   ```

4. **Redirect URLs設定を追加**
   ```
   https://suno-ai-complete-builder.vercel.app/**
   https://suno-ai-complete-builder.vercel.app/login.html
   https://suno-ai-complete-builder.vercel.app/auth-callback
   ```

5. **Email Templates設定を確認**
   - 「Email Templates」タブを選択
   - 「Confirm signup」テンプレートを編集
   - リダイレクトURLを以下に変更：
   ```
   https://suno-ai-complete-builder.vercel.app/auth-callback?token_hash={{ .TokenHash }}&type=signup
   ```

## 📧 メール認証システム設定手順

### 1. 基本認証設定

1. **Supabase Dashboard** (https://supabase.com/dashboard) にアクセス
2. プロジェクト `ncarwqyhpohybnignsxq` を選択
3. 左サイドバーから **Authentication** → **Settings** を選択

### 2. Site URL設定

**Site URL** を以下に設定：
```
https://suno-ai-complete-builder.vercel.app
```

### 3. Redirect URLs設定

**Redirect URLs** に以下を追加：
```
https://suno-ai-complete-builder.vercel.app/**
https://suno-ai-complete-builder.vercel.app/login.html
https://suno-ai-complete-builder.vercel.app/auth-callback
https://suno-ai-complete-builder-git-main-kirii.vercel.app/**
```

### 4. Email Auth設定

1. **Email** タブで以下を確認：
   - ✅ Enable email confirmations: **ON**
   - ✅ Enable email change confirmations: **ON** 
   - ✅ Secure email change: **ON**

### 5. Email Templates設定

**Email Templates** タブで以下のテンプレートを設定：

#### Confirm signup テンプレート
```html
<h2>アカウント確認</h2>
<p>Suno AI Complete Builderへようこそ！</p>
<p>以下のリンクをクリックしてアカウントを確認してください：</p>
<p><a href="https://suno-ai-complete-builder.vercel.app/auth-callback?token_hash={{ .TokenHash }}&type=signup">アカウントを確認する</a></p>
```

#### Reset password テンプレート
```html
<h2>パスワードリセット</h2>
<p>パスワードリセットのリクエストを受け付けました。</p>
<p>以下のリンクをクリックして新しいパスワードを設定してください：</p>
<p><a href="https://suno-ai-complete-builder.vercel.app/auth-callback?token_hash={{ .TokenHash }}&type=recovery">パスワードをリセットする</a></p>
```

### 6. Google OAuth設定（オプション）

1. **Providers** タブを選択
2. **Google** を有効化
3. **Google OAuth設定**：
   - Client ID: `YOUR_GOOGLE_CLIENT_ID`
   - Client Secret: `YOUR_GOOGLE_CLIENT_SECRET`
   - Redirect URL: `https://ncarwqyhpohybnignsxq.supabase.co/auth/v1/callback`

## 🔧 認証コールバック処理

`auth-callback.html` ファイルを作成して、メール確認後の処理を行います：

```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>認証処理中... - Suno AI Complete Builder</title>
    <script src="https://unpkg.com/@supabase/supabase-js@2"></script>
    <script src="config.js"></script>
</head>
<body>
    <div style="text-align: center; padding: 50px;">
        <h2>認証処理中...</h2>
        <p>少々お待ちください</p>
    </div>
    
    <script>
        // URLパラメータから認証情報を取得
        const urlParams = new URLSearchParams(window.location.search);
        const tokenHash = urlParams.get('token_hash');
        const type = urlParams.get('type');
        
        if (tokenHash && type) {
            // Supabaseクライアント初期化
            const supabase = window.supabase.createClient(
                window.SUNO_CONFIG.supabase.url,
                window.SUNO_CONFIG.supabase.anonKey
            );
            
            // セッション確認
            supabase.auth.verifyOtp({
                token_hash: tokenHash,
                type: type
            }).then(({ data, error }) => {
                if (error) {
                    console.error('Auth verification error:', error);
                    window.location.href = '/login.html?error=verification_failed';
                } else {
                    console.log('Auth verification successful');
                    window.location.href = '/';
                }
            });
        } else {
            // パラメータが不正な場合はログインページへ
            window.location.href = '/login.html?error=invalid_link';
        }
    </script>
</body>
</html>
```

## ⚠️ 重要な注意事項

1. **Site URLは必ず本番URLに設定**してください
2. **Redirect URLsには本番URLのみ**を含めてください
3. **Email Templatesのリンクも本番URL**に設定してください
4. 設定変更後は**必ずテスト**を行ってください

## 🔍 トラブルシューティング

### メール確認リンクがlocalhostに飛ぶ場合
- Site URLとRedirect URLsを確認
- Email Templatesのリンクを確認
- Supabaseの設定を保存後、数分待つ

### メール確認後にエラーが出る場合
- `auth-callback.html`が正しく配置されているか確認
- URLパラメータが正しく渡されているか確認

### Google OAuth設定でエラーが出る場合
- Google Cloud Consoleでの設定を確認
- Redirect URIが正しく設定されているか確認

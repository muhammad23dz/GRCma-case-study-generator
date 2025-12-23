$content = 'DATABASE_URL="postgresql://neondb_owner:npg_8NwTXPqIzYL9@ep-ancient-union-aejrw81n-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"'
Set-Content -Path .env -Value $content

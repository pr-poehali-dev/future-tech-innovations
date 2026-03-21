import json
import os
import psycopg2


def handler(event: dict, context) -> dict:
    """Получение и добавление историй пользователей."""
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400',
            },
            'body': '',
        }

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    if event.get('httpMethod') == 'GET':
        params = event.get('queryStringParameters') or {}
        offset = int(params.get('offset', 0))
        limit = int(params.get('limit', 6))

        cur.execute(
            "SELECT id, category, text, reactions, comments_count, created_at FROM stories ORDER BY created_at DESC LIMIT %s OFFSET %s",
            (limit, offset)
        )
        rows = cur.fetchall()
        cur.execute("SELECT COUNT(*) FROM stories")
        total = cur.fetchone()[0]
        cur.close()
        conn.close()

        stories = []
        for row in rows:
            created_at = row[5]
            stories.append({
                'id': row[0],
                'category': row[1],
                'text': row[2],
                'reactions': row[3],
                'comments_count': row[4],
                'created_at': created_at.isoformat() if created_at else None,
            })

        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'stories': stories, 'total': total}),
        }

    if event.get('httpMethod') == 'POST':
        body = json.loads(event.get('body') or '{}')
        category = body.get('category', '').strip()
        text = body.get('text', '').strip()

        if not category or not text:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'category и text обязательны'}),
            }

        if len(text) > 1000:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Текст не может быть длиннее 1000 символов'}),
            }

        cur.execute(
            "INSERT INTO stories (category, text) VALUES (%s, %s) RETURNING id, created_at",
            (category, text)
        )
        row = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()

        return {
            'statusCode': 201,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'id': row[0], 'created_at': row[1].isoformat()}),
        }

    cur.close()
    conn.close()
    return {
        'statusCode': 405,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'}),
    }

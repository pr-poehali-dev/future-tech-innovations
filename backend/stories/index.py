import json
import os
import psycopg2


def to_iso(dt):
    """Конвертирует naive datetime (хранится в БД как UTC) в ISO-строку с суффиксом Z."""
    if not dt:
        return None
    return dt.isoformat() + 'Z'


def handler(event: dict, context) -> dict:
    """Получение списка историй, одной истории, добавление истории, реакции и комментариев."""
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400',
            },
            'body': '',
        }

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    params = event.get('queryStringParameters') or {}
    story_id = params.get('id')
    action = params.get('action')

    if event.get('httpMethod') == 'GET':
        if story_id and action == 'comments':
            cur.execute(
                "SELECT id, text, created_at FROM story_comments WHERE story_id = %s ORDER BY created_at ASC",
                (story_id,)
            )
            rows = cur.fetchall()
            cur.close()
            conn.close()
            comments = [
                {'id': r[0], 'text': r[1], 'created_at': to_iso(r[2])}
                for r in rows
            ]
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'comments': comments}, ensure_ascii=False),
            }

        if story_id:
            cur.execute(
                "SELECT id, category, text, reactions, comments_count, created_at, owner_token FROM stories WHERE id = %s",
                (story_id,)
            )
            row = cur.fetchone()
            cur.close()
            conn.close()
            if not row:
                return {
                    'statusCode': 404,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'История не найдена'}, ensure_ascii=False),
                }
            owner_token = params.get('owner_token')
            story = {
                'id': row[0],
                'category': row[1],
                'text': row[2],
                'reactions': row[3],
                'comments_count': row[4],
                'created_at': to_iso(row[5]),
                'is_owner': bool(row[6]) and owner_token == row[6],
            }
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'story': story}, ensure_ascii=False),
            }

        offset = int(params.get('offset', 0))
        limit = int(params.get('limit', 6))
        category = params.get('category')

        if category and category != 'Все':
            cur.execute(
                "SELECT id, category, text, reactions, comments_count, created_at FROM stories WHERE category = %s ORDER BY created_at DESC LIMIT %s OFFSET %s",
                (category, limit, offset)
            )
            rows = cur.fetchall()
            cur.execute("SELECT COUNT(*) FROM stories WHERE category = %s", (category,))
            total = cur.fetchone()[0]
        else:
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
            stories.append({
                'id': row[0],
                'category': row[1],
                'text': row[2],
                'reactions': row[3],
                'comments_count': row[4],
                'created_at': to_iso(row[5]),
            })

        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'stories': stories, 'total': total}, ensure_ascii=False),
        }

    if event.get('httpMethod') == 'POST':
        body = json.loads(event.get('body') or '{}')

        if action == 'react' and story_id:
            cur.execute(
                "UPDATE stories SET reactions = reactions + 1 WHERE id = %s RETURNING reactions",
                (story_id,)
            )
            row = cur.fetchone()
            conn.commit()
            cur.close()
            conn.close()
            if not row:
                return {
                    'statusCode': 404,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'История не найдена'}, ensure_ascii=False),
                }
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'reactions': row[0]}, ensure_ascii=False),
            }

        if action == 'report' and story_id:
            comment_id = body.get('comment_id')
            cur.execute(
                "INSERT INTO content_reports (story_id, comment_id) VALUES (%s, %s) RETURNING id",
                (story_id, comment_id)
            )
            row = cur.fetchone()
            conn.commit()
            cur.close()
            conn.close()
            return {
                'statusCode': 201,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'id': row[0]}, ensure_ascii=False),
            }

        if action == 'comment' and story_id:
            comment_text = body.get('text', '').strip()
            if not comment_text:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'Текст комментария обязателен'}, ensure_ascii=False),
                }
            if len(comment_text) > 500:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'Комментарий не может быть длиннее 500 символов'}, ensure_ascii=False),
                }
            cur.execute(
                "INSERT INTO story_comments (story_id, text) VALUES (%s, %s) RETURNING id, created_at",
                (story_id, comment_text)
            )
            row = cur.fetchone()
            cur.execute(
                "UPDATE stories SET comments_count = comments_count + 1 WHERE id = %s",
                (story_id,)
            )
            conn.commit()
            cur.close()
            conn.close()
            return {
                'statusCode': 201,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'id': row[0], 'created_at': to_iso(row[1])}, ensure_ascii=False),
            }

        category = body.get('category', '').strip()
        text = body.get('text', '').strip()
        owner_token = body.get('owner_token', '').strip() or None

        if not category or not text:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'category и text обязательны'}, ensure_ascii=False),
            }

        if len(text) > 1000:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Текст не может быть длиннее 1000 символов'}, ensure_ascii=False),
            }

        cur.execute(
            "INSERT INTO stories (category, text, owner_token) VALUES (%s, %s, %s) RETURNING id, created_at",
            (category, text, owner_token)
        )
        row = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()

        return {
            'statusCode': 201,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'id': row[0], 'created_at': to_iso(row[1])}, ensure_ascii=False),
        }

    if event.get('httpMethod') == 'PUT' and story_id:
        body = json.loads(event.get('body') or '{}')
        owner_token = body.get('owner_token', '').strip()
        category = body.get('category', '').strip()
        text = body.get('text', '').strip()

        if not owner_token:
            cur.close()
            conn.close()
            return {
                'statusCode': 403,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Нет доступа к редактированию'}, ensure_ascii=False),
            }

        if not category or not text:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'category и text обязательны'}, ensure_ascii=False),
            }

        if len(text) > 1000:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Текст не может быть длиннее 1000 символов'}, ensure_ascii=False),
            }

        cur.execute(
            "UPDATE stories SET category = %s, text = %s WHERE id = %s AND owner_token = %s RETURNING id",
            (category, text, story_id, owner_token)
        )
        row = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()

        if not row:
            return {
                'statusCode': 403,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Нет доступа к редактированию'}, ensure_ascii=False),
            }

        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'id': row[0]}, ensure_ascii=False),
        }

    if event.get('httpMethod') == 'DELETE' and story_id:
        owner_token = params.get('owner_token', '').strip()

        if not owner_token:
            cur.close()
            conn.close()
            return {
                'statusCode': 403,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Нет доступа к удалению'}, ensure_ascii=False),
            }

        cur.execute(
            "SELECT id FROM stories WHERE id = %s AND owner_token = %s",
            (story_id, owner_token)
        )
        found = cur.fetchone()
        if not found:
            cur.close()
            conn.close()
            return {
                'statusCode': 403,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Нет доступа к удалению'}, ensure_ascii=False),
            }

        cur.execute("DELETE FROM story_comments WHERE story_id = %s", (story_id,))
        cur.execute("DELETE FROM stories WHERE id = %s", (story_id,))
        conn.commit()
        cur.close()
        conn.close()

        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'success': True}, ensure_ascii=False),
        }

    cur.close()
    conn.close()
    return {
        'statusCode': 405,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'body': json.dumps({'error': 'Method not allowed'}, ensure_ascii=False),
    }
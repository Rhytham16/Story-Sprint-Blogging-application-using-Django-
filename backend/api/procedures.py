from django.db import connection


def call_procedure_fetch_all(name, params=None):
    with connection.cursor() as cursor:
        cursor.callproc(name, params or [])
        columns = [col[0] for col in cursor.description]
        rows = cursor.fetchall()
    return [dict(zip(columns, row)) for row in rows]


def call_procedure_fetch_one(name, params=None):
    rows = call_procedure_fetch_all(name, params)
    return rows[0] if rows else None

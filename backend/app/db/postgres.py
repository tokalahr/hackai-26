import psycopg2
from psycopg2 import pool
from app.config import Config

class PostgresDB:
    def __init__(self):
        self.connection_pool = pool.SimpleConnectionPool(
            1, 20, Config.POSTGRES_URI
        )

    def get_connection(self):
        return self.connection_pool.getconn()

    def release_connection(self, connection):
        self.connection_pool.putconn(connection)

    def close_all_connections(self):
        self.connection_pool.closeall()

# Singleton instance
postgres_instance = PostgresDB()

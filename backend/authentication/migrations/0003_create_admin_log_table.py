from django.db import migrations

def create_admin_log_table(apps, schema_editor):
    """
    Create django_admin_log table that references our custom User model
    """
    with schema_editor.connection.cursor() as cursor:
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS django_admin_log (
                id SERIAL PRIMARY KEY,
                action_time TIMESTAMP WITH TIME ZONE NOT NULL,
                object_id TEXT,
                object_repr VARCHAR(200) NOT NULL,
                action_flag SMALLINT NOT NULL CHECK (action_flag >= 0),
                change_message TEXT NOT NULL,
                content_type_id INTEGER,
                user_id INTEGER NOT NULL,
                FOREIGN KEY (content_type_id) REFERENCES django_content_type (id) DEFERRABLE INITIALLY DEFERRED,
                FOREIGN KEY (user_id) REFERENCES users (id) DEFERRABLE INITIALLY DEFERRED
            );
        """)
        print("✅ Created django_admin_log table with reference to custom User model")

def reverse_create_admin_log_table(apps, schema_editor):
    """
    Drop the admin log table
    """
    with schema_editor.connection.cursor() as cursor:
        cursor.execute("DROP TABLE IF EXISTS django_admin_log CASCADE;")
        print("🗑️  Dropped django_admin_log table")

class Migration(migrations.Migration):
    
    dependencies = [
        ('authentication', '0001_initial'),
        ('contenttypes', '0001_initial'),  # Ensure content types exist first
    ]

    operations = [
        migrations.RunSQL(
            sql="""
                CREATE TABLE IF NOT EXISTS django_admin_log (
                    id SERIAL PRIMARY KEY,
                    action_time TIMESTAMP WITH TIME ZONE NOT NULL,
                    object_id TEXT,
                    object_repr VARCHAR(200) NOT NULL,
                    action_flag SMALLINT NOT NULL CHECK (action_flag >= 0),
                    change_message TEXT NOT NULL,
                    content_type_id INTEGER,
                    user_id INTEGER NOT NULL,
                    FOREIGN KEY (content_type_id) REFERENCES django_content_type (id) DEFERRABLE INITIALLY DEFERRED,
                    FOREIGN KEY (user_id) REFERENCES users (id) DEFERRABLE INITIALLY DEFERRED
                );
            """,
            reverse_sql="DROP TABLE IF EXISTS django_admin_log CASCADE;"
        ),
    ]
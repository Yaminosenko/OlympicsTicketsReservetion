#!/usr/bin/env python
import os
import sys


def main():
    """Run administrative tasks."""
    # Utilise la variable d'environnement si elle existe, sinon la valeur par défaut
    settings_module = os.environ.get('DJANGO_SETTINGS_MODULE', 'config.settings')
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', settings_module)

    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
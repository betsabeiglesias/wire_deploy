# show_urls.py
import os
import django
from django.urls import URLPattern, URLResolver

# Ajusta la ruta a tu settings
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from django.urls import get_resolver

def list_urls(lis, prefix=''):
    for entry in lis:
        if isinstance(entry, URLPattern):
            # path + view
            print(f"{prefix}{entry.pattern} -> {entry.lookup_str}")
        elif isinstance(entry, URLResolver):
            # recursión en include
            list_urls(entry.url_patterns, prefix + str(entry.pattern))

if __name__ == "__main__":
    resolver = get_resolver()
    print("\n--- Todas las URLs de tu proyecto ---\n")
    list_urls(resolver.url_patterns)
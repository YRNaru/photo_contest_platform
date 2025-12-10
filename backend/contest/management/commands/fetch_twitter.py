"""
Twitterから投稿を取得する管理コマンド
"""

from django.core.management.base import BaseCommand
from contest.twitter_integration import fetch_all_active_contests


class Command(BaseCommand):
    help = "Fetch tweets from Twitter for active contests"

    def add_arguments(self, parser):
        parser.add_argument(
            "--contest",
            type=str,
            help="Contest slug to fetch tweets for (optional)",
        )

    def handle(self, **options):
        contest_slug = options.get("contest")

        if contest_slug:
            from contest.models import Contest
            from contest.twitter_integration import TwitterFetcher

            try:
                contest = Contest.objects.get(slug=contest_slug)
                fetcher = TwitterFetcher()
                count = fetcher.fetch_and_create_entries(contest)
                self.stdout.write(self.style.SUCCESS(f"Successfully fetched {count} entries for contest {contest_slug}"))
            except Contest.DoesNotExist:
                self.stdout.write(self.style.ERROR(f"Contest {contest_slug} not found"))
        else:
            results = fetch_all_active_contests()
            total = sum(results.values())
            self.stdout.write(self.style.SUCCESS(f"Successfully fetched {total} entries across {len(results)} contests"))
            for slug, count in results.items():
                self.stdout.write(f"  {slug}: {count} entries")

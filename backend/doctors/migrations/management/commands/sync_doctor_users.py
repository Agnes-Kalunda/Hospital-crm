from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from doctors.models import Doctor

User = get_user_model()

class Command(BaseCommand):
    help = 'Dynamically sync doctor users with doctor records'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be synced without making changes',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        
        if dry_run:
            self.stdout.write(self.style.WARNING('🔍 DRY RUN MODE - No changes will be made\n'))
        
        # Link by email matching
        unlinked_users = User.objects.filter(role='DOCTOR', doctor__isnull=True)
        email_links = 0
        fallback_links = 0
        
        for user in unlinked_users:
            if user.email:
                try:
                    doctor = Doctor.objects.get(email=user.email, user__isnull=True)
                    
                    if not dry_run:
                        doctor.user = user
                        doctor.save()
                    
                    email_links += 1
                    self.stdout.write(
                        self.style.SUCCESS(f"{'📋 Would link' if dry_run else '✅ Linked'} '{user.username}' to Dr. {doctor.first_name} {doctor.last_name} (email match)")
                    )
                    
                except Doctor.DoesNotExist:
                    pass  
                except Doctor.MultipleObjectsReturned:
                    self.stdout.write(
                        self.style.WARNING(f"⚠️  Multiple doctors with email '{user.email}' - skipping '{user.username}'")
                    )
        
        
        remaining_users = User.objects.filter(role='DOCTOR', doctor__isnull=True)
        remaining_doctors = Doctor.objects.filter(user__isnull=True)
        
        for i, user in enumerate(remaining_users):
            if i < remaining_doctors.count():
                doctor = remaining_doctors[i]
                
                if not dry_run:
                    doctor.user = user
                    doctor.save()
                
                fallback_links += 1
                self.stdout.write(
                    self.style.SUCCESS(f"{'📋 Would link' if dry_run else '✅ Linked'} '{user.username}' to Dr. {doctor.first_name} {doctor.last_name} (fallback)")
                )
        
        # Summary
        self.stdout.write(f"\n📊 Summary:")
        self.stdout.write(f"   - {email_links} links by email matching")
        self.stdout.write(f"   - {fallback_links} fallback links")
        
        final_unlinked_users = User.objects.filter(role='DOCTOR', doctor__isnull=True).count()
        final_unlinked_doctors = Doctor.objects.filter(user__isnull=True).count()
        
        if final_unlinked_users > 0:
            self.stdout.write(f"   - {final_unlinked_users} users remain unlinked")
        if final_unlinked_doctors > 0:
            self.stdout.write(f"   - {final_unlinked_doctors} doctors remain unlinked")
        
        if dry_run:
            self.stdout.write(f"\n💡 Run without --dry-run to make actual changes")
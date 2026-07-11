from django.db import models

class Lead(models.Model):
    created_at = models.CharField(max_length=255, null=True, blank=True)
    name = models.CharField(max_length=255, null=True, blank=True)
    email = models.EmailField(null=True, blank=True)
    country_code = models.CharField(max_length=10, null=True, blank=True)
    mobile_without_country_code = models.CharField(max_length=20, null=True, blank=True)
    company = models.CharField(max_length=255, null=True, blank=True)
    city = models.CharField(max_length=255, null=True, blank=True)
    state = models.CharField(max_length=255, null=True, blank=True)
    country = models.CharField(max_length=255, null=True, blank=True)
    lead_owner = models.CharField(max_length=255, null=True, blank=True)
    crm_status = models.CharField(max_length=255, null=True, blank=True)
    crm_note = models.TextField(null=True, blank=True)
    data_source = models.CharField(max_length=255, null=True, blank=True)
    possession_time = models.CharField(max_length=255, null=True, blank=True)
    description = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.name} - {self.email}"

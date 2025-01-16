from django.db import models
from users.models import User
from bookings.models import Booking

class UserMessage(models.Model):
    MESSAGE_STATUS_CHOICES = [
        ('sent', 'Sent'),
        ('read', 'Read'),
        ('action_required', 'Action Required'),
    ]

    message_id = models.AutoField(primary_key=True)
    conversation = models.ForeignKey('conversations.Conversation', on_delete=models.CASCADE)
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    booking = models.ForeignKey(Booking, null=True, blank=True, on_delete=models.SET_NULL)
    status = models.CharField(max_length=20, choices=MESSAGE_STATUS_CHOICES, default='sent')
    is_booking_request = models.BooleanField(default=False)
    metadata = models.JSONField(null=True, blank=True)

    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'Message'
        verbose_name_plural = 'Messages'

    def __str__(self):
        return f'Message from {self.sender} at {self.timestamp}'

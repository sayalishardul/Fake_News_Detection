from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("detection", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="predictionhistory",
            name="source_url",
            field=models.URLField(blank=True, default="", max_length=2048),
        ),
    ]

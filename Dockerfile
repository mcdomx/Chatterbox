FROM python:3.6-slim-stretch
MAINTAINER Mark McDonald "mcdomx@me.com"

# Set environment variables
ENV FLASK_APP=application.py
ENV FLASK_ENV=production
ENV FLASK_DEBUG=1

# Install requirements
COPY ./requirements.txt /app/requirements.txt
WORKDIR /app
RUN pip install -r requirements.txt

# Copy application files
COPY application.py /app/application.py
RUN chmod 644 /app/application.py
COPY classes.py /app/classes.py
RUN chmod +x /app/classes.py

COPY static /app/static/
COPY templates /app/templates/

ENTRYPOINT ["python"]
CMD ["application.py"]

# Run Flask application
# COPY run.sh ./run.sh
# RUN chmod +x run.sh
# CMD ./run.sh


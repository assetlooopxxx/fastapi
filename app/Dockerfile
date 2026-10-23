FROM python:3.12-slim

WORKDIR /srv/app

RUN pip install --no-cache-dir fastapi "uvicorn[standard]"

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

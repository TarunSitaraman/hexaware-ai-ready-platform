.PHONY: setup run stop clean test seed

setup:
	pip install -r backend/requirements.txt
	cd frontend && npm install

run:
	docker-compose up

run-dev:
	# Terminal 1: backend
	cd backend && uvicorn app.main:app --reload --port 8000 &
	# Terminal 2: frontend
	cd frontend && npm run dev

stop:
	docker-compose down

clean:
	docker-compose down -v
	rm -rf data/
	rm -rf frontend/.next/

test:
	cd backend && python -m pytest tests/ -v
	cd frontend && npm run lint

seed:
	cd sample-data && python generate_data.py

build:
	cd frontend && npm run build